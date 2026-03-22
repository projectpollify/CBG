import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearInvoiceData() {
  console.log('🧹 Starting invoice data cleanup...\n');

  try {
    // Start a transaction to ensure all-or-nothing operation
    await prisma.$transaction(async (tx) => {
      // 1. Delete all invoices
      const deletedInvoices = await tx.invoice.deleteMany({});
      console.log(`✅ Deleted ${deletedInvoices.count} invoices`);

      // 2. Delete invoice history
      const deletedHistory = await tx.invoiceHistory.deleteMany({});
      console.log(`✅ Deleted ${deletedHistory.count} invoice history records`);

      // 3. Delete invoice-related audit logs
      const deletedAudits = await tx.auditLog.deleteMany({
        where: {
          tableName: {
            in: ['Invoice', 'InvoiceHistory', 'InvoiceSequence']
          }
        }
      });
      console.log(`✅ Deleted ${deletedAudits.count} invoice-related audit logs`);

      // 4. Delete sales snapshots (monthly)
      const deletedMonthly = await tx.monthlySalesSnapshot.deleteMany({});
      console.log(`✅ Deleted ${deletedMonthly.count} monthly sales snapshots`);

      // 5. Delete sales snapshots (yearly)
      const deletedYearly = await tx.yearlySalesSnapshot.deleteMany({});
      console.log(`✅ Deleted ${deletedYearly.count} yearly sales snapshots`);

      // 6. Delete invoice-related deleted records
      const deletedRecords = await tx.deletedRecords.deleteMany({
        where: {
          tableName: {
            in: ['Invoice', 'InvoiceHistory']
          }
        }
      });
      console.log(`✅ Deleted ${deletedRecords.count} soft-deleted invoice records`);

      // 7. Delete invoice-related report archives
      const deletedReports = await tx.reportArchive.deleteMany({
        where: {
          reportType: {
            contains: 'invoice',
            mode: 'insensitive'
          }
        }
      });
      console.log(`✅ Deleted ${deletedReports.count} invoice-related reports`);

      // 8. Reset invoice sequence to start at 5530
      // Delete existing sequences
      await tx.invoiceSequence.deleteMany({});
      console.log(`✅ Cleared invoice sequences`);

      // Create new sequence starting at 5529 (next invoice will be 5530)
      const sequences = await tx.invoiceSequence.create({
        data: {
          regionId: 'default',
          lastInvoiceNumber: 5529,
        }
      });
      console.log(`✅ Set invoice sequence to start at ${sequences.lastInvoiceNumber + 1}`);

      console.log('\n✨ Invoice data cleanup completed successfully!');
      console.log(`📄 Next invoice number will be: 05530\n`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearInvoiceData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
