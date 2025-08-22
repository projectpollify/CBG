import { PrismaClient, Customer, CustomerStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCustomerData {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  address: string;
  region: string;
  status?: CustomerStatus;
  notes?: string;
}

export interface UpdateCustomerData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  status?: CustomerStatus;
  notes?: string;
}

export interface CustomerFilters {
  region?: string;
  status?: CustomerStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class CustomerService {
  // Get all customers with optional filtering and pagination
  static async getCustomers(filters: CustomerFilters = {}) {
    const {
      region,
      status,
      search,
      page = 1,
      limit = 50
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (region) {
      where.region = region;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { status: 'asc' }, // Active customers first
          { company: 'asc' },
          { name: 'asc' }
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
        by: ['region'],
        _count: { region: true },
        orderBy: { _count: { region: 'desc' } }
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          company: true,
          region: true,
          createdAt: true
        }
      })
    ]);

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      regionStats: regionStats.map(stat => ({
        region: stat.region,
        count: stat._count.region
      })),
      recentCustomers
    };
  }

  // Search customers by company name
  static async searchByCompany(companyName: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        company: {
          contains: companyName,
          mode: 'insensitive'
        }
      },
      orderBy: [
        { company: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  // Get customers by region
  static async getCustomersByRegion(region: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: { region },
      orderBy: [
        { status: 'asc' },
        { company: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  // Get unique regions
  static async getRegions(): Promise<string[]> {
    const regions = await prisma.customer.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' }
    });

    return regions.map(r => r.region);
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
