import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  Menu,
  X,
  ChefHat,
  BarChart3
} from 'lucide-react';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cutting Board Guys - Business Management Platform',
  description: 'Manage customers, invoices, and appointments for Cutting Board Guys franchise operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <nav className="bg-gradient-to-r from-cbg-navy to-cbg-navy-dark border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo and Brand */}
                <div className="flex items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="bg-cbg-orange p-2 rounded-lg">
                      <ChefHat className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-white">
                      <div className="text-lg font-bold">Cutting Board Guys</div>
                      <div className="text-xs text-cbg-navy-light">Business Platform</div>
                    </div>
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link
                      href="/"
                      className="text-white hover:bg-cbg-navy-light px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Home className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      href="/customers"
                      className="text-white hover:bg-cbg-navy-light px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Users className="w-4 h-4" />
                      <span>Customers</span>
                    </Link>
                    
                    <Link
                      href="/invoices"
                      className="text-white hover:bg-cbg-navy-light px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Invoices</span>
                    </Link>
                    
                    <Link
                      href="/reports"
                      className="text-white hover:bg-cbg-navy-light px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Reports</span>
                    </Link>
                    
                    <Link
                      href="/appointments"
                      className="text-cbg-navy-light hover:bg-cbg-navy-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Appointments</span>
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="text-white hover:bg-cbg-navy-light px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    type="button"
                    className="mobile-menu-button bg-cbg-navy-dark inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-cbg-navy-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    aria-controls="mobile-menu"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    <Menu className="h-6 w-6 menu-open" />
                    <X className="h-6 w-6 menu-close hidden" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden hidden" id="mobile-menu">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-cbg-navy-dark border-t border-cbg-navy-light">
                <Link
                  href="/"
                  className="text-white hover:bg-cbg-navy-light block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  href="/customers"
                  className="text-white hover:bg-cbg-navy-light block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Customers</span>
                </Link>
                
                <Link
                  href="/invoices"
                  className="text-white hover:bg-cbg-navy-light block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Invoices</span>
                </Link>
                
                <Link
                  href="/reports"
                  className="text-white hover:bg-cbg-navy-light block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
                
                <Link
                  href="/appointments"
                  className="text-cbg-navy-light hover:bg-cbg-navy-light hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="text-white hover:bg-cbg-navy-light block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-600">
                  <ChefHat className="h-5 w-5 text-cbg-orange" />
                  <span className="text-sm">
                    © 2024 Cutting Board Guys. All rights reserved.
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Module 4: Invoice Management</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Mobile Menu Toggle Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const menuButton = document.querySelector('.mobile-menu-button');
                const mobileMenu = document.getElementById('mobile-menu');
                const menuOpenIcon = document.querySelector('.menu-open');
                const menuCloseIcon = document.querySelector('.menu-close');
                
                if (menuButton && mobileMenu) {
                  menuButton.addEventListener('click', function() {
                    const isOpen = !mobileMenu.classList.contains('hidden');
                    
                    if (isOpen) {
                      mobileMenu.classList.add('hidden');
                      menuOpenIcon.classList.remove('hidden');
                      menuCloseIcon.classList.add('hidden');
                    } else {
                      mobileMenu.classList.remove('hidden');
                      menuOpenIcon.classList.add('hidden');
                      menuCloseIcon.classList.remove('hidden');
                    }
                  });
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
