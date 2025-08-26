import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importCustomers() {
  try {
    // Find the latest export file
    const exportDir = path.join(__dirname, '..', 'exports');
    
    if (!fs.existsSync(exportDir)) {
      console.error('❌ No exports directory found');
      process.exit(1);
    }
    
    const files = fs.readdirSync(exportDir)
      .filter(f => f.startsWith('customers-export-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.error('❌ No export files found');
      process.exit(1);
    }
    
    const latestFile = files[0];
    const filepath = path.join(exportDir, latestFile);
    
    console.log(`📂 Importing from: ${latestFile}`);
    
    const customersData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    console.log(`📊 Found ${customersData.length} customers to import`);
    
    // Check if we should clear existing data
    const existingCount = await prisma.customer.count();
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} customers`);
      console.log('Skipping import to avoid duplicates');
      console.log('To force import, manually clear the customer table first');
      process.exit(0);
    }
    
    // Import customers in batches
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < customersData.length; i += batchSize) {
      const batch = customersData.slice(i, i + batchSize);
      
      await prisma.customer.createMany({
        data: batch.map((customer: any) => ({
          id: customer.id,
          regionId: customer.regionId,
          businessName: customer.businessName,
          contactName: customer.contactName,
          email: customer.email || null,
          phone: customer.phone || null,
          street: customer.street || null,
          city: customer.city || null,
          province: customer.province || 'BC',
          postalCode: customer.postalCode || null,
          notes: customer.notes || null,
          status: customer.status || 'ACTIVE',
          createdAt: new Date(customer.createdAt),
          updatedAt: new Date(customer.updatedAt),
          lastContactDate: customer.lastContactDate ? new Date(customer.lastContactDate) : null
        })),
        skipDuplicates: true
      });
      
      imported += batch.length;
      console.log(`  Imported ${imported}/${customersData.length} customers...`);
    }
    
    console.log(`✅ Successfully imported ${imported} customers`);
    
    // Verify import
    const finalCount = await prisma.customer.count();
    console.log(`📊 Total customers in database: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importCustomers();