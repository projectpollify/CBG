'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Customer,
  UpdateCustomerData, 
  CustomerStatus,
  CustomerFormErrors,
  BC_REGIONS,
  ApiResponse
} from '@/../../shared/src';
import { 
  ArrowLeft, 
  Save, 
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    contactName: '',
    businessName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: 'BC',
    postalCode: '',
    regionId: '',
    status: CustomerStatus.ACTIVE,
    notes: ''
  });

  // Load customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/customers/${customerId}`);
        const data: ApiResponse<Customer> = await response.json();

        if (data.success && data.data) {
          const customerData: any = data.data;
          setCustomer(customerData);
          // Map the customer data to form fields
          // The API returns the actual database fields
          setFormData({
            contactName: customerData.contactName || customerData.name || '',
            businessName: customerData.businessName || customerData.company || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            street: customerData.street || customerData.address || '',
            city: customerData.city || '',
            province: customerData.province || 'BC',
            postalCode: customerData.postalCode || '',
            regionId: customerData.regionId || customerData.region || '',
            status: customerData.status || CustomerStatus.ACTIVE,
            notes: customerData.notes || ''
          });
          setLoadError(null);
        } else {
          setLoadError(data.error || 'Customer not found');
        }
      } catch (err) {
        console.error('Error fetching customer:', err);
        setLoadError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  // Handle form field changes
  const handleChange = (field: string, value: string | CustomerStatus) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.contactName?.trim()) {
      newErrors.name = 'Contact name is required';
    }

    if (!formData.businessName?.trim()) {
      newErrors.company = 'Business name is required';
    }

    if (!formData.street?.trim()) {
      newErrors.address = 'Street address is required';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.regionId?.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`http://localhost:3001/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data: ApiResponse<Customer> = await response.json();

      if (data.success) {
        // Success - redirect to customer list
        router.push('/customers');
      } else {
        // Show error
        setErrors({ 
          name: data.error || 'Failed to update customer' 
        });
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      setErrors({ 
        name: 'Network error. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cbg-orange mx-auto" />
          <p className="mt-2 text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Customer</h3>
            <p className="text-red-600 mb-4">{loadError}</p>
            <Link
              href="/customers"
              className="cbg-button-primary"
            >
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href="/customers"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-cbg-navy">Edit Customer</h1>
                <p className="text-gray-600 mt-1">
                  Update customer information for {(customer as any)?.contactName || (customer as any)?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-cbg-orange" />
                Customer Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Contact Name */}
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  value={formData.contactName || ''}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter contact name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="businessName"
                    value={formData.businessName || ''}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter business name"
                  />
                </div>
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status || CustomerStatus.ACTIVE}
                  onChange={(e) => handleChange('status', e.target.value as CustomerStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
                >
                  <option value={CustomerStatus.ACTIVE}>Active</option>
                  <option value={CustomerStatus.INACTIVE}>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-cbg-orange" />
                Contact Information
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Contact details will be updated when Sobeys/Save On data is integrated
              </p>
            </div>
            <div className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-cbg-orange" />
                Location Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Street Address */}
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="street"
                  value={formData.street || ''}
                  onChange={(e) => handleChange('street', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter street address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* City and Province */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province
                  </label>
                  <input
                    type="text"
                    id="province"
                    value={formData.province || 'BC'}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
                    placeholder="Province"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                    errors.postalCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter postal code"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Region */}
              <div>
                <label htmlFor="regionId" className="block text-sm font-medium text-gray-700 mb-1">
                  Region *
                </label>
                <select
                  id="regionId"
                  value={formData.regionId || ''}
                  onChange={(e) => handleChange('regionId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent ${
                    errors.region ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a region</option>
                  {BC_REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.region && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.region}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-cbg-orange" />
                Additional Notes
              </h2>
            </div>
            <div className="p-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbg-orange focus:border-transparent"
                placeholder="Enter any additional notes about this customer..."
              />
            </div>
          </div>

          {/* Customer Metadata */}
          {customer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span> {new Date(customer.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(customer.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Customer ID:</span> {customer.id}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link
              href="/customers"
              className="cbg-button-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="cbg-button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
