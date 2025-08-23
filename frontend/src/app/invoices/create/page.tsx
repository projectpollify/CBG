'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Customer,
  ServiceType,
  InvoiceLineItem,
  CompanyInfo,
  ServicePricing,
  TaxRates,
  InvoiceCalculator,
  DEFAULT_TAX_RATES
} from 'cbg-shared';

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [servicePricing, setServicePricing] = useState<Record<ServiceType, ServicePricing>>({} as any);
  const [taxRates, setTaxRates] = useState<TaxRates>(DEFAULT_TAX_RATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchSettings();
    calculateDefaultDueDate();
  }, []);
  
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === preselectedCustomerId);
      if (customer) {
        setSelectedCustomer(preselectedCustomerId);
        setSearchTerm(customer.businessName);
      }
    }
  }, [preselectedCustomerId, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/customers?limit=1000');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/all');
      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data.companyInfo);
        setServicePricing(data.data.servicePricing);
        setTaxRates(data.data.taxRates);
        setNotes(data.data.invoiceDefaults.defaultNotes || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const calculateDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  };

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      serviceType: ServiceType.RESURFACING,
      description: '',
      quantity: 1,
      unitPrice: servicePricing[ServiceType.RESURFACING]?.unitPrice || 0,
      totalPrice: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'serviceType') {
      const pricing = servicePricing[value as ServiceType];
      if (pricing) {
        updatedItems[index].unitPrice = pricing.unitPrice;
        updatedItems[index].description = pricing.description;
      }
    }

    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = InvoiceCalculator.calculateLineItemTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice
      );
    }

    setLineItems(updatedItems);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    return InvoiceCalculator.calculateInvoiceTotals(lineItems, taxRates);
  };

  const handleSubmit = async (status: 'DRAFT' | 'SENT' = 'DRAFT') => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          lineItems,
          notes,
          dueDate,
          status
        })
      });

      const data = await response.json();

      if (data.success) {
        if (status === 'SENT') {
          await fetch(`http://localhost:3001/api/invoices/${data.data.id}/send`, {
            method: 'POST'
          });
        }
        router.push('/invoices');
      } else {
        alert('Error creating invoice: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/invoices"
          className="inline-flex items-center text-[#003F7F] hover:text-[#002a55] mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold text-[#003F7F]">Create Invoice</h1>
      </div>

      {/* Company Info */}
      {companyInfo && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#003F7F]">From</h2>
          <div className="text-gray-700">
            <p className="font-bold">{companyInfo.name}</p>
            <p>{companyInfo.address}</p>
            <p>{companyInfo.city}, {companyInfo.province} {companyInfo.postalCode}</p>
            <p>Email: {companyInfo.email}</p>
            <p>Phone: {companyInfo.phone}</p>
            <p>GST #: {companyInfo.gstNumber}</p>
          </div>
        </div>
      )}

      {/* Customer Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#003F7F]">Bill To</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search and select customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowCustomerDropdown(true);
            }}
            onFocus={() => setShowCustomerDropdown(true)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          
          {showCustomerDropdown && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredCustomers.slice(0, 10).map(customer => (
                <div
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer.id);
                    setSearchTerm(customer.businessName);
                    setShowCustomerDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{customer.businessName}</div>
                  <div className="text-sm text-gray-600">{customer.contactName} - {customer.city}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            {(() => {
              const customer = customers.find(c => c.id === selectedCustomer);
              return customer ? (
                <div className="text-sm">
                  <p className="font-medium">{customer.businessName}</p>
                  <p>{customer.contactName}</p>
                  <p>{customer.street}</p>
                  <p>{customer.city}, {customer.province} {customer.postalCode}</p>
                  <p>{customer.email}</p>
                  <p>{customer.phone}</p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#003F7F]">Line Items</h2>
          <button
            onClick={addLineItem}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#ff8555] transition-colors"
          >
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2">Quantity</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Total</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 pr-2">
                    <select
                      value={item.serviceType}
                      onChange={(e) => updateLineItem(index, 'serviceType', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    >
                      <option value={ServiceType.RESURFACING}>Resurfacing</option>
                      <option value={ServiceType.NEW_BOARD}>New Board</option>
                      <option value={ServiceType.STAINLESS_INSERT}>Stainless Insert</option>
                      <option value={ServiceType.STAINLESS_CLAMPS}>Stainless Clamps</option>
                      <option value={ServiceType.BOARD_MODIFICATIONS}>Board Modifications</option>
                      <option value={ServiceType.SPECIAL}>Special</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      placeholder="Enter description..."
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      min="1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border rounded text-right focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      step="0.01"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    ${item.totalPrice.toFixed(2)}
                  </td>
                  <td className="py-2 pl-2">
                    <button
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lineItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No line items added. Click "Add Item" to begin.
            </div>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="max-w-sm ml-auto">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>GST (5%):</span>
            <span className="font-medium">${totals.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>PST (7%):</span>
            <span className="font-medium">${totals.pstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t font-bold text-lg">
            <span>Total:</span>
            <span className="text-[#003F7F]">${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#003F7F]">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            placeholder="Add any notes or special instructions..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => router.push('/invoices')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit('DRAFT')}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          onClick={() => handleSubmit('SENT')}
          className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save & Send'}
        </button>
      </div>
    </div>
  );
}