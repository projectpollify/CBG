'use client';

import Link from 'next/link';
import { 
  TrendingUp, 
  FileText, 
  DollarSign, 
  BarChart3,
  Calendar,
  Download,
  ChevronRight
} from 'lucide-react';

export default function ReportsPage() {
  const reportCards = [
    {
      title: 'Sales Reports',
      description: 'View sales volume and revenue by service type with tax reporting',
      icon: TrendingUp,
      href: '/reports/sales',
      color: 'bg-green-500',
      stats: 'Monthly, Quarterly, Yearly'
    },
    {
      title: 'Invoice Analytics',
      description: 'Track outstanding invoices, payment trends, and customer analysis',
      icon: FileText,
      href: '/reports/invoices',
      color: 'bg-blue-500',
      stats: 'Real-time tracking'
    },
    {
      title: 'Tax Summary',
      description: 'GST and PST collected for government filing and compliance',
      icon: DollarSign,
      href: '/reports/sales#tax',
      color: 'bg-purple-500',
      stats: 'Export ready'
    },
    {
      title: 'Customer Analysis',
      description: 'Top customers by revenue and customer lifetime value',
      icon: BarChart3,
      href: '#',
      color: 'bg-[#FF6B35]',
      stats: 'Coming Soon',
      isComingSoon: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003F7F] mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive business insights and tax reporting</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#003F7F] mb-4">Quick Export</h2>
        <div className="flex flex-wrap gap-4">
          <button className="inline-flex items-center px-4 py-2 bg-[#003F7F] text-white rounded-lg hover:bg-[#002a55] transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Monthly Report
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            Tax Report (Current Quarter)
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-4 h-4 mr-2" />
            Customer Statements
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((card) => {
          const isComingSoon = (card as any).isComingSoon;
          const CardWrapper = isComingSoon ? 'div' : Link;
          const cardProps = isComingSoon 
            ? { className: "bg-white rounded-lg shadow opacity-75 cursor-not-allowed" }
            : { href: card.href, className: "bg-white rounded-lg shadow hover:shadow-lg transition-shadow" };
          
          return (
            <CardWrapper
              key={card.href}
              {...cardProps}
            >
              <div className="p-6 relative">
                {isComingSoon && (
                  <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    COMING SOON
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className={`${card.color} p-3 rounded-lg ${isComingSoon ? 'opacity-60' : ''}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  {!isComingSoon && <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
                
                <h3 className={`text-xl font-semibold mb-2 ${isComingSoon ? 'text-gray-500' : 'text-[#003F7F]'}`}>
                  {card.title}
                </h3>
                
                <p className={`mb-3 ${isComingSoon ? 'text-gray-400' : 'text-gray-600'}`}>
                  {card.description}
                </p>
                
                <div className={`text-sm font-medium ${isComingSoon ? 'text-gray-400' : 'text-[#FF6B35]'}`}>
                  {card.stats}
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gradient-to-r from-[#003F7F] to-[#002a55] rounded-lg shadow p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Current Month Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">Invoices Issued</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">GST Collected</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">PST Collected</p>
            <p className="text-2xl font-bold">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}