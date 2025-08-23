import { PrismaClient, Invoice, InvoiceStatus, Prisma } from '@prisma/client';
import { 
  CreateInvoiceDTO, 
  UpdateInvoiceDTO, 
  InvoiceFilter,
  InvoiceSummary,
  InvoiceLineItem,
  ServiceType,
  PaymentMethod,
  InvoiceCalculator,
  TaxRates,
  DEFAULT_TAX_RATES
} from 'cbg-shared';

const prisma = new PrismaClient();

export class InvoiceService {
  private static async getNextInvoiceNumber(regionId: string): Promise<number> {
    const sequence = await prisma.invoiceSequence.findUnique({
      where: { regionId }
    });

    if (!sequence) {
      await prisma.invoiceSequence.create({
        data: {
          regionId,
          lastInvoiceNumber: 10000
        }
      });
      return 10001;
    }

    const nextNumber = sequence.lastInvoiceNumber + 1;
    
    await prisma.invoiceSequence.update({
      where: { regionId },
      data: { lastInvoiceNumber: nextNumber }
    });

    return nextNumber;
  }

  private static async getTaxRates(): Promise<TaxRates> {
    const taxSettings = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'tax_rates',
        regionId: null
      }
    });

    if (taxSettings && taxSettings.value) {
      const rates = taxSettings.value as any;
      return {
        gst: rates.gst || DEFAULT_TAX_RATES.gst,
        pst: rates.pst || DEFAULT_TAX_RATES.pst
      };
    }

    return DEFAULT_TAX_RATES;
  }

  private static async getPaymentTermsDays(): Promise<number> {
    const defaultSettings = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'defaults',
        regionId: null
      }
    });

    if (defaultSettings && defaultSettings.value) {
      const defaults = defaultSettings.value as any;
      return defaults.paymentTermsDays || 30;
    }

    return 30;
  }

  static async createInvoice(
    data: CreateInvoiceDTO,
    regionId: string,
    userId: string
  ): Promise<Invoice> {
    const invoiceNumber = await this.getNextInvoiceNumber(regionId);
    const taxRates = await this.getTaxRates();
    const paymentTermsDays = await this.getPaymentTermsDays();

    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
    const dueDate = data.dueDate 
      ? new Date(data.dueDate) 
      : InvoiceCalculator.calculateDueDate(invoiceDate, paymentTermsDays);

    const totals = InvoiceCalculator.calculateInvoiceTotals(data.lineItems, taxRates);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        regionId,
        customerId: data.customerId,
        invoiceDate,
        dueDate,
        status: data.status || InvoiceStatus.DRAFT,
        lineItems: data.lineItems as any,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        pstAmount: totals.pstAmount,
        total: totals.total,
        notes: data.notes
      },
      include: {
        customer: true
      }
    });

    return invoice;
  }

  static async updateInvoice(
    id: string,
    data: UpdateInvoiceDTO,
    userId: string
  ): Promise<Invoice> {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    const updateData: Prisma.InvoiceUpdateInput = {};

    if (data.customerId) {
      updateData.customer = { connect: { id: data.customerId } };
    }

    if (data.invoiceDate) {
      updateData.invoiceDate = new Date(data.invoiceDate);
    }

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    if (data.paidDate !== undefined) {
      updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.paymentMethod) {
      updateData.paymentMethod = data.paymentMethod;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.lineItems) {
      const taxRates = await this.getTaxRates();
      const totals = InvoiceCalculator.calculateInvoiceTotals(data.lineItems, taxRates);
      
      updateData.lineItems = data.lineItems as any;
      updateData.subtotal = totals.subtotal;
      updateData.gstAmount = totals.gstAmount;
      updateData.pstAmount = totals.pstAmount;
      updateData.total = totals.total;
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true
      }
    });

    return invoice;
  }

  static async getInvoice(id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true
      }
    });

    return invoice;
  }

  static async getInvoices(
    filter: InvoiceFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const where: Prisma.InvoiceWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter.regionId) {
      where.regionId = filter.regionId;
    }

    if (filter.startDate || filter.endDate) {
      where.invoiceDate = {};
      if (filter.startDate) {
        where.invoiceDate.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.invoiceDate.lte = new Date(filter.endDate);
      }
    }

    if (filter.minAmount || filter.maxAmount) {
      where.total = {};
      if (filter.minAmount) {
        where.total.gte = filter.minAmount;
      }
      if (filter.maxAmount) {
        where.total.lte = filter.maxAmount;
      }
    }

    if (filter.searchTerm) {
      where.OR = [
        { invoiceNumber: { equals: parseInt(filter.searchTerm) || 0 } },
        { customer: { businessName: { contains: filter.searchTerm, mode: 'insensitive' } } },
        { customer: { contactName: { contains: filter.searchTerm, mode: 'insensitive' } } }
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: true
        },
        orderBy: {
          invoiceDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.invoice.count({ where })
    ]);

    return { invoices, total };
  }

  static async deleteInvoice(id: string): Promise<void> {
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Cannot delete paid invoices');
    }

    await prisma.invoice.delete({
      where: { id }
    });
  }

  static async markInvoiceAsSent(
    id: string,
    emailTo?: string
  ): Promise<Invoice> {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
        emailedAt: new Date(),
        emailedTo: emailTo
      },
      include: {
        customer: true
      }
    });

    return invoice;
  }

  static async markInvoiceAsPaid(
    id: string,
    paymentMethod: PaymentMethod,
    paidDate?: Date | string
  ): Promise<Invoice> {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paymentMethod,
        paidDate: paidDate ? new Date(paidDate) : new Date()
      },
      include: {
        customer: true
      }
    });

    return invoice;
  }

  static async updateOverdueInvoices(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.invoice.updateMany({
      where: {
        status: InvoiceStatus.SENT,
        dueDate: {
          lt: today
        }
      },
      data: {
        status: InvoiceStatus.OVERDUE
      }
    });

    return result.count;
  }

  static async getInvoiceStats(
    regionId?: string,
    startDate?: Date | string,
    endDate?: Date | string
  ): Promise<InvoiceSummary> {
    const where: Prisma.InvoiceWhereInput = {};
    
    if (regionId) {
      where.regionId = regionId;
    }

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) {
        where.invoiceDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.invoiceDate.lte = new Date(endDate);
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      select: {
        status: true,
        total: true,
        lineItems: true,
        invoiceDate: true
      }
    });

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === InvoiceStatus.PAID).length;
    const unpaidInvoices = invoices.filter(i => 
      i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.DRAFT
    ).length;
    const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;

    const totalRevenue = invoices
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + Number(i.total), 0);

    const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    const revenueByService: Record<ServiceType, number> = {
      [ServiceType.RESURFACING]: 0,
      [ServiceType.NEW_BOARD]: 0,
      [ServiceType.STAINLESS_INSERT]: 0,
      [ServiceType.STAINLESS_CLAMPS]: 0,
      [ServiceType.BOARD_MODIFICATIONS]: 0,
      [ServiceType.SPECIAL]: 0
    };

    const revenueByMonth: Record<string, number> = {};

    invoices
      .filter(i => i.status === InvoiceStatus.PAID)
      .forEach(invoice => {
        const lineItems = invoice.lineItems as any as InvoiceLineItem[];
        lineItems.forEach(item => {
          if (item.serviceType && revenueByService[item.serviceType] !== undefined) {
            revenueByService[item.serviceType] += item.totalPrice;
          }
        });

        const monthKey = new Date(invoice.invoiceDate).toISOString().slice(0, 7);
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + Number(invoice.total);
      });

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      averageInvoiceValue,
      revenueByService,
      revenueByMonth
    };
  }

  static async getCustomerInvoices(customerId: string): Promise<Invoice[]> {
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      include: {
        customer: true
      },
      orderBy: {
        invoiceDate: 'desc'
      }
    });

    return invoices;
  }

  static async bulkUpdateStatus(
    invoiceIds: string[],
    status: InvoiceStatus
  ): Promise<number> {
    const result = await prisma.invoice.updateMany({
      where: {
        id: { in: invoiceIds }
      },
      data: { status }
    });

    return result.count;
  }
}