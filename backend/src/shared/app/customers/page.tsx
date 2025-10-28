'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Customer, 
  CustomerFilters, 
  CustomerListResponse, 
  CustomerStatus,
  BC_REGIONS,
  ApiResponse 
} from '@/../../shared/src';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Users, 
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 25,
    search: '',
    region: '',
    status: undefined
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.region) params.append('region', filters.region);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`http://localhost:3001/api/customers?${params}`);
      const data: ApiResponse<CustomerListResponse> = await response.json();

      if (data.success && data.data) {
        setCustomers(data.data.customers);
        setPagination(data.data.pagination);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error while fetching customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount and filter changes
  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1 // Reset to first page
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${customerName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/customers/${customerId}`, {
        method: 'DELETE'
      });
      
      const data: ApiResponse<Customer> = await response.json();
      
      if (data.success) {
        // Refresh the list
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to deactivate customer');
      }
    } catch (err) {
      alert('Network error while deactivating customer');
      console.error('Error deleting customer:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-cbg-navy">Customers</h1>
              <p className="text-gray-600 mt-1">
                Manage your restaurant clients and contacts
              </p>
            </div>
            <Link
              href="/customers/add"
              className="cbg-button-primary flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Customer
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <select
              value={filters.region || ''}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
            >
              <option value="">All Regions</option>
              {BC_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as CustomerStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value={CustomerStatus.ACTIVE}>Active</option>
              <option value={CustomerStatus.INACTIVE}>Inactive</option>
            </select>

            {/* Results per page */}
            <select
              value={filters.limit || 25}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">
            Showing {customers.length} of {pagination.total} customers
          </p>
          <div className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cbg-orange"></div>
              <span className="ml-3 text-gray-600">Loading customers...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Customer List */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-cbg-orange text-white flex items-center justify-center font-semibold">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {customer.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{customer.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {customer.email}
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {customer.phone}
                              </div>
                            )}
                            {!customer.email && !customer.phone && (
                              <span className="text-gray-400">No contact info</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customer.region}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.status === CustomerStatus.ACTIVE
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/customers/${customer.id}`}
                              className="text-cbg-navy hover:text-cbg-navy-dark p-1 rounded"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/customers/edit/${customer.id}`}
                              className="text-cbg-orange hover:text-cbg-orange-dark p-1 rounded"
                              title="Edit customer"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Deactivate customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.total}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = i + Math.max(1, pagination.page - 2);
                        if (pageNum > pagination.pages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'z-10 bg-cbg-orange border-cbg-orange text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && customers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.region || filters.status
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first customer.'
              }
            </p>
            {!filters.search && !filters.region && !filters.status && (
              <div className="mt-6">
                <Link
                  href="/customers/add"
                  className="cbg-button-primary"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Customer
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
