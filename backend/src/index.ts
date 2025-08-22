import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Import route handlers
import customerRoutes from './routes/customers';

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🥖 Cutting Board Guys Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Database connection test
app.get('/api/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    const customerCount = await prisma.customer.count();
    
    res.json({
      status: 'Connected',
      message: '✅ Database connection successful',
      counts: {
        users: userCount,
        customers: customerCount
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'Error',
      message: '❌ Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Register API routes
app.use('/api/customers', customerRoutes);

// Legacy endpoints for backwards compatibility
app.get('/api/invoices', (req, res) => {
  res.json({ 
    invoices: [],
    message: 'Invoice module coming in Module 4'
  });
});

app.get('/api/settings', (req, res) => {
  res.json({ 
    settings: {},
    message: 'Settings module coming in Module 5'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    message: 'Check the API documentation for available endpoints'
  });
});

// Start server
app.listen(port, () => {
  console.log('🥖 Cutting Board Guys Backend Starting...');
  console.log(`📡 Server running on port ${port}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  console.log(`📊 Database test: http://localhost:${port}/api/test-db`);
  console.log(`👥 Customers API: http://localhost:${port}/api/customers`);
  console.log('✅ Backend ready for connections!\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});
