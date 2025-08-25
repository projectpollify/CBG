import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle, 
  Download, Mail, Calendar, CreditCard, Users, BarChart3,
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface CustomerAnalytics {
  customerId: string;
  businessName: string;
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  averagePaymentTime: number;
  outstandingBalance: number;
  paymentHistory: any[];
  revenueByMonth: any[];
  serviceBreakdown: any[];
  paymentMethodPreference: string | null;
  accountAge: number;
  isActiveCustomer: boolean;
  riskScore: 'low' | 'medium' | 'high';
}

interface CustomerStatement {
  statementId: string;
  customer: any;
  periodStart: string;
  periodEnd: string;
  previousBalance: number;
  currentCharges: number;
  payments: number;
  currentBalance: number;
  transactions: any[];
  agingSummary: {
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    total: number;
  };
}

export default function CustomerAnalyticsDashboard({ customerId }: { customerId?: string }) {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [statement, setStatement] = useState<CustomerStatement | null>(null);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [overdueCustomers, setOverdueCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customerId || '');
  const [loading, setLoading] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState('monthly');

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerAnalytics(selectedCustomer);
    } else {
      fetchOverview();
    }
  }, [selectedCustomer]);

  const fetchCustomerAnalytics = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/customer/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      // Fetch top customers
      const topResponse = await fetch('/api/analytics/customers/top?limit=5');
      if (topResponse.ok) {
        const data = await response.json();
        setTopCustomers(data);
      }

      // Fetch overdue customers
      const overdueResponse = await fetch('/api/analytics/customers/overdue');
      if (overdueResponse.ok) {
        const data = await overdueResponse.json();
        setOverdueCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  const generateStatement = async () => {
    if (!selectedCustomer) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/statement/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer,
          type: statementPeriod
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStatement(data);
      }
    } catch (error) {
      console.error('Error generating statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadStatement = async (format: 'pdf' | 'html') => {
    if (!selectedCustomer) return;

    const url = `/api/analytics/statement/${selectedCustomer}/${format}`;
    window.open(url, '_blank');
  };

  const emailStatement = async () => {
    if (!selectedCustomer || !statement) return;

    try {
      const response = await fetch(`/api/analytics/statement/${selectedCustomer}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: statementPeriod
        })
      });

      if (response.ok) {
        alert('Statement sent successfully!');
      }
    } catch (error) {
      console.error('Error emailing statement:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!selectedCustomer) {
    // Show overview dashboard
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Customers by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCustomers.map((customer, index) => (
                      <div key={customer.customerId} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{customer.businessName}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.totalInvoices} invoices
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(customer.totalRevenue)}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCustomer(customer.customerId)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Customers with Overdue Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueCustomers.slice(0, 5).map(customer => (
                      <div key={customer.customerId} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{customer.businessName}</p>
                          <p className="text-sm text-red-600">
                            {customer.overdueInvoices} overdue
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">
                            {formatCurrency(customer.outstandingBalance)}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCustomer(customer.customerId)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show individual customer analytics
  return (
    <div className="space-y-6">
      {analytics && (
        <>
          {/* Header Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{analytics.businessName}</CardTitle>
                  <div className="flex gap-4 mt-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      analytics.isActiveCustomer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {analytics.isActiveCustomer ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${getRiskColor(analytics.riskScore)}`}>
                      {analytics.riskScore.toUpperCase()} Risk
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Customer for {Math.floor(analytics.accountAge / 365)} years, {analytics.accountAge % 365} days
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedCustomer('')}>
                  Back to Overview
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.outstandingBalance)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Payment Time</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.averagePaymentTime)} days</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Invoices</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-green-600">{analytics.paidInvoices} paid</span>
                      <span className="text-orange-600">{analytics.unpaidInvoices} unpaid</span>
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
              <TabsTrigger value="services">Service Breakdown</TabsTrigger>
              <TabsTrigger value="payment">Payment History</TabsTrigger>
              <TabsTrigger value="statement">Statement</TabsTrigger>
            </TabsList>

            {/* Revenue Trends */}
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Breakdown */}
            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.serviceBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ service, percentage }) => `${service} (${percentage.toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalRevenue"
                        >
                          {analytics.serviceBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {analytics.serviceBreakdown.map((service, index) => (
                        <div key={service.service} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span>{service.service}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(service.totalRevenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment History */}
            <TabsContent value="payment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.paymentHistory.map(payment => (
                      <div key={payment.invoiceNumber} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">Invoice #{payment.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.invoiceDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm">
                            {payment.status === 'PAID' ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Paid in {payment.daysToPayment} days
                              </span>
                            ) : (
                              <span className="text-orange-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {payment.status}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statement Generation */}
            <TabsContent value="statement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Customer Statement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Select value={statementPeriod} onValueChange={setStatementPeriod}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Current Month</SelectItem>
                        <SelectItem value="period">Last 3 Months</SelectItem>
                        <SelectItem value="custom">Custom Period</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={generateStatement} disabled={loading}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Statement
                    </Button>
                  </div>

                  {statement && (
                    <div className="mt-6 p-4 border rounded">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold">Statement #{statement.statementId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Period: {format(new Date(statement.periodStart), 'MMM d')} - {format(new Date(statement.periodEnd), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => downloadStatement('html')}>
                            <Download className="h-4 w-4 mr-1" />
                            HTML
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => downloadStatement('pdf')}>
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button size="sm" onClick={emailStatement}>
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                        </div>
                      </div>

                      {/* Statement Summary */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Previous Balance:</span>
                            <span>{formatCurrency(statement.previousBalance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Charges:</span>
                            <span>{formatCurrency(statement.currentCharges)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payments:</span>
                            <span>{formatCurrency(statement.payments)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Current Balance:</span>
                            <span>{formatCurrency(statement.currentBalance)}</span>
                          </div>
                        </div>

                        {/* Aging Summary */}
                        <div className="space-y-2">
                          <h5 className="font-medium mb-2">Aging Summary</h5>
                          <div className="flex justify-between text-sm">
                            <span>Current:</span>
                            <span>{formatCurrency(statement.agingSummary.current)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>31-60 Days:</span>
                            <span>{formatCurrency(statement.agingSummary.thirtyDays)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>61-90 Days:</span>
                            <span>{formatCurrency(statement.agingSummary.sixtyDays)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Over 90 Days:</span>
                            <span>{formatCurrency(statement.agingSummary.ninetyDays)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}