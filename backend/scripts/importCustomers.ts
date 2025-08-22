import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ImportCustomer {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  id: string;
}

async function importCustomers() {
  try {
    console.log('🚀 Starting customer import...');
    
    // Read the customer JSON file from project root
    const jsonPath = path.join(__dirname, '../../customer_list_FINAL_GIST_READY.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const customers: ImportCustomer[] = JSON.parse(jsonData);
    
    console.log(`📊 Found ${customers.length} customers to import`);
    
    // Clear existing customers
    await prisma.customer.deleteMany();
    console.log('🗑️  Cleared existing customers');
    
    let imported = 0;
    let skipped = 0;
    
    for (const customer of customers) {
      try {
        // Determine region from address
        const address = customer.address.toLowerCase();
        let region = 'BC'; // Default
        
        if (address.includes('vancouver') && !address.includes('north') && !address.includes('west')) {
          region = 'Vancouver';
        } else if (address.includes('north vancouver')) {
          region = 'North Vancouver';
        } else if (address.includes('west vancouver')) {
          region = 'West Vancouver';
        } else if (address.includes('burnaby')) {
          region = 'Burnaby';
        } else if (address.includes('surrey')) {
          region = 'Surrey';
        } else if (address.includes('richmond')) {
          region = 'Richmond';
        } else if (address.includes('coquitlam')) {
          region = 'Coquitlam';
        } else if (address.includes('langley')) {
          region = 'Langley';
        } else if (address.includes('victoria')) {
          region = 'Victoria';
        } else if (address.includes('nanaimo')) {
          region = 'Nanaimo';
        }
        
        await prisma.customer.create({
          data: {
            fullName: customer.fullName || 'Unknown',
            company: customer.company,
            phone: customer.phone || '', // Empty for now
            email: customer.email || '', // Empty for now  
            address: customer.address,
            notes: customer.notes,
            region: region
          }
        });
        
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`✅ Imported ${imported} customers...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to import customer: ${customer.company}`, error);
        skipped++;
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${imported} customers`);
    console.log(`❌ Skipped: ${skipped} customers`);
    console.log(`📊 Total: ${imported + skipped} customers processed`);
    
    // Show summary by region
    const regionCounts = await prisma.customer.groupBy({
      by: ['region'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📍 Customers by region:');
    regionCounts.forEach(region => {
      console.log(`${region.region}: ${region._count.id} customers`);
    });
    
  } catch (error) {
    console.error('💥 Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importCustomers();
