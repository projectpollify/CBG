'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';
import AppointmentModal from '@/components/AppointmentModal';
import { Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleAppointmentSave = () => {
    window.location.reload();
  };

  const handleAppointmentDrop = (appointment: any) => {
    console.log('Appointment moved:', appointment);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-cbg-navy flex items-center">
            <img 
              src="/images/cbg-logo.png" 
              alt="CBG" 
              className="h-16 w-auto mr-4"
            />
            Calendar
          </h1>
          <button
            onClick={() => {
              setSelectedAppointment(null);
              setSelectedDate(undefined);
              setShowAppointmentModal(true);
            }}
            className="bg-cbg-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Calendar
          onAppointmentClick={handleAppointmentClick}
          onDateClick={handleDateClick}
          onAppointmentDrop={handleAppointmentDrop}
        />
      </div>

      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setSelectedAppointment(null);
          setSelectedDate(undefined);
        }}
        onSave={handleAppointmentSave}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
}