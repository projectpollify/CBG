'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Save, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash
} from 'lucide-react';
import { CompanyInfo, InvoiceDefaults } from 'cbg-shared';

export default function BusinessSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    email: '',
    phone: '',
    website: '',
    gstNumber: ''
  });
  const [invoiceDefaults, setInvoiceDefaults] = useState<InvoiceDefaults>({
    nextInvoiceNumber: 10001,
    paymentTermsDays: 30,
    defaultNotes: '',
    emailSubject: '',
    emailBody: ''
  });
  const [taxRates, setTaxRates] = useState({
    gst: 0.05,
    pst: 0.07
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/all');
      const data = await response.json();
      
      if (data.success) {
        setCompanyInfo(data.data.companyInfo);
        setInvoiceDefaults(data.data.invoiceDefaults);
        setTaxRates(data.data.taxRates);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyInfo)
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setErrorMessage('Error updating company information');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving company info:', error);
      setErrorMessage('Error saving company information');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoiceDefaults = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/defaults', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceDefaults)
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setErrorMessage('Error updating invoice defaults');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving invoice defaults:', error);
      setErrorMessage('Error saving invoice defaults');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTaxRates = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/tax-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taxRates)
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setErrorMessage('Error updating tax rates');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving tax rates:', error);
      setErrorMessage('Error saving tax rates');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    await handleSaveCompanyInfo();
    await handleSaveInvoiceDefaults();
    await handleSaveTaxRates();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Settings saved successfully!
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings"
          className="inline-flex items-center text-[#003F7F] hover:text-[#002a55] mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Settings
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#003F7F]">Business Settings</h1>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#ff8555] transition-colors inline-flex items-center disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-[#003F7F] mr-3" />
            <h2 className="text-xl font-semibold text-[#003F7F]">Company Information</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={companyInfo.gstNumber}
                onChange={(e) => setCompanyInfo({ ...companyInfo, gstNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={companyInfo.city}
                onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <input
                type="text"
                value={companyInfo.province}
                onChange={(e) => setCompanyInfo({ ...companyInfo, province: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={companyInfo.postalCode}
                onChange={(e) => setCompanyInfo({ ...companyInfo, postalCode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="text"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Configuration */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-[#003F7F]">Invoice Configuration</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Invoice Number
              </label>
              <input
                type="number"
                value={invoiceDefaults.nextInvoiceNumber}
                onChange={(e) => setInvoiceDefaults({ 
                  ...invoiceDefaults, 
                  nextInvoiceNumber: parseInt(e.target.value) || 10001 
                })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms (Days)
              </label>
              <select
                value={invoiceDefaults.paymentTermsDays}
                onChange={(e) => setInvoiceDefaults({ 
                  ...invoiceDefaults, 
                  paymentTermsDays: parseInt(e.target.value) 
                })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value={0}>Due on Receipt</option>
                <option value={15}>Net 15</option>
                <option value={30}>Net 30</option>
                <option value={45}>Net 45</option>
                <option value={60}>Net 60</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Invoice Notes
              </label>
              <textarea
                value={invoiceDefaults.defaultNotes}
                onChange={(e) => setInvoiceDefaults({ 
                  ...invoiceDefaults, 
                  defaultNotes: e.target.value 
                })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Thank you for your business!"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject Template
              </label>
              <input
                type="text"
                value={invoiceDefaults.emailSubject}
                onChange={(e) => setInvoiceDefaults({ 
                  ...invoiceDefaults, 
                  emailSubject: e.target.value 
                })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Invoice #{invoiceNumber} from Cutting Board Guys"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {'{invoiceNumber}'} to insert the invoice number
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body Template
              </label>
              <textarea
                value={invoiceDefaults.emailBody}
                onChange={(e) => setInvoiceDefaults({ 
                  ...invoiceDefaults, 
                  emailBody: e.target.value 
                })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="Please find attached your invoice. Payment is due within {paymentTerms} days."
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {'{paymentTerms}'} to insert payment terms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-[#003F7F]">Tax Configuration</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Rate (%)
              </label>
              <input
                type="number"
                value={taxRates.gst * 100}
                onChange={(e) => setTaxRates({ 
                  ...taxRates, 
                  gst: parseFloat(e.target.value) / 100 || 0 
                })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PST Rate (%)
              </label>
              <input
                type="number"
                value={taxRates.pst * 100}
                onChange={(e) => setTaxRates({ 
                  ...taxRates, 
                  pst: parseFloat(e.target.value) / 100 || 0 
                })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Total Tax Rate:</strong> {((taxRates.gst + taxRates.pst) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  This rate will be automatically applied to all new invoices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}