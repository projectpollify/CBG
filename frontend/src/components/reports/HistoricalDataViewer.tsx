import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Archive, RotateCcw, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface MonthlySnapshot {
  id: string;
  regionId: string;
  year: number;
  month: number;
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  averageInvoiceValue: number;
  revenueByService: any;
  topCustomers: any[];
  snapshotDate: string;
  createdAt: string;
}

interface YearlySnapshot {
  id: string;
  regionId: string;
  year: number;
  totalRevenue: number;
  totalInvoices: number;
  monthlyBreakdown: any[];
  quarterlyBreakdown: any[];
  snapshotDate: string;
  createdAt: string;
}

interface ArchivedReport {
  id: string;
  reportType: string;
  reportName: string;
  regionId: string;
  format: string;
  generatedAt: string;
  generatedBy: string;
  tags: string[];
}

interface AuditLogEntry {
  id: string;
  tableName: string;
  recordId: string;
  action: string;
  userId: string;
  timestamp: string;
  changedFields?: string[];
}

export default function HistoricalDataViewer() {
  const [monthlySnapshots, setMonthlySnapshots] = useState<MonthlySnapshot[]>([]);
  const [yearlySnapshots, setYearlySnapshots] = useState<YearlySnapshot[]>([]);
  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlySnapshots();
    fetchYearlySnapshots();
    fetchArchivedReports();
    fetchAuditLogs();
  }, [selectedYear, selectedMonth]);

  const fetchMonthlySnapshots = async () => {
    try {
      const response = await fetch(`/api/historical/snapshots/monthly?year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlySnapshots(data);
      }
    } catch (error) {
      console.error('Error fetching monthly snapshots:', error);
    }
  };

  const fetchYearlySnapshots = async () => {
    try {
      const response = await fetch('/api/historical/snapshots/yearly');
      if (response.ok) {
        const data = await response.json();
        setYearlySnapshots(data);
      }
    } catch (error) {
      console.error('Error fetching yearly snapshots:', error);
    }
  };

  const fetchArchivedReports = async () => {
    try {
      const response = await fetch('/api/historical/archived');
      if (response.ok) {
        const data = await response.json();
        setArchivedReports(data);
      }
    } catch (error) {
      console.error('Error fetching archived reports:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/historical/audit-logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const createSnapshot = async (type: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      const body: any = {
        type,
        regionId: 'BC_VANCOUVER', // Should be dynamic based on user's region
        year: selectedYear
      };
      
      if (type === 'monthly') {
        body.month = selectedMonth;
      }

      const response = await fetch('/api/historical/snapshots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(`${type === 'monthly' ? 'Monthly' : 'Yearly'} snapshot created successfully`);
        if (type === 'monthly') {
          fetchMonthlySnapshots();
        } else {
          fetchYearlySnapshots();
        }
      }
    } catch (error) {
      console.error('Error creating snapshot:', error);
      alert('Failed to create snapshot');
    } finally {
      setLoading(false);
    }
  };

  const exportSnapshot = (snapshot: MonthlySnapshot | YearlySnapshot, type: string) => {
    const data = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_snapshot_${snapshot.year}${type === 'monthly' ? `_${(snapshot as MonthlySnapshot).month}` : ''}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Historical Data & Archives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="monthly">Monthly Snapshots</TabsTrigger>
              <TabsTrigger value="yearly">Yearly Snapshots</TabsTrigger>
              <TabsTrigger value="archived">Archived Reports</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2023, 2024, 2025].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Month</label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {getMonthName(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createSnapshot('monthly')} disabled={loading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Snapshot
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {monthlySnapshots.map(snapshot => (
                  <Card key={snapshot.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {getMonthName(snapshot.month)} {snapshot.year}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {snapshot.regionId}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportSnapshot(snapshot, 'monthly')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-medium">{formatCurrency(snapshot.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Invoices:</span>
                        <span className="font-medium">{snapshot.totalInvoices}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid/Unpaid:</span>
                        <span className="font-medium">{snapshot.paidInvoices}/{snapshot.unpaidInvoices}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Invoice:</span>
                        <span className="font-medium">{formatCurrency(snapshot.averageInvoiceValue)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Created: {format(new Date(snapshot.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={() => createSnapshot('yearly')} disabled={loading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Yearly Snapshot
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {yearlySnapshots.map(snapshot => (
                  <Card key={snapshot.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">Year {snapshot.year}</h4>
                        <p className="text-sm text-muted-foreground">{snapshot.regionId}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => exportSnapshot(snapshot, 'yearly')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-semibold">{formatCurrency(snapshot.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Invoices:</span>
                        <span className="font-semibold">{snapshot.totalInvoices}</span>
                      </div>
                    </div>
                    {snapshot.quarterlyBreakdown && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="text-sm font-medium mb-2">Quarterly Breakdown</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {snapshot.quarterlyBreakdown.map((q: any) => (
                            <div key={q.quarter} className="flex justify-between">
                              <span>Q{q.quarter}:</span>
                              <span>{formatCurrency(q.revenue)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Created: {format(new Date(snapshot.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="archived" className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Search Archives
                </Button>
              </div>

              <div className="space-y-2">
                {archivedReports.map(report => (
                  <Card key={report.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{report.reportName}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Type: {report.reportType}</span>
                            <span>Format: {report.format}</span>
                            <span>{format(new Date(report.generatedAt), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {report.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {report.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-secondary text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Action</th>
                      <th className="p-2 text-left">Table</th>
                      <th className="p-2 text-left">Record ID</th>
                      <th className="p-2 text-left">User</th>
                      <th className="p-2 text-left">Timestamp</th>
                      <th className="p-2 text-left">Changed Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} className="border-b">
                        <td className="p-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-2 text-sm">{log.tableName}</td>
                        <td className="p-2 text-sm font-mono text-xs">
                          {log.recordId.substring(0, 8)}...
                        </td>
                        <td className="p-2 text-sm">{log.userId?.substring(0, 8)}...</td>
                        <td className="p-2 text-sm">
                          {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                        </td>
                        <td className="p-2 text-sm">
                          {log.changedFields?.join(', ') || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}