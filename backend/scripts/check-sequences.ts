import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSequences() {
  console.log('🔍 Checking invoice sequences...\n');

  try {
    const sequences = await prisma.invoiceSequence.findMany({
      orderBy: { regionId: 'asc' }
    });

    console.log(`Total sequences: ${sequences.length}\n`);

    sequences.forEach(seq => {
      console.log(`  ${seq.regionId.padEnd(25)} → Next: ${String(seq.lastInvoiceNumber + 1).padStart(5, '0')}`);
    });

    console.log('\n✅ All sequences ready!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkSequences()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
