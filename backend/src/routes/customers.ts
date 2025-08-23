import { Router, Request, Response } from 'express';
import { CustomerService } from '../services/customerService';
import { CustomerStatus } from '@prisma/client';

const router = Router();

// GET /api/customers - Get all customers with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      regionId,
      status,
      search,
      page = '1',
      limit = '50'
    } = req.query;

    const filters = {
      regionId: regionId as string,
      status: status as CustomerStatus,
      search: search as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await CustomerService.getCustomers(filters);
    
    return res.json({
      success: true,
      data: result.customers,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

// GET /api/customers/stats - Get customer statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await CustomerService.getCustomerStats();
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer statistics'
    });
  }
});

// GET /api/customers/regions - Get all unique regions
router.get('/regions', async (_req: Request, res: Response) => {
  try {
    const regions = await CustomerService.getRegions();
    
    return res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch regions'
    });
  }
});

// GET /api/customers/search/company/:businessName - Search by business name
router.get('/search/company/:businessName', async (req: Request, res: Response) => {
  try {
    const { businessName } = req.params;
    const customers = await CustomerService.searchByCompany(businessName);
    
    return res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error searching customers by company:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search customers by company'
    });
  }
});

// GET /api/customers/region/:regionId - Get customers by region
router.get('/region/:regionId', async (req: Request, res: Response) => {
  try {
    const { regionId } = req.params;
    const customers = await CustomerService.getCustomersByRegion(regionId);
    
    return res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers by region:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customers by region'
    });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await CustomerService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    return res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      contactName,
      businessName,
      email,
      phone,
      street,
      city,
      province,
      postalCode,
      regionId,
      status,
      notes
    } = req.body;

    // Basic validation
    if (!contactName || !businessName || !email || !phone || !street || !city || !postalCode || !regionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contactName, businessName, email, phone, street, city, postalCode, regionId'
      });
    }

    const customerData = {
      contactName: contactName.trim(),
      businessName: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      province: province?.trim() || 'BC',
      postalCode: postalCode.trim(),
      regionId: regionId.trim(),
      status: status || CustomerStatus.ACTIVE,
      notes: notes?.trim() || null
    };

    const customer = await CustomerService.createCustomer(customerData);
    
    return res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      contactName,
      businessName,
      email,
      phone,
      street,
      city,
      province,
      postalCode,
      regionId,
      status,
      notes
    } = req.body;

    const updateData: any = {};

    // Only update provided fields
    if (contactName !== undefined) updateData.contactName = contactName.trim();
    if (businessName !== undefined) updateData.businessName = businessName.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (street !== undefined) updateData.street = street.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (province !== undefined) updateData.province = province.trim();
    if (postalCode !== undefined) updateData.postalCode = postalCode.trim();
    if (regionId !== undefined) updateData.regionId = regionId.trim();
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

    const customer = await CustomerService.updateCustomer(id, updateData);
    
    return res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error instanceof Error && error.message === 'Customer not found') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
});

// DELETE /api/customers/:id - Soft delete customer (set to INACTIVE)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await CustomerService.deleteCustomer(id);
    
    return res.json({
      success: true,
      data: customer,
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    if (error instanceof Error && error.message === 'Customer not found') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to deactivate customer'
    });
  }
});

// DELETE /api/customers/:id/hard - Hard delete customer (permanent removal)
router.delete('/:id/hard', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CustomerService.hardDeleteCustomer(id);
    
    return res.json({
      success: true,
      message: 'Customer permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting customer:', error);
    if (error instanceof Error && error.message === 'Customer not found') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
});

// POST /api/customers/bulk-update - Bulk update customers
router.post('/bulk-update', async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: 'Updates must be an array'
      });
    }

    const result = await CustomerService.bulkUpdateCustomers(updates);
    
    return res.json({
      success: true,
      data: result,
      message: `Bulk update completed: ${result.successful} successful, ${result.failed} failed`
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform bulk update'
    });
  }
});

export default router;
