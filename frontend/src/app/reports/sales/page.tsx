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
import { ServiceType, InvoiceSummary } from '@/shared';

export default function SalesReportsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [salesData, setSalesData] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    // Don't auto-fetch for custom until user clicks Apply
    if (timeRange !== 'custom') {
      fetchSalesData();
    }
  }, [timeRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      if (timeRange === 'custom') {
        // Use custom dates
        if (!customStartDate || !customEndDate) {
          alert('Please select both start and end dates');
          setLoading(false);
          return;
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);

        // Set end date to end of day for better UX
        endDate.setHours(23, 59, 59, 999);

        // Validate dates
        if (startDate > endDate) {
          alert('Start date must be before end date');
          setLoading(false);
          return;
        }

        if (endDate > now) {
          alert('End date cannot be in the future');
          setLoading(false);
          return;
        }

        // Check for maximum 2 year range
        const twoYearsAgo = new Date(now);
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        if (startDate < twoYearsAgo) {
          alert('Date range cannot exceed 2 years');
          setLoading(false);
          return;
        }
      } else {
        // Existing preset logic
        switch (timeRange) {
          case 'week':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            break;
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
      }

      const response = await fetch(
        `http://localhost:3001/api/invoices/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error: any) {
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

  const getDateRangeDisplay = (): string => {
    if (timeRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: new Date(customStartDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
      const end = new Date(customEndDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      return `${start} - ${end}`;
    }
    return timeRange;
  };

  const exportToCSV = () => {
    if (!salesData) return;

    // Determine date range text for the report
    let dateRangeText = '';
    if (timeRange === 'custom') {
      dateRangeText = `${customStartDate} to ${customEndDate}`;
    } else {
      dateRangeText = `This ${timeRange}`;
    }

    const csvContent = [
      ['Sales Report', `Period: ${dateRangeText}`],
      [],
      ['Metric', 'Value'],
      ['Total Sales', `$${salesData.totalSales.toFixed(2)}`],
      ['Total Paid', `$${salesData.totalRevenue.toFixed(2)}`],
      ['Outstanding', `$${salesData.outstandingAmount.toFixed(2)}`],
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

    // Include custom dates in filename if applicable
    const dateString = timeRange === 'custom'
      ? `custom_${customStartDate}_to_${customEndDate}`
      : timeRange;
    a.download = `sales_report_${dateString}_${new Date().toISOString().split('T')[0]}.csv`;
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
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'week'
                  ? 'bg-[#003F7F] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
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
            <button
              onClick={() => setTimeRange('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === 'custom'
                  ? 'bg-[#003F7F] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Dates
            </button>
          </div>

          {/* Custom Date Picker Row - Only show when custom is selected */}
          {timeRange === 'custom' && (
            <div className="flex items-end space-x-4 pt-4 border-t">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F7F]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003F7F]"
                />
              </div>
              <button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    fetchSalesData();
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  customStartDate && customEndDate
                    ? 'bg-[#FF6B35] text-white hover:bg-[#ff8555]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {salesData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-blue-500" />
                <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                ${salesData.totalSales.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">All invoices billed</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${salesData.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Revenue received</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-orange-500" />
                <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                ${salesData.outstandingAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-500" />
                <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                {salesData.totalInvoices}
              </p>
              <p className="text-xs text-gray-500 mt-1">{salesData.paidInvoices} paid</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-indigo-500" />
                <span className="text-sm text-gray-500">{getDateRangeDisplay()}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Average Invoice</p>
              <p className="text-2xl font-bold text-[#003F7F]">
                ${salesData.averageInvoiceValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per invoice</p>
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