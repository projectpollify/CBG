'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react';
import { ServiceType, InvoiceSummary } from 'cbg-shared';

export default function SalesReportsPage() {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [salesData, setSalesData] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const response = await fetch(
        `http://localhost:3001/api/invoices/stats?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`
      );
      const data = await response.json();
      
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceDisplayName = (serviceType: ServiceType): string => {
    const names: Record<ServiceType, string> = {
      [ServiceType.RESURFACING]: 'Resurfacing',
      [ServiceType.NEW_BOARD]: 'New Board Sales',
      [ServiceType.STAINLESS_INSERT]: 'Stainless Insert',
      [ServiceType.STAINLESS_CLAMPS]: 'Stainless Clamps',
      [ServiceType.BOARD_MODIFICATIONS]: 'Board Modifications',
      [ServiceType.SPECIAL]: 'Special Services'
    };
    return names[serviceType] || serviceType;
  };

  const exportToCSV = () => {
    if (!salesData) return;

    const csvContent = [
      ['Sales Report', `Period: ${timeRange}`],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', `$${salesData.totalRevenue.toFixed(2)}`],
      ['Total Invoices', salesData.totalInvoices],
      ['Paid Invoices', salesData.paidInvoices],
      ['Average Invoice Value', `$${salesData.averageInvoiceValue.toFixed(2)}`],
      [],
      ['Service Type', 'Revenue'],
      ...Object.entries(salesData.revenueByService).map(([service, revenue]) => [
        getServiceDisplayName(service as ServiceType),
        `$${revenue.toFixed(2)}`
      ]),
      [],
      ['Tax Summary'],
      ['GST Collected (5%)', `$${(salesData.totalRevenue * 0.05).toFixed(2)}`],
      ['PST Collected (7%)', `$${(salesData.totalRevenue * 0.07).toFixed(2)}`],
      ['Total Tax', `$${(salesData.totalRevenue * 0.12).toFixed(2)}`]
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reports"
          className="inline-flex items-center text-[#003F7F] hover:text-[#002a55] mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Reports
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#003F7F]">Sales Reports</h1>
          <button
            onClick={exportToCSV}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#ff8555] transition-colors inline-flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'month' 
                ? 'bg-[#003F7F] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'quarter' 
                ? 'bg-[#003F7F] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'year' 
                ? 'bg-[#003F7F] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {salesData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <span className="text-sm text-gray-500">{timeRange}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                ${salesData.totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-blue-500" />
                <span className="text-sm text-gray-500">{timeRange}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                {salesData.totalInvoices}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <span className="text-sm text-gray-500">{timeRange}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Average Invoice</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                ${salesData.averageInvoiceValue.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-orange-500" />
                <span className="text-sm text-gray-500">{timeRange}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Paid Invoices</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                {salesData.paidInvoices}
              </p>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-[#003F7F]">Revenue by Service Type</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Service Type</th>
                    <th className="text-right py-2">Revenue</th>
                    <th className="text-right py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(salesData.revenueByService).map(([service, revenue]) => {
                    const percentage = salesData.totalRevenue > 0 
                      ? (revenue / salesData.totalRevenue * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <tr key={service} className="border-b">
                        <td className="py-3">{getServiceDisplayName(service as ServiceType)}</td>
                        <td className="text-right py-3">${revenue.toFixed(2)}</td>
                        <td className="text-right py-3">
                          <span className="inline-flex items-center">
                            {percentage}%
                            <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#FF6B35] h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Summary */}
          <div className="bg-white rounded-lg shadow" id="tax">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-[#003F7F]">Tax Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">GST Collected (5%)</p>
                  <p className="text-2xl font-bold text-[#003F7F]">
                    ${(salesData.totalRevenue * 0.05).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">PST Collected (7%)</p>
                  <p className="text-2xl font-bold text-[#003F7F]">
                    ${(salesData.totalRevenue * 0.07).toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Total Tax Collected</p>
                  <p className="text-2xl font-bold text-[#003F7F]">
                    ${(salesData.totalRevenue * 0.12).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Tax amounts shown are calculated based on paid invoices only. 
                  Please consult with your accountant for official tax filings.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}