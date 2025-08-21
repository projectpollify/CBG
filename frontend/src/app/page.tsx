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
                Create and send professional invoices with automat
