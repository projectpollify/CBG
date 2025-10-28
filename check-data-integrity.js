// Quick script to check data integrity and preservation
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDataIntegrity() {
  console.log('=== DATA INTEGRITY & PRESERVATION CHECK ===\n');

  // 1. Check Invoice Sequence
  const sequences = await prisma.invoiceSequence.findMany();
  console.log('📊 INVOICE SEQUENCE STATUS:');
  sequences.forEach(seq => {
    console.log(`  Region: ${seq.regionId} - Last Invoice: ${seq.lastInvoiceNumber}`);
  });

  // 2. Check Invoices
  const invoiceStats = await prisma.invoice.aggregate({
    _count: true,
    _min: { invoiceNumber: true, invoiceDate: true },
    _max: { invoiceNumber: true, invoiceDate: true }
  });

  console.log('\n💰 INVOICE DATA:');
  console.log(`  Total Invoices: ${invoiceStats._count}`);
  console.log(`  Invoice Number Range: ${invoiceStats._min.invoiceNumber} - ${invoiceStats._max.invoiceNumber}`);
  console.log(`  Date Range: ${invoiceStats._min.invoiceDate?.toLocaleDateString()} - ${invoiceStats._max.invoiceDate?.toLocaleDateString()}`);

  // 3. Check for gaps in invoice numbers
  const allInvoices = await prisma.invoice.findMany({
    select: { invoiceNumber: true },
    orderBy: { invoiceNumber: 'asc' }
  });

  const gaps = [];
  for (let i = 1; i < allInvoices.length; i++) {
    const expected = allInvoices[i-1].invoiceNumber + 1;
    const actual = allInvoices[i].invoiceNumber;
    if (actual !== expected) {
      gaps.push({ expected, actual, gap: actual - expected });
    }
  }

  console.log(`\n🔍 INVOICE NUMBER SEQUENCE:`);
  if (gaps.length === 0) {
    console.log('  ✅ No gaps detected - sequential numbering intact');
  } else {
    console.log(`  ⚠️  ${gaps.length} gaps detected:`);
    gaps.slice(0, 5).forEach(g => {
      console.log(`     Expected ${g.expected}, got ${g.actual} (gap of ${g.gap})`);
    });
  }

  // 4. Check Sales by Status
  const byStatus = await prisma.invoice.groupBy({
    by: ['status'],
    _count: true,
    _sum: { total: true }
  });

  console.log('\n💵 REVENUE BY STATUS:');
  byStatus.forEach(stat => {
    console.log(`  ${stat.status}: ${stat._count} invoices = $${Number(stat._sum.total || 0).toFixed(2)}`);
  });

  // 5. Check Historical Tables
  const auditCount = await prisma.auditLog.count();
  const invoiceHistoryCount = await prisma.invoiceHistory.count();
  const deletedRecordsCount = await prisma.deletedRecords.count();
  const monthlySalesCount = await prisma.monthlySalesSnapshot.count();
  const yearlySalesCount = await prisma.yearlySalesSnapshot.count();

  console.log('\n📚 HISTORICAL DATA PRESERVATION:');
  console.log(`  Audit Logs: ${auditCount} records`);
  console.log(`  Invoice History: ${invoiceHistoryCount} records`);
  console.log(`  Deleted Records Archive: ${deletedRecordsCount} records`);
  console.log(`  Monthly Sales Snapshots: ${monthlySalesCount} records`);
  console.log(`  Yearly Sales Snapshots: ${yearlySalesCount} records`);

  // 6. Check Recent Activity
  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      invoiceNumber: true,
      status: true,
      total: true,
      createdAt: true,
      customer: { select: { businessName: true } }
    }
  });

  console.log('\n📋 RECENT INVOICES:');
  recentInvoices.forEach(inv => {
    console.log(`  #${inv.invoiceNumber} - ${inv.customer.businessName} - $${Number(inv.total).toFixed(2)} - ${inv.status}`);
  });

  // 7. Check Tax Data Completeness
  const taxData = await prisma.invoice.findMany({
    select: {
      invoiceNumber: true,
      subtotal: true,
      gstAmount: true,
      pstAmount: true,
      total: true
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n💸 TAX TRACKING (Recent 5):');
  taxData.forEach(inv => {
    const sub = Number(inv.subtotal);
    const gst = Number(inv.gstAmount);
    const pst = Number(inv.pstAmount);
    const total = Number(inv.total);
    console.log(`  #${inv.invoiceNumber}: Subtotal=$${sub.toFixed(2)} + GST=$${gst.toFixed(2)} + PST=$${pst.toFixed(2)} = $${total.toFixed(2)}`);
  });

  await prisma.$disconnect();
}

checkDataIntegrity().catch(console.error);
