import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCleanup() {
  console.log('🔍 Verifying cleanup...\n');

  try {
    // Check invoices
    const invoiceCount = await prisma.invoice.count();
    console.log(`📄 Invoices remaining: ${invoiceCount}`);

    // Check invoice sequence
    const sequence = await prisma.invoiceSequence.findFirst({
      where: { regionId: 'default' }
    });
    console.log(`🔢 Invoice sequence: ${sequence?.lastInvoiceNumber} (next invoice will be ${(sequence?.lastInvoiceNumber || 0) + 1})`);

    // Check customers (should NOT be affected)
    const customerCount = await prisma.customer.count();
    console.log(`👥 Customers remaining: ${customerCount}`);

    // Check appointments (should NOT be affected)
    const appointmentCount = await prisma.appointment.count();
    console.log(`📅 Appointments remaining: ${appointmentCount}`);

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyCleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
