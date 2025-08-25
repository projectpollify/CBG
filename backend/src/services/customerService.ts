import { PrismaClient, Customer, CustomerStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCustomerData {
  contactName: string;
  businessName: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  regionId: string;
  status?: CustomerStatus;
  notes?: string;
}

export interface UpdateCustomerData {
  contactName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  regionId?: string;
  status?: CustomerStatus;
  notes?: string;
}

export interface CustomerFilters {
  regionId?: string;
  status?: CustomerStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class CustomerService {
  // Get all customers with optional filtering and pagination
  static async getCustomers(filters: CustomerFilters = {}) {
    const {
      regionId,
      status,
      search,
      page = 1,
      limit = 50
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (regionId) {
      where.regionId = regionId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { contactName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { street: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: 'asc' }, // Active customers first
          { businessName: 'asc' },
          { contactName: 'asc' }
        ]
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { id }
    });
  }

  // Create new customer
  static async createCustomer(data: CreateCustomerData): Promise<Customer> {
    // Set default status if not provided
    const customerData = {
      ...data,
      status: data.status || CustomerStatus.ACTIVE
    };

    return await prisma.customer.create({
      data: customerData
    });
  }

  // Update existing customer
  static async updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer> {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    return await prisma.customer.update({
      where: { id },
      data
    });
  }

  // Delete customer (soft delete - set to INACTIVE)
  static async deleteCustomer(id: string): Promise<Customer> {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    // Soft delete by setting status to INACTIVE
    return await prisma.customer.update({
      where: { id },
      data: { status: CustomerStatus.INACTIVE }
    });
  }

  // Hard delete customer (permanent removal)
  static async hardDeleteCustomer(id: string): Promise<void> {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      throw new Error('Customer not found');
    }

    await prisma.customer.delete({
      where: { id }
    });
  }

  // Get customer statistics
  static async getCustomerStats() {
    const [
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      regionStats,
      recentCustomers
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.customer.count({ where: { status: CustomerStatus.INACTIVE } }),
      prisma.customer.groupBy({
        by: ['regionId'],
        _count: { regionId: true },
        orderBy: { _count: { regionId: 'desc' } }
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          contactName: true,
          businessName: true,
          regionId: true,
          createdAt: true
        }
      })
    ]);

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      regionStats: regionStats.map(stat => ({
        region: stat.regionId,
        count: stat._count.regionId
      })),
      recentCustomers
    };
  }

  // Search customers by business name
  static async searchByCompany(businessName: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        businessName: {
          contains: businessName,
          mode: 'insensitive'
        }
      },
      orderBy: [
        { businessName: 'asc' },
        { contactName: 'asc' }
      ]
    });
  }

  // Get customers by region
  static async getCustomersByRegion(regionId: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: { regionId },
      orderBy: [
        { status: 'asc' },
        { businessName: 'asc' },
        { contactName: 'asc' }
      ]
    });
  }

  // Get unique regions
  static async getRegions(): Promise<string[]> {
    const regions = await prisma.customer.findMany({
      select: { regionId: true },
      distinct: ['regionId'],
      orderBy: { regionId: 'asc' }
    });

    return regions.map(r => r.regionId);
  }

  // Bulk update customers (for data imports/updates)
  static async bulkUpdateCustomers(updates: Array<{ id: string; data: UpdateCustomerData }>) {
    const results = await Promise.allSettled(
      updates.map(update => 
        prisma.customer.update({
          where: { id: update.id },
          data: update.data
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      successful,
      failed,
      total: updates.length
    };
  }
}
