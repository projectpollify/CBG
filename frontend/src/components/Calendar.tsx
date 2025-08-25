'use client';

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, DateClickArg, EventDropArg } from '@fullcalendar/core';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  type: 'DELIVERY' | 'PICKUP' | 'SERVICE' | 'MEETING' | 'TASK' | 'OTHER';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  customerId?: string;
  customerName?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
}

interface CalendarProps {
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
  onAppointmentDrop?: (appointment: Appointment) => void;
}

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'DELIVERY':
      return '#10B981'; // green
    case 'PICKUP':
      return '#3B82F6'; // blue
    case 'SERVICE':
      return '#F59E0B'; // amber
    case 'MEETING':
      return '#8B5CF6'; // purple
    case 'TASK':
      return '#6B7280'; // gray
    default:
      return '#64748B'; // slate
  }
};

const getStatusOpacity = (status: string): number => {
  switch (status) {
    case 'COMPLETED':
      return 0.6;
    case 'CANCELLED':
      return 0.3;
    default:
      return 1;
  }
};

export default function Calendar({ 
  onAppointmentClick, 
  onDateClick, 
  onAppointmentDrop 
}: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const appointment = appointments.find(apt => apt.id === info.event.id);
    if (appointment && onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const handleDateClick = (info: DateClickArg) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const appointment = appointments.find(apt => apt.id === info.event.id);
    if (!appointment) return;

    const updatedAppointment = {
      ...appointment,
      startDate: info.event.start?.toISOString() || appointment.startDate,
      endDate: info.event.end?.toISOString() || appointment.endDate,
      allDay: info.event.allDay
    };

    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedAppointment)
      });

      if (response.ok) {
        await fetchAppointments();
        if (onAppointmentDrop) {
          onAppointmentDrop(updatedAppointment);
        }
      } else {
        info.revert();
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      info.revert();
    }
  };

  const calendarEvents = appointments
    .filter(apt => apt.status !== 'COMPLETED')
    .map(apt => ({
      id: apt.id,
      title: apt.title,
      start: apt.startDate,
      end: apt.endDate,
      allDay: apt.allDay,
      backgroundColor: getTypeColor(apt.type),
      borderColor: getTypeColor(apt.type),
      opacity: getStatusOpacity(apt.status),
      extendedProps: {
        description: apt.description,
        type: apt.type,
        status: apt.status,
        customerId: apt.customerId,
        customerName: apt.customerName,
        location: apt.location
      }
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="calendar-container bg-white rounded-lg shadow-sm p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        events={calendarEvents}
        editable={true}
        droppable={true}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        height="auto"
        nextDayThreshold="00:00:00"
        eventDisplay="block"
        displayEventEnd={true}
        dayMaxEvents={3}
        eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        weekends={true}
        firstDay={0}
        nowIndicator={true}
      />
    </div>
  );
}