import { InvoiceService } from '../src/services/invoiceService';

async function testSalesReport() {
  console.log('📊 Testing Sales Report...\n');

  try {
    const stats = await InvoiceService.getInvoiceStats();

    console.log('Sales Report Summary:');
    console.log('='.repeat(50));
    console.log(`Total Invoices:       ${stats.totalInvoices}`);
    console.log(`  - Paid:             ${stats.paidInvoices}`);
    console.log(`  - Unpaid (Sent):    ${stats.unpaidInvoices}`);
    console.log(`  - Overdue:          ${stats.overdueInvoices}`);
    console.log('');
    console.log(`Total Sales:          $${stats.totalSales.toFixed(2)}`);
    console.log(`Total Paid:           $${stats.totalRevenue.toFixed(2)}`);
    console.log(`Outstanding:          $${stats.outstandingAmount.toFixed(2)}`);
    console.log('');
    console.log(`Average Invoice:      $${stats.averageInvoiceValue.toFixed(2)}`);
    console.log('='.repeat(50));

    console.log('\n✅ Sales report is now showing total sales and outstanding amounts!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

testSalesReport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
