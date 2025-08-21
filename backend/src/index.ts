import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// ========== MIDDLEWARE ==========
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ========== HEALTH CHECK ==========
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Cutting Board Guys API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== TEST DATABASE CONNECTION ==========
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.json({
      status: 'success',
      message: 'Database connection successful',
      database: 'PostgreSQL'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========== BASIC ROUTES ==========

// Get all customers (placeholder)
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { businessName: 'asc' }
    });
    res.json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all invoices (placeholder)
app.get('/api/invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { invoiceDate: 'desc' }
    });
    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get settings (placeholder)
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findMany();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========== 404 HANDLER ==========
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// ========== ERROR HANDLER ==========
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ========== START SERVER ==========
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║     Cutting Board Guys Platform       ║
║         Backend Server                 ║
╠════════════════════════════════════════╣
║  Status: RUNNING                       ║
║  Port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
║                                        ║
║  API Endpoints:                        ║
║  http://localhost:${PORT}/api/health      ║
║  http://localhost:${PORT}/api/test-db     ║
║  http://localhost:${PORT}/api/customers   ║
║  http://localhost:${PORT}/api/invoices    ║
║  http://localhost:${PORT}/api/settings    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0
