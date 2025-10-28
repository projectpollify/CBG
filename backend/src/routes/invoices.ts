import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';

const router = Router();

// Invoice CRUD operations
router.post('/', InvoiceController.createInvoice);
router.get('/', InvoiceController.getInvoices);
router.get('/stats', InvoiceController.getInvoiceStats);
router.get('/:id', InvoiceController.getInvoice);
router.put('/:id', InvoiceController.updateInvoice);
router.delete('/:id', InvoiceController.deleteInvoice);

// Invoice actions
router.post('/:id/send', InvoiceController.sendInvoice);
router.post('/:id/pay', InvoiceController.payInvoice);

// Customer invoices
router.get('/customer/:customerId', InvoiceController.getCustomerInvoices);

// Maintenance
router.post('/update-overdue', InvoiceController.updateOverdueInvoices);

// Settings endpoints
router.get('/settings/company-info', InvoiceController.getCompanyInfo);
router.put('/settings/company-info', InvoiceController.updateCompanyInfo);

router.get('/settings/service-pricing', InvoiceController.getServicePricing);
router.put('/settings/service-pricing/:serviceType', InvoiceController.updateServicePricing);

router.get('/settings/tax-rates', InvoiceController.getTaxRates);
router.put('/settings/tax-rates', InvoiceController.updateTaxRates);

router.get('/settings/defaults', InvoiceController.getInvoiceDefaults);
router.put('/settings/defaults', InvoiceController.updateInvoiceDefaults);

router.get('/settings/all', InvoiceController.getAllSettings);

export default router;