// Reset all invoice data but keep customers and settings
// Sets next invoice number to 5364

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetInvoiceData() {
  console.log('⚠️  INVOICE DATA RESET SCRIPT ⚠️');
  console.log('=====================================');
  console.log('This will:');
  console.log('  ✅ KEEP: All customers');
  console.log('  ✅ KEEP: All settings');
  console.log('  ✅ KEEP: All users');
  console.log('  ❌ DELETE: All invoices');
  console.log('  ❌ DELETE: All appointments');
  console.log('  🔢 SET: Next invoice number to 5364');
  console.log('=====================================\n');

  try {
    // 1. Get current counts
    const beforeCounts = {
      invoices: await prisma.invoice.count(),
      customers: await prisma.customer.count(),
      settings: await prisma.settings.count(),
      users: await prisma.user.count(),
      appointments: await prisma.appointment.count()
    };

    console.log('📊 BEFORE RESET:');
    console.log(`  Invoices: ${beforeCounts.invoices}`);
    console.log(`  Customers: ${beforeCounts.customers}`);
    console.log(`  Settings: ${beforeCounts.settings}`);
    console.log(`  Users: ${beforeCounts.users}`);
    console.log(`  Appointments: ${beforeCounts.appointments}\n`);

    // 2. Delete all invoices
    console.log('🗑️  Deleting all invoices...');
    const deletedInvoices = await prisma.invoice.deleteMany({});
    console.log(`   ✅ Deleted ${deletedInvoices.count} invoices\n`);

    // 3. Delete all appointments (optional - you can comment this out if you want to keep them)
    console.log('🗑️  Deleting all appointments...');
    const deletedAppointments = await prisma.appointment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedAppointments.count} appointments\n`);

    // 4. Reset invoice sequence to 5363 (so next invoice will be 5364)
    console.log('🔢 Setting invoice sequence...');

    // First check if sequence exists
    const existingSequence = await prisma.invoiceSequence.findFirst({});

    if (existingSequence) {
      // Update existing sequence
      await prisma.invoiceSequence.update({
        where: { regionId: existingSequence.regionId },
        data: { lastInvoiceNumber: 5363 }
      });
      console.log(`   ✅ Updated sequence for region "${existingSequence.regionId}"`);
      console.log(`   📝 Last invoice number: 5363`);
      console.log(`   📝 Next invoice will be: 5364\n`);
    } else {
      // Create new sequence
      await prisma.invoiceSequence.create({
        data: {
          regionId: 'BC',
          lastInvoiceNumber: 5363
        }
      });
      console.log(`   ✅ Created new sequence for region "BC"`);
      console.log(`   📝 Last invoice number: 5363`);
      console.log(`   📝 Next invoice will be: 5364\n`);
    }

    // 5. Verify final counts
    const afterCounts = {
      invoices: await prisma.invoice.count(),
      customers: await prisma.customer.count(),
      settings: await prisma.settings.count(),
      users: await prisma.user.count(),
      appointments: await prisma.appointment.count()
    };

    console.log('📊 AFTER RESET:');
    console.log(`  Invoices: ${afterCounts.invoices} (should be 0)`);
    console.log(`  Customers: ${afterCounts.customers} (preserved)`);
    console.log(`  Settings: ${afterCounts.settings} (preserved)`);
    console.log(`  Users: ${afterCounts.users} (preserved)`);
    console.log(`  Appointments: ${afterCounts.appointments} (should be 0)\n`);

    // 6. Verify invoice sequence
    const finalSequence = await prisma.invoiceSequence.findFirst({});
    console.log('✅ INVOICE SEQUENCE:');
    console.log(`  Region: ${finalSequence.regionId}`);
    console.log(`  Last Invoice Number: ${finalSequence.lastInvoiceNumber}`);
    console.log(`  Next Invoice Will Be: ${finalSequence.lastInvoiceNumber + 1}\n`);

    console.log('=====================================');
    console.log('✅ RESET COMPLETE!');
    console.log('=====================================');
    console.log('Next steps:');
    console.log('  1. Refresh your browser');
    console.log('  2. Create a test invoice');
    console.log('  3. It should have invoice number: 5364');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ ERROR during reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run with confirmation
console.log('\n⏳ Starting reset in 3 seconds...');
console.log('   Press Ctrl+C to cancel!\n');

setTimeout(async () => {
  await resetInvoiceData();
}, 3000);
