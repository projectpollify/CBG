import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportCustomers() {
  try {
    console.log('🔄 Exporting customers from database...');
    
    // Fetch all customers
    const customers = await prisma.customer.findMany({
      orderBy: {
        businessName: 'asc'
      }
    });
    
    console.log(`✅ Found ${customers.length} customers`);
    
    // Create export directory
    const exportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Save to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `customers-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(customers, null, 2));
    
    console.log(`✅ Exported to: ${filepath}`);
    console.log(`📊 Total customers: ${customers.length}`);
    
    // Group by region for summary
    const regionCounts = customers.reduce((acc: Record<string, number>, customer) => {
      acc[customer.regionId] = (acc[customer.regionId] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📍 Customers by region:');
    Object.entries(regionCounts).forEach(([region, count]) => {
      console.log(`  ${region}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportCustomers();