'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
  CompanyInfo,
  InvoiceLineItem
} from 'cbg-shared';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [paidDate, setPaidDate] = useState('');

  useEffect(() => {
    fetchInvoice();
    fetchCompanyInfo();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${invoiceId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setInvoice(data.data);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/company-info');
      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          paidDate: paidDate || new Date().toISOString()
        })
      });

      if (response.ok) {
        setShowPaymentModal(false);
        fetchInvoice();
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const handleSendEmail = async () => {
    alert('Email functionality will be implemented in Module 7');
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality will be implemented in a future module');
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(numAmount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-500'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badges[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Invoice not found</p>
      </div>
    );
  }

  const lineItems = invoice.lineItems as InvoiceLineItem[];

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
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#003F7F] mb-2">
              Invoice #{invoice.invoiceNumber.toString().padStart(5, '0')}
            </h1>
            {getStatusBadge(invoice.status)}
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/invoices/edit/${invoice.id}`}
              className="px-4 py-2 bg-[#003F7F] text-white rounded-lg hover:bg-[#002a55] transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Email
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Download PDF
            </button>
            {invoice.status === InvoiceStatus.SENT && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Company Header */}
        <div className="border-b pb-8 mb-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              {companyInfo && (
                <>
                  <h2 className="text-2xl font-bold text-[#003F7F] mb-4">{companyInfo.name}</h2>
                  <div className="text-gray-600">
                    <p>{companyInfo.address}</p>
                    <p>{companyInfo.city}, {companyInfo.province} {companyInfo.postalCode}</p>
                    <p className="mt-2">Email: {companyInfo.email}</p>
                    <p>Phone: {companyInfo.phone}</p>
                    <p>Website: {companyInfo.website}</p>
                    <p className="mt-2 font-medium">GST #: {companyInfo.gstNumber}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-right">
              <h3 className="text-4xl font-bold text-[#003F7F] mb-4">INVOICE</h3>
              <div className="text-gray-600">
                <p className="mb-1">
                  <span className="font-medium">Invoice #:</span> {invoice.invoiceNumber.toString().padStart(5, '0')}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Date:</span> {formatDate(invoice.invoiceDate)}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}
                </p>
                {invoice.paidDate && (
                  <p className="mb-1">
                    <span className="font-medium">Paid Date:</span> {formatDate(invoice.paidDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#003F7F] mb-3">Bill To:</h3>
          {invoice.customer && (
            <div className="text-gray-700">
              <p className="font-medium">{invoice.customer.businessName}</p>
              <p>{invoice.customer.contactName}</p>
              <p>{invoice.customer.street}</p>
              <p>{invoice.customer.city}, {invoice.customer.province} {invoice.customer.postalCode}</p>
              <p className="mt-2">{invoice.customer.email}</p>
              <p>{invoice.customer.phone}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-[#003F7F]">Description</th>
                <th className="text-center py-3 text-[#003F7F]">Quantity</th>
                <th className="text-right py-3 text-[#003F7F]">Rate</th>
                <th className="text-right py-3 text-[#003F7F]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3">{item.description}</td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right py-3">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">GST (5%):</span>
              <span className="font-medium">{formatCurrency(invoice.gstAmount)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">PST (7%):</span>
              <span className="font-medium">{formatCurrency(invoice.pstAmount)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300">
              <span className="text-xl font-bold text-[#003F7F]">Total:</span>
              <span className="text-xl font-bold text-[#003F7F]">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold text-[#003F7F] mb-3">Notes:</h3>
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Payment Info */}
        {invoice.status === InvoiceStatus.PAID && invoice.paymentMethod && (
          <div className="mt-8 pt-8 border-t">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                Payment received via {invoice.paymentMethod.replace('_', ' ')} on {formatDate(invoice.paidDate!)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4 text-[#003F7F]">Mark Invoice as Paid</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="">Select method...</option>
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.CHEQUE}>Cheque</option>
                <option value={PaymentMethod.E_TRANSFER}>E-Transfer</option>
                <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
                <option value={PaymentMethod.DEBIT}>Debit</option>
                <option value={PaymentMethod.OTHER}>Other</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={!paymentMethod}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}