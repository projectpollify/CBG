import { Router, Request, Response } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

const router = Router();

// Get all appointments
router.get('/', async (req: Request, res: Response) => {
  try {
    const filter = {
      regionId: req.query.regionId as string,
      customerId: req.query.customerId as string,
      type: req.query.type as AppointmentType,
      status: req.query.status as AppointmentStatus,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };

    const appointments = await AppointmentService.getAppointments(filter);
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointments',
      error: error.message 
    });
  }
});

// Get appointment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await AppointmentService.getAppointmentById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ 
      message: 'Failed to fetch appointment',
      error: error.message 
    });
  }
});

// Create new appointment
router.post('/', async (req: Request, res: Response) => {
  try {
    const appointment = await AppointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      message: 'Failed to create appointment',
      error: error.message 
    });
  }
});

// Update appointment
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await AppointmentService.updateAppointment(req.params.id, req.body);
    res.json(appointment);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      message: 'Failed to update appointment',
      error: error.message 
    });
  }
});

// Delete appointment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await AppointmentService.deleteAppointment(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ 
      message: 'Failed to delete appointment',
      error: error.message 
    });
  }
});

// Get upcoming appointments
router.get('/upcoming/:regionId', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const appointments = await AppointmentService.getUpcomingAppointments(
      req.params.regionId,
      days
    );
    res.json(appointments);
  } catch (error: any) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ 
      message: 'Failed to fetch upcoming appointments',
      error: error.message 
    });
  }
});

export default router;