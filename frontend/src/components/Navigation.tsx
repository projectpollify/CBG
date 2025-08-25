'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  Menu,
  X,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Calendar', href: '/appointments', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-gradient-to-r from-cbg-navy to-cbg-navy-dark border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/cbg-logo.png" 
                alt="Cutting Board Guys" 
                className="w-auto"
                style={{ height: '56px', maxWidth: '400px' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-cbg-navy-light text-white'
                        : 'text-white hover:bg-cbg-navy-light'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-cbg-navy-light">
              <span className="text-white text-sm">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-white hover:bg-cbg-navy-light p-2 rounded-md transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-cbg-navy-light p-2 rounded-md"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cbg-navy-dark">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-cbg-navy-light text-white'
                      : 'text-white hover:bg-cbg-navy-light'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left text-white hover:bg-cbg-navy-light block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              <div className="flex items-center space-x-2">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </button>
          </div>
          <div className="px-4 py-3 border-t border-cbg-navy-light">
            <p className="text-cbg-navy-light text-sm">
              Logged in as: {user?.email}
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}