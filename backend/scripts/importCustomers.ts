import { PrismaClient, CustomerStatus } from '@prisma/client';
import * as fs from 'fs';

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
    console.log('🥖 Cutting Board Guys Customer Import Tool');
    console.log('=========================================\n');
    console.log('🚀 Starting customer import...');
    
    // Read the customer JSON file
    const jsonPath = '/Users/shawn/Desktop/CBG inc./customer_list_FINAL_GIST_READY.json';
    console.log(`📂 Reading file: ${jsonPath}`);
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const customers: ImportCustomer[] = JSON.parse(jsonData);
    
    console.log(`📊 Found ${customers.length} customers to import`);
    
    // Check existing customers
    const existingCount = await prisma.customer.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing customers - keeping them`);
    }
    
    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];
    
    for (const customer of customers) {
      try {
        // Parse address to extract components
        const addressParts = customer.address.split(',').map(part => part.trim());
        let street = addressParts[0] || 'Unknown Street';
        let city = 'Vancouver'; // Default
        let province = 'BC';
        let postalCode = 'V0V 0V0'; // Default postal code
        
        // Try to extract city from address
        if (addressParts.length >= 2) {
          // Check if the second part contains city info
          const cityPart = addressParts[1] || addressParts[0];
          
          // Extract city name and handle common patterns
          if (cityPart.toLowerCase().includes('vancouver')) {
            if (cityPart.toLowerCase().includes('north')) {
              city = 'North Vancouver';
            } else if (cityPart.toLowerCase().includes('west')) {
              city = 'West Vancouver';
            } else {
              city = 'Vancouver';
            }
          } else if (cityPart.toLowerCase().includes('burnaby')) {
            city = 'Burnaby';
          } else if (cityPart.toLowerCase().includes('richmond')) {
            city = 'Richmond';
          } else if (cityPart.toLowerCase().includes('surrey')) {
            city = 'Surrey';
          } else if (cityPart.toLowerCase().includes('coquitlam')) {
            city = 'Coquitlam';
          } else if (cityPart.toLowerCase().includes('langley')) {
            city = 'Langley';
          } else if (cityPart.toLowerCase().includes('victoria')) {
            city = 'Victoria';
          } else if (cityPart.toLowerCase().includes('nanaimo')) {
            city = 'Nanaimo';
          } else if (cityPart.toLowerCase().includes('kelowna')) {
            city = 'Kelowna';
          } else if (cityPart.toLowerCase().includes('abbotsford')) {
            city = 'Abbotsford';
          } else if (cityPart.toLowerCase().includes('delta')) {
            city = 'Delta';
          } else if (cityPart.toLowerCase().includes('new westminster')) {
            city = 'New Westminster';
          } else if (cityPart.toLowerCase().includes('port coquitlam')) {
            city = 'Port Coquitlam';
          } else if (cityPart.toLowerCase().includes('port moody')) {
            city = 'Port Moody';
          } else if (cityPart.toLowerCase().includes('maple ridge')) {
            city = 'Maple Ridge';
          } else if (cityPart.toLowerCase().includes('white rock')) {
            city = 'White Rock';
          } else {
            // Use the city part as-is, removing province if present
            city = cityPart.replace(/,?\s*B\.?C\.?$/i, '').trim() || 'Vancouver';
          }
        }
        
        // Determine region ID based on city
        let regionId = city.toLowerCase().replace(/\s+/g, '-');
        
        await prisma.customer.create({
          data: {
            contactName: customer.fullName || 'Contact',
            businessName: customer.company || 'Unknown Business',
            phone: customer.phone || '000-000-0000',
            email: customer.email || `${customer.id.substring(0, 8)}@placeholder.com`,
            street: street,
            city: city,
            province: province,
            postalCode: postalCode,
            notes: customer.notes || null,
            regionId: regionId,
            status: CustomerStatus.ACTIVE
          }
        });
        
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`✅ Imported ${imported} customers...`);
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('Unique constraint')) {
          console.error(`❌ Failed to import customer: ${customer.company}`, errorMessage);
          errors.push(`${customer.company}: ${errorMessage}`);
        }
        skipped++;
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${imported} customers`);
    console.log(`❌ Skipped: ${skipped} customers`);
    console.log(`📊 Total: ${imported + skipped} customers processed`);
    
    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n❌ First 10 errors:');
      errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    }
    
    // Show summary by region
    const regionCounts = await prisma.customer.groupBy({
      by: ['regionId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });
    
    console.log('\n📍 Top 10 regions by customer count:');
    regionCounts.forEach(region => {
      console.log(`  ${region.regionId}: ${region._count.id} customers`);
    });
    
    // Show total count
    const totalCount = await prisma.customer.count();
    console.log(`\n📊 Total customers in database: ${totalCount}`);
    
  } catch (error) {
    console.error('💥 Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importCustomers();