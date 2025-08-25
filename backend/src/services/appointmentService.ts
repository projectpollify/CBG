import { PrismaClient, Appointment, AppointmentType, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAppointmentData {
  regionId: string;
  title: string;
  description?: string;
  type: AppointmentType;
  customerId?: string;
  startDate: string | Date;
  endDate: string | Date;
  allDay?: boolean;
  location?: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  type?: AppointmentType;
  customerId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  allDay?: boolean;
  location?: string;
  status?: AppointmentStatus;
}

export interface AppointmentFilter {
  regionId?: string;
  customerId?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  startDate?: string | Date;
  endDate?: string | Date;
}

export class AppointmentService {
  static async getAppointments(filter: AppointmentFilter = {}): Promise<Appointment[]> {
    const where: any = {};

    if (filter.regionId) {
      where.regionId = filter.regionId;
    }

    if (filter.customerId) {
      where.customerId = filter.customerId;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.startDate || filter.endDate) {
      where.startDate = {};
      if (filter.startDate) {
        where.startDate.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.startDate.lte = new Date(filter.endDate);
      }
    }

    return await prisma.appointment.findMany({
      where,
      include: {
        customer: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
  }

  static async getAppointmentById(id: string): Promise<Appointment | null> {
    return await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true
      }
    });
  }

  static async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const appointmentData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status || AppointmentStatus.SCHEDULED,
      allDay: data.allDay || false
    };

    return await prisma.appointment.create({
      data: appointmentData,
      include: {
        customer: true
      }
    });
  }

  static async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const updateData: any = { ...data };
    
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        customer: true
      }
    });
  }

  static async deleteAppointment(id: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id }
    });
  }

  static async getUpcomingAppointments(regionId: string, days: number = 7): Promise<Appointment[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await prisma.appointment.findMany({
      where: {
        regionId,
        startDate: {
          gte: startDate,
          lte: endDate
        },
        status: AppointmentStatus.SCHEDULED
      },
      include: {
        customer: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
  }
}