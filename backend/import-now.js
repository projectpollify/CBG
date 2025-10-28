const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importCustomers() {
  try {
    const data = JSON.parse(fs.readFileSync('exports/customers-export-2025-08-26T01-11-47-101Z.json', 'utf8'));

    console.log(`Importing ${data.length} customers...`);

    let imported = 0;
    let skipped = 0;

    for (const customer of data) {
      try {
        await prisma.customer.create({
        data: {
          id: customer.id,
          regionId: customer.regionId || 'BC_VANCOUVER',
          businessName: customer.businessName || 'Unknown',
          contactName: customer.contactName || 'Unknown',
          email: customer.email || `${customer.id}@placeholder.com`,
          phone: customer.phone || '000-000-0000',
          street: customer.street,
          city: customer.city,
          province: customer.province,
          postalCode: customer.postalCode,
          notes: customer.notes,
          status: customer.status,
          createdAt: new Date(customer.createdAt),
          updatedAt: new Date(customer.updatedAt),
          lastContactDate: customer.lastContactDate ? new Date(customer.lastContactDate) : null
        }
      });
        imported++;
      } catch (error) {
        if (error.code === 'P2002') {
          skipped++;
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ Import completed! Imported: ${imported}, Skipped (duplicates): ${skipped}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importCustomers();
