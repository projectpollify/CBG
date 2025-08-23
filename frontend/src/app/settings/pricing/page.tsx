'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Save, 
  ArrowLeft,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { ServiceType, ServicePricing } from 'cbg-shared';

interface EditableService {
  serviceType: ServiceType;
  pricing: ServicePricing;
  isEditing: boolean;
  tempPrice: number;
  tempDescription: string;
}

export default function ServicePricingPage() {
  const [services, setServices] = useState<EditableService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServicePricing();
  }, []);

  const fetchServicePricing = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/invoices/settings/service-pricing');
      const data = await response.json();
      
      if (data.success) {
        const servicesArray: EditableService[] = Object.entries(data.data).map(([key, value]: [string, any]) => ({
          serviceType: key as ServiceType,
          pricing: value as ServicePricing,
          isEditing: false,
          tempPrice: value.unitPrice,
          tempDescription: value.description
        }));
        setServices(servicesArray);
      }
    } catch (error) {
      console.error('Error fetching service pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => {
    const updatedServices = [...services];
    updatedServices[index].isEditing = true;
    updatedServices[index].tempPrice = updatedServices[index].pricing.unitPrice;
    updatedServices[index].tempDescription = updatedServices[index].pricing.description;
    setServices(updatedServices);
  };

  const handleCancel = (index: number) => {
    const updatedServices = [...services];
    updatedServices[index].isEditing = false;
    setServices(updatedServices);
  };

  const handleSave = async (index: number) => {
    const service = services[index];
    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:3001/api/invoices/settings/service-pricing/${service.serviceType}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            unitPrice: service.tempPrice,
            description: service.tempDescription
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const updatedServices = [...services];
        updatedServices[index].pricing.unitPrice = service.tempPrice;
        updatedServices[index].pricing.description = service.tempDescription;
        updatedServices[index].isEditing = false;
        setServices(updatedServices);
      } else {
        alert('Error updating service pricing');
      }
    } catch (error) {
      console.error('Error saving service pricing:', error);
      alert('Error saving service pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async (percentage: number) => {
    if (!confirm(`Are you sure you want to ${percentage > 0 ? 'increase' : 'decrease'} all prices by ${Math.abs(percentage)}%?`)) {
      return;
    }

    setSaving(true);
    const multiplier = 1 + (percentage / 100);

    try {
      for (const service of services) {
        const newPrice = Math.round(service.pricing.unitPrice * multiplier * 100) / 100;
        
        await fetch(
          `http://localhost:3001/api/invoices/settings/service-pricing/${service.serviceType}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              unitPrice: newPrice,
              description: service.pricing.description
            })
          }
        );
      }
      
      fetchServicePricing();
      alert('All prices updated successfully!');
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Error updating prices');
    } finally {
      setSaving(false);
    }
  };

  const getServiceDisplayName = (serviceType: ServiceType): string => {
    const names: Record<ServiceType, string> = {
      [ServiceType.RESURFACING]: 'Resurfacing',
      [ServiceType.NEW_BOARD]: 'New Board Sales',
      [ServiceType.STAINLESS_INSERT]: 'Stainless Insert',
      [ServiceType.STAINLESS_CLAMPS]: 'Stainless Clamps',
      [ServiceType.BOARD_MODIFICATIONS]: 'Board Modifications',
      [ServiceType.SPECIAL]: 'Special Services'
    };
    return names[serviceType] || serviceType;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1) {
      return `$${amount.toFixed(2)}`;
    } else {
      return `$${amount.toFixed(3)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings"
          className="inline-flex items-center text-[#003F7F] hover:text-[#002a55] mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Settings
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#003F7F]">Service Pricing</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => handleBulkUpdate(10)}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              +10% All Prices
            </button>
            <button
              onClick={() => handleBulkUpdate(-10)}
              disabled={saving}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              -10% All Prices
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-[#003F7F] mr-3" />
            <h2 className="text-xl font-semibold text-[#003F7F]">Service Pricing Configuration</h2>
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service, index) => (
              <tr key={service.serviceType}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {getServiceDisplayName(service.serviceType)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {service.isEditing ? (
                    <input
                      type="text"
                      value={service.tempDescription}
                      onChange={(e) => {
                        const updatedServices = [...services];
                        updatedServices[index].tempDescription = e.target.value;
                        setServices(updatedServices);
                      }}
                      className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">
                      {service.pricing.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {service.isEditing ? (
                    <input
                      type="number"
                      value={service.tempPrice}
                      onChange={(e) => {
                        const updatedServices = [...services];
                        updatedServices[index].tempPrice = parseFloat(e.target.value) || 0;
                        setServices(updatedServices);
                      }}
                      className="w-32 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      step="0.001"
                      min="0"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(service.pricing.unitPrice)}
                      <span className="text-gray-500 ml-2">
                        per unit
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {service.isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(index)}
                        disabled={saving}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancel(index)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-[#FF6B35] hover:text-[#ff8555]"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing Guidelines */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Pricing Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">Low-Volume Services (per unit):</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Resurfacing: $0.06 - $0.08</li>
              <li>New Boards: $0.08 - $0.12</li>
              <li>Modifications: $8 - $15</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">High-Value Services:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stainless Insert: $400 - $500</li>
              <li>Stainless Clamps: $20 - $30</li>
              <li>Special Services: Variable pricing</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-blue-700">
          Note: All prices are automatically applied to new invoices. Changes to pricing will not affect existing invoices.
        </p>
      </div>
    </div>
  );
}