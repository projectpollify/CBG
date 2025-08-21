import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Cutting Board Guys Platform',
  description: 'Business Management System for Cutting Board Guys Franchisees',
  keywords: 'cutting boards, business management, franchise, invoicing, customers',
  authors: [{ name: 'Cutting Board Guys Inc.' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#003F7F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-cbg-gray-50 antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Navigation Header */}
          <header className="cbg-gradient cbg-shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-white text-xl font-display font-bold">
                    Cutting Board Guys
                  </h1>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <span className="text-white/80 hover:text-white cursor-pointer transition-colors">
                    Dashboard
                  </span>
                  <span className="text-white/80 hover:text-white cursor-pointer transition-colors">
                    Customers
                  </span>
                  <span className="text-white/80 hover:text-white cursor-pointer transition-colors">
                    Invoices
                  </span>
                  <span className="text-white/80 hover:text-white cursor-pointer transition-colors">
                    Calendar
                  </span>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-cbg-gray-800 text-white py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-sm">
                  © 2024 Cutting Board Guys Inc. All rights reserved.
                </p>
                <p className="text-x
