'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ChefHat,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
    monthlyRevenue: 0,
    todayAppointments: 0,
    weekAppointments: 0
  });

  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch customer stats
      const customerResponse = await fetch('http://localhost:3001/api/customers/stats');
      const customerData = await customerResponse.json();
      
      // Fetch invoice stats
      const invoiceResponse = await fetch('http://localhost:3001/api/invoices/stats');
      const invoiceData = await invoiceResponse.json();
      
      // Fetch recent invoices
      const recentResponse = await fetch('http://localhost:3001/api/invoices?limit=5');
      const recentData = await recentResponse.json();
      
      if (customerData.success && invoiceData.success && recentData.success) {
        setStats({
          totalCustomers: customerData.data.totalCustomers || 0,
          activeCustomers: customerData.data.activeCustomers || 0,
          totalInvoices: invoiceData.data.totalInvoices || 0,
          unpaidInvoices: invoiceData.data.unpaidInvoices || 0,
          overdueInvoices: invoiceData.data.overdueInvoices || 0,
          monthlyRevenue: invoiceData.data.totalRevenue || 0,
          todayAppointments: 0, // Placeholder for Module 5
          weekAppointments: 0   // Placeholder for Module 5
        });
        
        setRecentInvoices(recentData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-600'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || statusStyles.DRAFT}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cbg-orange"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cbg-navy flex items-center">
          <ChefHat className="w-8 h-8 mr-3 text-cbg-orange" />
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Welcome to your Cutting Board Guys business hub</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/invoices/create"
          className="bg-cbg-orange text-white p-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-between group"
        >
          <div>
            <FileText className="w-6 h-6 mb-2" />
            <span className="font-semibold">New Invoice</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link
          href="/customers/add"
          className="bg-cbg-navy text-white p-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-between group"
        >
          <div>
            <Users className="w-6 h-6 mb-2" />
            <span className="font-semibold">Add Customer</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link
          href="/appointments"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-between group"
        >
          <div>
            <Calendar className="w-6 h-6 mb-2" />
            <span className="font-semibold">Schedule</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <Link
          href="/reports/sales"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-between group"
        >
          <div>
            <BarChart3 className="w-6 h-6 mb-2" />
            <span className="font-semibold">Reports</span>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-cbg-orange" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-cbg-navy">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600 mt-1">Active: {stats.activeCustomers}</div>
          <Link href="/customers" className="text-sm text-cbg-orange hover:underline mt-2 inline-block">
            View all customers →
          </Link>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <div className="text-2xl font-bold text-cbg-navy">
            ${stats.monthlyRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total revenue</div>
          <Link href="/reports/sales" className="text-sm text-cbg-orange hover:underline mt-2 inline-block">
            View reports →
          </Link>
        </div>

        {/* Invoices Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <div className="text-2xl font-bold text-cbg-navy">{stats.totalInvoices}</div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="text-yellow-600">{stats.unpaidInvoices} unpaid</span>
            {stats.overdueInvoices > 0 && (
              <span className="text-red-600 ml-2">• {stats.overdueInvoices} overdue</span>
            )}
          </div>
          <Link href="/invoices" className="text-sm text-cbg-orange hover:underline mt-2 inline-block">
            Manage invoices →
          </Link>
        </div>

        {/* Appointments Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500">Today</span>
          </div>
          <div className="text-2xl font-bold text-cbg-navy">{stats.todayAppointments}</div>
          <div className="text-sm text-gray-600 mt-1">This week: {stats.weekAppointments}</div>
          <Link href="/appointments" className="text-sm text-cbg-orange hover:underline mt-2 inline-block">
            View calendar →
          </Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-cbg-navy flex items-center">
              <Clock className="w-5 h-5 mr-2 text-cbg-orange" />
              Recent Invoices
            </h2>
          </div>
          <div className="p-6">
            {recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        #{invoice.invoiceNumber?.toString().padStart(5, '0')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.customer?.businessName || 'Unknown Customer'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${parseFloat(invoice.total || 0).toFixed(2)}</div>
                      <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No invoices yet</p>
                <Link href="/invoices/create" className="text-sm text-cbg-orange hover:underline mt-2 inline-block">
                  Create your first invoice
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-cbg-navy flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-cbg-orange" />
              Business Metrics
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-700">Paid This Month</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.totalInvoices - stats.unpaidInvoices}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-gray-700">Pending Payment</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.unpaidInvoices}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-gray-700">Overdue</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.overdueInvoices}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-700">Active Customers</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.activeCustomers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-cbg-navy to-cbg-navy-dark rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>All systems operational</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm opacity-75">Module 4: Invoice Management</span>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm opacity-75">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}