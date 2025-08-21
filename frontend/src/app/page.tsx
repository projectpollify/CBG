export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="cbg-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Welcome to Cutting Board Guys Platform
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Your complete business management solution for franchise operations
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-cbg-navy text-center mb-12">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Management */}
            <div className="bg-white p-6 rounded-lg cbg-shadow hover:cbg-shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cbg-orange rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-cbg-navy mb-2">
                Customer Management
              </h3>
              <p className="text-cbg-gray-600 text-sm">
                Track all your restaurant clients and their cutting board needs
              </p>
            </div>

            {/* Invoicing */}
            <div className="bg-white p-6 rounded-lg cbg-shadow hover:cbg-shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cbg-orange rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-cbg-navy mb-2">
                Smart Invoicing
              </h3>
              <p className="text-cbg-gray-600 text-sm">
                Create and send professional invoices with automatic calculations
              </p>
            </div>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-lg cbg-shadow hover:cbg-shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cbg-orange rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-cbg-navy mb-2">
                Calendar & Scheduling
              </h3>
              <p className="text-cbg-gray-600 text-sm">
                Manage pickups, deliveries, and appointments efficiently
              </p>
            </div>

            {/* Reports */}
            <div className="bg-white p-6 rounded-lg cbg-shadow hover:cbg-shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cbg-orange rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-cbg-navy mb-2">
                Sales Reports
              </h3>
              <p className="text-cbg-gray-600 text-sm">
                Track revenue, taxes, and business growth with detailed reports
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="bg-cbg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg p-8 cbg-shadow">
            <h2 className="text-2xl font-display font-bold text-cbg-navy mb-4">
              🚀 Platform Status
            </h2>
            <p className="text-cbg-gray-700 mb-6">
              Foundation Module is being built. This is the beginning of your comprehensive 
              business management system designed specifically for Cutting Board Guys franchisees.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              System Active
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cbg-orange">0</div>
              <div className="text-sm text-cbg-gray-600 mt-1">Active Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cbg-orange">0</div>
              <div className="text-sm text-cbg-gray-600 mt-1">Invoices Sent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cbg-orange">$0</div>
              <div className="text-sm text-cbg-gray-600 mt-1">Revenue This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cbg-orange">0</div>
              <div className="text-sm text-cbg-gray-600 mt-1">Appointments Today</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
