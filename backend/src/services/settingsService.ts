import { PrismaClient, Settings, Prisma } from '@prisma/client';
import {
  CompanyInfo,
  ServicePricing,
  TaxRates,
  InvoiceDefaults,
  ServiceType,
  DEFAULT_COMPANY_INFO,
  DEFAULT_SERVICE_PRICING,
  DEFAULT_TAX_RATES,
  DEFAULT_INVOICE_SETTINGS
} from 'cbg-shared';

const prisma = new PrismaClient();

export class SettingsService {
  static async getCompanyInfo(regionId?: string): Promise<CompanyInfo> {
    const setting = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'company_info',
        regionId: regionId || null
      }
    });

    if (setting && setting.value) {
      return setting.value as any as CompanyInfo;
    }

    return DEFAULT_COMPANY_INFO;
  }

  static async updateCompanyInfo(
    companyInfo: Partial<CompanyInfo>,
    regionId?: string
  ): Promise<CompanyInfo> {
    const currentInfo = await this.getCompanyInfo(regionId);
    const updatedInfo = { ...currentInfo, ...companyInfo };

    const existing = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'company_info',
        regionId: regionId || null
      }
    });

    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data: {
          value: updatedInfo as Prisma.JsonValue
        }
      });
    } else {
      await prisma.settings.create({
        data: {
          category: 'invoice',
          key: 'company_info',
          value: updatedInfo as Prisma.JsonValue,
          regionId: regionId || null,
          description: 'Company information for invoices',
          isSystem: true
        }
      });
    }

    return updatedInfo;
  }

  static async getServicePricing(regionId?: string): Promise<Record<ServiceType, ServicePricing>> {
    const setting = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'service_pricing',
        regionId: regionId || null
      }
    });

    if (setting && setting.value) {
      const pricing = setting.value as any;
      const result: Record<ServiceType, ServicePricing> = {} as any;
      
      Object.keys(ServiceType).forEach(key => {
        const serviceType = ServiceType[key as keyof typeof ServiceType];
        if (pricing[serviceType]) {
          result[serviceType] = {
            serviceType,
            unitPrice: pricing[serviceType].unitPrice,
            description: pricing[serviceType].description
          };
        }
      });

      return result;
    }

    const defaultPricing: Record<ServiceType, ServicePricing> = {} as any;
    DEFAULT_SERVICE_PRICING.forEach(pricing => {
      defaultPricing[pricing.serviceType] = pricing;
    });
    
    return defaultPricing;
  }

  static async updateServicePricing(
    serviceType: ServiceType,
    pricing: Partial<ServicePricing>,
    regionId?: string
  ): Promise<ServicePricing> {
    const currentPricing = await this.getServicePricing(regionId);
    const updatedService = {
      ...currentPricing[serviceType],
      ...pricing,
      serviceType
    };
    
    currentPricing[serviceType] = updatedService;

    const pricingData: any = {};
    Object.values(currentPricing).forEach((p: ServicePricing) => {
      pricingData[p.serviceType] = {
        unitPrice: p.unitPrice,
        description: p.description
      };
    });

    const existing = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'service_pricing',
        regionId: regionId || null
      }
    });

    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data: {
          value: pricingData as Prisma.JsonValue
        }
      });
    } else {
      await prisma.settings.create({
        data: {
          category: 'invoice',
          key: 'service_pricing',
          value: pricingData as Prisma.JsonValue,
          regionId: regionId || null,
          description: 'Service pricing configuration',
          isSystem: true
        }
      });
    }

    return updatedService;
  }

  static async getTaxRates(regionId?: string): Promise<TaxRates> {
    const setting = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'tax_rates',
        regionId: regionId || null
      }
    });

    if (setting && setting.value) {
      const rates = setting.value as any;
      return {
        gst: rates.gst || DEFAULT_TAX_RATES.gst,
        pst: rates.pst || DEFAULT_TAX_RATES.pst
      };
    }

    return DEFAULT_TAX_RATES;
  }

  static async updateTaxRates(
    taxRates: Partial<TaxRates>,
    regionId?: string
  ): Promise<TaxRates> {
    const currentRates = await this.getTaxRates(regionId);
    const updatedRates = { ...currentRates, ...taxRates };

    const existing = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'tax_rates',
        regionId: regionId || null
      }
    });

    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data: {
          value: updatedRates as Prisma.JsonValue
        }
      });
    } else {
      await prisma.settings.create({
        data: {
          category: 'invoice',
          key: 'tax_rates',
          value: updatedRates as Prisma.JsonValue,
          regionId: regionId || null,
          description: 'Tax rates configuration',
          isSystem: true
        }
      });
    }

    return updatedRates;
  }

  static async getInvoiceDefaults(regionId?: string): Promise<InvoiceDefaults> {
    const setting = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'defaults',
        regionId: regionId || null
      }
    });

    if (setting && setting.value) {
      const defaults = setting.value as any;
      return {
        nextInvoiceNumber: defaults.nextInvoiceNumber || DEFAULT_INVOICE_SETTINGS.nextInvoiceNumber,
        paymentTermsDays: defaults.paymentTermsDays || DEFAULT_INVOICE_SETTINGS.paymentTermsDays,
        defaultNotes: defaults.defaultNotes,
        emailSubject: defaults.emailSubject,
        emailBody: defaults.emailBody
      };
    }

    return DEFAULT_INVOICE_SETTINGS;
  }

  static async updateInvoiceDefaults(
    defaults: Partial<InvoiceDefaults>,
    regionId?: string
  ): Promise<InvoiceDefaults> {
    const currentDefaults = await this.getInvoiceDefaults(regionId);
    const updatedDefaults = { ...currentDefaults, ...defaults };

    const existing = await prisma.settings.findFirst({
      where: {
        category: 'invoice',
        key: 'defaults',
        regionId: regionId || null
      }
    });

    if (existing) {
      await prisma.settings.update({
        where: { id: existing.id },
        data: {
          value: updatedDefaults as Prisma.JsonValue
        }
      });
    } else {
      await prisma.settings.create({
        data: {
          category: 'invoice',
          key: 'defaults',
          value: updatedDefaults as Prisma.JsonValue,
          regionId: regionId || null,
          description: 'Invoice default settings',
          isSystem: false
        }
      });
    }

    if (defaults.nextInvoiceNumber && regionId) {
      await prisma.invoiceSequence.upsert({
        where: { regionId },
        update: {
          lastInvoiceNumber: defaults.nextInvoiceNumber - 1
        },
        create: {
          regionId,
          lastInvoiceNumber: defaults.nextInvoiceNumber - 1
        }
      });
    }

    return updatedDefaults;
  }

  static async getAllSettings(regionId?: string): Promise<{
    companyInfo: CompanyInfo;
    servicePricing: Record<ServiceType, ServicePricing>;
    taxRates: TaxRates;
    invoiceDefaults: InvoiceDefaults;
  }> {
    const [companyInfo, servicePricing, taxRates, invoiceDefaults] = await Promise.all([
      this.getCompanyInfo(regionId),
      this.getServicePricing(regionId),
      this.getTaxRates(regionId),
      this.getInvoiceDefaults(regionId)
    ]);

    return {
      companyInfo,
      servicePricing,
      taxRates,
      invoiceDefaults
    };
  }

  static async getSetting(category: string, key: string, regionId?: string): Promise<any> {
    const setting = await prisma.settings.findFirst({
      where: {
        category,
        key,
        regionId: regionId || null
      }
    });

    return setting?.value || null;
  }

  static async updateSetting(
    category: string,
    key: string,
    value: any,
    regionId?: string,
    description?: string
  ): Promise<Settings> {
    const existing = await prisma.settings.findFirst({
      where: {
        category,
        key,
        regionId: regionId || null
      }
    });

    if (existing) {
      return await prisma.settings.update({
        where: { id: existing.id },
        data: {
          value: value as Prisma.JsonValue,
          description
        }
      });
    } else {
      return await prisma.settings.create({
        data: {
          category,
          key,
          value: value as Prisma.JsonValue,
          regionId: regionId || null,
          description,
          isSystem: false
        }
      });
    }
  }

  static async deleteSetting(category: string, key: string, regionId?: string): Promise<void> {
    const setting = await prisma.settings.findFirst({
      where: {
        category,
        key,
        regionId: regionId || null
      }
    });

    if (setting && !setting.isSystem) {
      await prisma.settings.delete({
        where: { id: setting.id }
      });
    } else if (setting?.isSystem) {
      throw new Error('Cannot delete system settings');
    }
  }
}