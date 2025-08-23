'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Mail, 
  Settings as SettingsIcon,
  ChevronRight,
  Clock,
  Hash
} from 'lucide-react';

interface SettingsSummary {
  currentInvoiceNumber: number;
  totalServices: number;
  lastUpdated: string;
  companyName: string;
  taxRates: {
    gst: number;
    pst: number;
  };
}

export default function SettingsPage() {
  const [summary, setSummary] = useState<SettingsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettingsSummary();
  }, []);

  const fetchSettingsSummary = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/all');
      const data = await response.json();
      
      if (data.success) {
        setSummary({
          currentInvoiceNumber: data.data.invoiceDefaults.nextInvoiceNumber || 10001,
          totalServices: Object.keys(data.data.servicePricing).length,
          lastUpdated: new Date().toLocaleDateString(),
          companyName: data.data.companyInfo.name,
          taxRates: data.data.taxRates
        });
      }
    } catch (error) {
      console.error('Error fetching settings summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsCards = [
    {
      title: 'Business Information',
      description: 'Manage your company details, contact information, and GST registration',
      icon: Building2,
      href: '/settings/business',
      color: 'bg-blue-500',
      stats: summary?.companyName || 'Cutting Board Guys B.C inc.'
    },
    {
      title: 'Service Pricing',
      description: 'Configure pricing for all services including resurfacing, new boards, and modifications',
      icon: DollarSign,
      href: '/settings/pricing',
      color: 'bg-green-500',
      stats: `${summary?.totalServices || 6} services configured`
    },
    {
      title: 'Invoice Configuration',
      description: 'Set invoice numbering, payment terms, and default notes',
      icon: FileText,
      href: '/settings/invoice',
      color: 'bg-[#FF6B35]',
      stats: `Next invoice: #${summary?.currentInvoiceNumber.toString().padStart(5, '0') || '10001'}`
    },
    {
      title: 'Email Templates',
      description: 'Customize email templates for sending invoices to customers',
      icon: Mail,
      href: '/settings/email',
      color: 'bg-purple-500',
      stats: 'Default template active'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003F7F] mb-2">Settings</h1>
        <p className="text-gray-600">Manage your business configuration and preferences</p>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Invoice</p>
                <p className="text-xl font-bold text-[#003F7F]">
                  #{summary.currentInvoiceNumber.toString().padStart(5, '0')}
                </p>
              </div>
              <Hash className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">GST Rate</p>
                <p className="text-xl font-bold text-[#003F7F]">
                  {(summary.taxRates.gst * 100).toFixed(0)}%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">PST Rate</p>
                <p className="text-xl font-bold text-[#003F7F]">
                  {(summary.taxRates.pst * 100).toFixed(0)}%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-xl font-bold text-[#003F7F]">
                  {summary.lastUpdated}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-[#003F7F] mb-2">
                {card.title}
              </h3>
              
              <p className="text-gray-600 mb-3">
                {card.description}
              </p>
              
              <div className="text-sm font-medium text-[#FF6B35]">
                {card.stats}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Settings Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <SettingsIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Settings Management
            </h3>
            <p className="text-blue-800">
              All settings are automatically synchronized across the platform. Changes made here will 
              immediately affect invoice creation, customer management, and reporting features.
            </p>
            <div className="mt-4">
              <Link
                href="/reports"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                View Reports & Analytics
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}