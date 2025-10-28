'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

interface Customer {
  id: string;
  businessName: string;
  contactName: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
  appointment?: any;
  selectedDate?: Date;
}

const appointmentTypes = [
  { value: 'DELIVERY', label: 'Delivery', color: 'bg-green-100 text-green-800' },
  { value: 'PICKUP', label: 'Pickup', color: 'bg-blue-100 text-blue-800' },
  { value: 'SERVICE', label: 'Service', color: 'bg-amber-100 text-amber-800' },
  { value: 'MEETING', label: 'Meeting', color: 'bg-purple-100 text-purple-800' },
  { value: 'TASK', label: 'Task', color: 'bg-pink-100 text-pink-800' },
  { value: 'OTHER', label: 'Other', color: 'bg-indigo-100 text-indigo-800' }
];

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointment,
  selectedDate
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SERVICE',
    customerId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    location: '',
    status: 'SCHEDULED'
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      setCustomerSearch(''); // Clear search when opening
      setSelectedCustomerIndex(-1);
      
      if (appointment) {
        const start = new Date(appointment.startDate);
        const end = new Date(appointment.endDate);
        
        setFormData({
          title: appointment.title || '',
          description: appointment.description || '',
          type: appointment.type || 'SERVICE',
          customerId: appointment.customerId || '',
          startDate: format(start, 'yyyy-MM-dd'),
          startTime: format(start, 'HH:mm'),
          endDate: format(end, 'yyyy-MM-dd'),
          endTime: format(end, 'HH:mm'),
          allDay: appointment.allDay || false,
          location: appointment.location || '',
          status: appointment.status || 'SCHEDULED'
        });
      } else if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        setFormData(prev => ({
          ...prev,
          startDate: dateStr,
          endDate: dateStr,
          startTime: '09:00',
          endTime: '10:00'
        }));
      }
    }
  }, [isOpen, appointment, selectedDate]);

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch && customerSearch.length > 1) {
      // Only filter if more than 1 character typed
      const filtered = customers.filter(customer => 
        customer.businessName.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.contactName.toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      // Show all customers if empty or single character
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCustomers = async () => {
    try {
      // First, get the total count
      const firstResponse = await fetch('/api/customers?limit=1');
      if (!firstResponse.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const firstResult = await firstResponse.json();
      const totalCustomers = firstResult.pagination?.total || 0;
      
      // Now fetch all customers with a higher limit
      const response = await fetch(`http://localhost:3001/api/customers?limit=${totalCustomers || 1000}`);
      
      if (response.ok) {
        const result = await response.json();
        // Extract customers from the data property
        const customerList = result.data || result;
        const customersArray = Array.isArray(customerList) ? customerList : [];
        // Sort customers alphabetically by business name
        const sortedCustomers = customersArray.sort((a, b) => 
          a.businessName.toLowerCase().localeCompare(b.businessName.toLowerCase())
        );
        setCustomers(sortedCustomers);
        setFilteredCustomers(sortedCustomers);
        console.log(`Loaded ${sortedCustomers.length} customers`);
      } else {
        console.error('Failed to fetch customers:', response.status);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const startDateTime = formData.allDay 
      ? `${formData.startDate}T00:00:00`
      : `${formData.startDate}T${formData.startTime}:00`;
    
    // If no end time provided, default to 1 hour after start time
    let endDateTime;
    if (formData.allDay) {
      endDateTime = `${formData.endDate || formData.startDate}T23:59:59`;
    } else if (formData.endTime) {
      endDateTime = `${formData.endDate || formData.startDate}T${formData.endTime}:00`;
    } else {
      // Default to 1 hour after start time if no end time provided
      const startDate = new Date(startDateTime);
      startDate.setHours(startDate.getHours() + 1);
      endDateTime = startDate.toISOString();
    }

    const appointmentData: any = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      customerId: formData.customerId || null,
      startDate: new Date(startDateTime).toISOString(),
      endDate: new Date(endDateTime).toISOString(),
      allDay: formData.allDay,
      location: formData.location,
      status: formData.status
    };
    
    // Only add regionId for new appointments
    if (!appointment) {
      appointmentData.regionId = localStorage.getItem('regionId') || '';
    }

    console.log('Submitting appointment data:', appointmentData);
    
    try {
      const url = appointment 
        ? `http://localhost:3001/api/appointments/${appointment.id}`
        : 'http://localhost:3001/api/appointments';
      
      const method = appointment ? 'PUT' : 'POST';
      
      console.log('Making request to:', url);
      console.log('Method:', method);
      console.log('Appointment ID:', appointment?.id);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      console.log('Response status:', response.status);
      
      if (response.ok || response.status === 201) {
        const savedAppointment = await response.json();
        console.log('Appointment saved successfully:', savedAppointment);
        resetForm();
        onClose();
        // Call onSave which will trigger the reload
        onSave(savedAppointment);
      } else {
        console.error('Failed to save appointment - Status:', response.status);
        try {
          const error = await response.json();
          console.error('Error details:', error);
          const action = appointment ? 'update' : 'create';
          alert(error.message || `Failed to ${action} appointment`);
        } catch (e) {
          const action = appointment ? 'update' : 'create';
          alert(`Failed to ${action} appointment`);
        }
      }
    } catch (error: any) {
      console.error('Network or other error:', error);
      // Don't show error if it's just a reload issue
      if (!error?.message?.includes('reload')) {
        alert('Failed to create appointment - please check if servers are running');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'SERVICE',
      customerId: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: false,
      location: '',
      status: 'SCHEDULED'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type*
            </label>
            <div className="grid grid-cols-3 gap-2">
              {appointmentTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.type === type.value
                      ? type.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <div className="relative" ref={customerDropdownRef}>
              <input
                type="text"
                placeholder="Type to search or select customer..."
                value={customerSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerSearch(value);
                  setShowCustomerDropdown(true);
                  
                  // Jump to first customer starting with typed letter
                  if (value.length === 1) {
                    const index = customers.findIndex(c => 
                      c.businessName.toLowerCase().startsWith(value.toLowerCase())
                    );
                    if (index >= 0) {
                      setSelectedCustomerIndex(index);
                      // Scroll to that customer in the dropdown
                      setTimeout(() => {
                        const dropdown = document.querySelector('.customer-dropdown');
                        const selectedItem = dropdown?.children[index + 1]; // +1 for "No customer selected" option
                        selectedItem?.scrollIntoView({ block: 'nearest' });
                      }, 0);
                    }
                  } else {
                    setSelectedCustomerIndex(-1);
                  }
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedCustomerIndex(prev => 
                      prev < filteredCustomers.length - 1 ? prev + 1 : prev
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedCustomerIndex(prev => prev > 0 ? prev - 1 : 0);
                  } else if (e.key === 'Enter' && selectedCustomerIndex >= 0) {
                    e.preventDefault();
                    const selected = filteredCustomers[selectedCustomerIndex];
                    if (selected) {
                      setFormData({ ...formData, customerId: selected.id });
                      setCustomerSearch(`${selected.businessName} - ${selected.contactName}`);
                      setShowCustomerDropdown(false);
                    }
                  } else if (e.key === 'Escape') {
                    setShowCustomerDropdown(false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {showCustomerDropdown && (
                <div className="customer-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
                  {filteredCustomers.length === 0 && customers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">No matching customers</div>
                  ) : (
                    <>
                      <div 
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setFormData({ ...formData, customerId: '' });
                          setCustomerSearch('');
                          setShowCustomerDropdown(false);
                        }}
                      >
                        No customer selected
                      </div>
                      {filteredCustomers.map((customer, index) => (
                        <div
                          key={customer.id}
                          className={`px-3 py-2 cursor-pointer ${
                            index === selectedCustomerIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                          } ${formData.customerId === customer.id ? 'font-semibold' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, customerId: customer.id });
                            setCustomerSearch(`${customer.businessName} - ${customer.contactName}`);
                            setShowCustomerDropdown(false);
                          }}
                          onMouseEnter={() => setSelectedCustomerIndex(index)}
                        >
                          {customer.businessName} - {customer.contactName}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
              All day
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!formData.allDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time*
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional - defaults to start date"
              />
            </div>
            {!formData.allDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional - defaults to 1 hour"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Customer site, Workshop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or details..."
            />
          </div>

          {appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (appointment ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}