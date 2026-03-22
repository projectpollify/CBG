import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInvoices() {
  console.log('🔍 Checking invoices...\n');

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { invoiceNumber: 'asc' },
      include: {
        customer: {
          select: {
            businessName: true
          }
        }
      }
    });

    console.log(`Total invoices: ${invoices.length}\n`);

    let totalAmount = 0;
    let paidAmount = 0;

    invoices.forEach(inv => {
      const total = Number(inv.total);
      totalAmount += total;
      if (inv.status === 'PAID') {
        paidAmount += total;
      }

      console.log(`Invoice #${String(inv.invoiceNumber).padStart(5, '0')}:`);
      console.log(`  Customer: ${inv.customer.businessName}`);
      console.log(`  Status: ${inv.status}`);
      console.log(`  Subtotal: $${inv.subtotal}`);
      console.log(`  GST: $${inv.gstAmount}`);
      console.log(`  PST: $${inv.pstAmount}`);
      console.log(`  Total: $${inv.total}`);
      console.log('');
    });

    console.log('='.repeat(50));
    console.log(`Total of all invoices: $${totalAmount.toFixed(2)}`);
    console.log(`Total of PAID invoices: $${paidAmount.toFixed(2)}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkInvoices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
