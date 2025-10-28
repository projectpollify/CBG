import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
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
          <ClientLayout>
            {children}
            
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <img 
                      src="/images/cbg-logo.png" 
                      alt="CBG" 
                      className="h-12 w-auto"
                    />
                    <span className="text-sm">
                      © 2024 Cutting Board Guys Inc. All rights reserved.
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Business Management Platform v1.0</span>
                  </div>
                </div>
              </div>
            </footer>
          </ClientLayout>
        </div>
      </body>
    </html>
  );
}