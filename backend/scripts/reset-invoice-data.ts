import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetInvoiceData() {
  console.log('🧹 Resetting invoice data completely...\n');

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete ALL invoices
      const deletedInvoices = await tx.invoice.deleteMany({});
      console.log(`✅ Deleted ${deletedInvoices.count} invoices`);

      // 2. Delete ALL invoice sequences
      const deletedSequences = await tx.invoiceSequence.deleteMany({});
      console.log(`✅ Deleted ${deletedSequences.count} invoice sequences`);

      // 3. Delete invoice history
      const deletedHistory = await tx.invoiceHistory.deleteMany({});
      console.log(`✅ Deleted ${deletedHistory.count} invoice history records`);

      // 4. Delete invoice-related audit logs
      const deletedAudits = await tx.auditLog.deleteMany({
        where: {
          tableName: {
            in: ['Invoice', 'InvoiceHistory', 'InvoiceSequence']
          }
        }
      });
      console.log(`✅ Deleted ${deletedAudits.count} invoice-related audit logs`);

      // 5. Delete sales snapshots
      const deletedMonthly = await tx.monthlySalesSnapshot.deleteMany({});
      const deletedYearly = await tx.yearlySalesSnapshot.deleteMany({});
      console.log(`✅ Deleted ${deletedMonthly.count} monthly and ${deletedYearly.count} yearly sales snapshots`);

      // 6. Delete invoice-related deleted records
      const deletedRecords = await tx.deletedRecords.deleteMany({
        where: {
          tableName: {
            in: ['Invoice', 'InvoiceHistory']
          }
        }
      });
      console.log(`✅ Deleted ${deletedRecords.count} soft-deleted invoice records`);

      // 7. Get all unique regionIds from customers
      const regions = await tx.customer.findMany({
        select: { regionId: true },
        distinct: ['regionId']
      });

      console.log(`\n📍 Found ${regions.length} unique regions`);

      // 8. Create invoice sequences for each region starting at 5529
      for (const region of regions) {
        await tx.invoiceSequence.create({
          data: {
            regionId: region.regionId,
            lastInvoiceNumber: 5529,
          }
        });
        console.log(`   ✓ Created sequence for region: ${region.regionId} (next invoice: 5530)`);
      }

      // 9. Also create a default sequence just in case
      await tx.invoiceSequence.create({
        data: {
          regionId: 'default',
          lastInvoiceNumber: 5529,
        }
      });
      console.log(`   ✓ Created default sequence (next invoice: 5530)`);

      console.log('\n✨ Invoice data reset completed successfully!');
      console.log(`📄 All regions now start at invoice number: 05530\n`);
    });

  } catch (error) {
    console.error('❌ Error during reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetInvoiceData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
