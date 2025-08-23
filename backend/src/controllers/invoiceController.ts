import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { SettingsService } from '../services/settingsService';
import {
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  InvoiceFilter,
  PaymentMethod,
  InvoiceStatus,
  ServiceType
} from 'cbg-shared';

export class InvoiceController {
  static async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateInvoiceDTO = req.body;
      const regionId = req.query.regionId as string || 'BC';
      const userId = (req as any).user?.id || 'system';

      if (!data.customerId) {
        res.status(400).json({ error: 'Customer ID is required' });
        return;
      }

      if (!data.lineItems || data.lineItems.length === 0) {
        res.status(400).json({ error: 'At least one line item is required' });
        return;
      }

      const invoice = await InvoiceService.createInvoice(data, regionId, userId);
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create invoice'
      });
    }
  }

  static async updateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateInvoiceDTO = req.body;
      const userId = (req as any).user?.id || 'system';

      const invoice = await InvoiceService.updateInvoice(id, data, userId);
      res.json({
        success: true,
        data: invoice
      });
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update invoice'
      });
    }
  }

  static async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoice(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
        return;
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch invoice'
      });
    }
  }

  static async getInvoices(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filter: InvoiceFilter = {
        status: req.query.status as InvoiceStatus,
        customerId: req.query.customerId as string,
        regionId: req.query.regionId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        searchTerm: req.query.search as string
      };

      const { invoices, total } = await InvoiceService.getInvoices(filter, page, limit);
      
      res.json({
        success: true,
        data: invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch invoices'
      });
    }
  }

  static async deleteInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await InvoiceService.deleteInvoice(id);
      
      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete invoice'
      });
    }
  }

  static async sendInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { emailTo } = req.body;

      const invoice = await InvoiceService.markInvoiceAsSent(id, emailTo);
      
      res.json({
        success: true,
        data: invoice,
        message: 'Invoice marked as sent'
      });
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send invoice'
      });
    }
  }

  static async payInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentMethod, paidDate } = req.body;

      if (!paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Payment method is required'
        });
        return;
      }

      const invoice = await InvoiceService.markInvoiceAsPaid(
        id,
        paymentMethod as PaymentMethod,
        paidDate
      );
      
      res.json({
        success: true,
        data: invoice,
        message: 'Invoice marked as paid'
      });
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark invoice as paid'
      });
    }
  }

  static async getInvoiceStats(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const stats = await InvoiceService.getInvoiceStats(regionId, startDate, endDate);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching invoice stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch invoice statistics'
      });
    }
  }

  static async getCustomerInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const invoices = await InvoiceService.getCustomerInvoices(customerId);
      
      res.json({
        success: true,
        data: invoices
      });
    } catch (error: any) {
      console.error('Error fetching customer invoices:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch customer invoices'
      });
    }
  }

  static async updateOverdueInvoices(req: Request, res: Response): Promise<void> {
    try {
      const count = await InvoiceService.updateOverdueInvoices();
      
      res.json({
        success: true,
        message: `Updated ${count} invoices to overdue status`
      });
    } catch (error: any) {
      console.error('Error updating overdue invoices:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update overdue invoices'
      });
    }
  }

  static async getCompanyInfo(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const companyInfo = await SettingsService.getCompanyInfo(regionId);
      
      res.json({
        success: true,
        data: companyInfo
      });
    } catch (error: any) {
      console.error('Error fetching company info:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch company information'
      });
    }
  }

  static async updateCompanyInfo(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const companyInfo = await SettingsService.updateCompanyInfo(req.body, regionId);
      
      res.json({
        success: true,
        data: companyInfo
      });
    } catch (error: any) {
      console.error('Error updating company info:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update company information'
      });
    }
  }

  static async getServicePricing(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const pricing = await SettingsService.getServicePricing(regionId);
      
      res.json({
        success: true,
        data: pricing
      });
    } catch (error: any) {
      console.error('Error fetching service pricing:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch service pricing'
      });
    }
  }

  static async updateServicePricing(req: Request, res: Response): Promise<void> {
    try {
      const { serviceType } = req.params;
      const regionId = req.query.regionId as string;
      
      if (!Object.values(ServiceType).includes(serviceType as ServiceType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid service type'
        });
        return;
      }

      const pricing = await SettingsService.updateServicePricing(
        serviceType as ServiceType,
        req.body,
        regionId
      );
      
      res.json({
        success: true,
        data: pricing
      });
    } catch (error: any) {
      console.error('Error updating service pricing:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update service pricing'
      });
    }
  }

  static async getTaxRates(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const taxRates = await SettingsService.getTaxRates(regionId);
      
      res.json({
        success: true,
        data: taxRates
      });
    } catch (error: any) {
      console.error('Error fetching tax rates:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch tax rates'
      });
    }
  }

  static async updateTaxRates(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const taxRates = await SettingsService.updateTaxRates(req.body, regionId);
      
      res.json({
        success: true,
        data: taxRates
      });
    } catch (error: any) {
      console.error('Error updating tax rates:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update tax rates'
      });
    }
  }

  static async getInvoiceDefaults(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const defaults = await SettingsService.getInvoiceDefaults(regionId);
      
      res.json({
        success: true,
        data: defaults
      });
    } catch (error: any) {
      console.error('Error fetching invoice defaults:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch invoice defaults'
      });
    }
  }

  static async updateInvoiceDefaults(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const defaults = await SettingsService.updateInvoiceDefaults(req.body, regionId);
      
      res.json({
        success: true,
        data: defaults
      });
    } catch (error: any) {
      console.error('Error updating invoice defaults:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update invoice defaults'
      });
    }
  }

  static async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const regionId = req.query.regionId as string;
      const settings = await SettingsService.getAllSettings(regionId);
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('Error fetching all settings:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch settings'
      });
    }
  }
}