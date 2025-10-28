# Invoice System Testing Guide
## How Invoice Numbering & Data Preservation Works

---

## 🎯 What We're Testing

1. **Invoice number sequencing** - Numbers never repeat or reset
2. **Data persistence** - Information survives server restarts
3. **Financial tracking** - GST, PST, totals are calculated and stored
4. **Payment tracking** - Status changes are preserved

---

## 📚 How It Works Behind The Scenes

### The Flow:

```
USER CREATES INVOICE
    ↓
Frontend sends request to: POST /api/invoices
    ↓
Backend calls: InvoiceService.createInvoice()
    ↓
System looks up InvoiceSequence table
    ↓
Gets last number (e.g., 10007)
    ↓
Increments it (10007 + 1 = 10008)
    ↓
Updates InvoiceSequence in database
    ↓
Creates invoice with number 10008
    ↓
Calculates: subtotal, GST (5%), PST (7%), total
    ↓
Saves everything to Invoice table
    ↓
Returns invoice to frontend
```

### Key Files:
- **Invoice Service:** `backend/src/services/invoiceService.ts`
- **Database Schema:** `backend/prisma/schema.prisma`
- **Frontend Invoice Page:** `frontend/src/app/invoices/create/page.tsx`

---

## 🧪 TEST 1: Invoice Number Sequencing

### Step 1: Check Current Sequence

**In Browser:**
1. Open http://localhost:3000
2. Login (if needed)
3. Go to **Invoices** page

**What to look for:**
- List of existing invoices
- Note the **highest invoice number** (e.g., #10007)

### Step 2: Create First Invoice

1. Click **Create Invoice** button
2. Select any customer from dropdown
3. Add a line item:
   - Service Type: "Resurfacing"
   - Description: "Test Board 1"
   - Size: "12x18"
   - Quantity: 1
   - Unit Price: 100
4. Click **Save as Draft** or **Create Invoice**

**Expected Result:**
- Invoice created with number **10008** (next in sequence)
- You'll see confirmation message
- Redirected to invoice list

### Step 3: Create Second Invoice Immediately

1. Click **Create Invoice** again
2. Select different customer
3. Add line item:
   - Service Type: "New Board"
   - Description: "Test Board 2"
   - Size: "16x20"
   - Quantity: 1
   - Unit Price: 150
4. Save it

**Expected Result:**
- Invoice created with number **10009** (sequential)
- Numbers increment correctly
- No gaps, no duplicates

### Step 4: Verify Sequence After Server Restart

**In Terminal:**
```bash
./stop-servers.sh
# Wait 5 seconds
./start-servers.sh
```

**In Browser:**
1. Refresh the invoices page
2. Create another invoice (same process as above)

**Expected Result:**
- New invoice gets number **10010** (continues from where it left off)
- ✅ **PROOF:** Numbering survives server restart!

---

## 🧪 TEST 2: Financial Data Preservation

### What Gets Saved:

For each invoice, the system stores:
- `subtotal` - Base amount before taxes
- `gstAmount` - 5% GST
- `pstAmount` - 7% PST
- `total` - Subtotal + GST + PST

### Test It:

1. Create an invoice with these items:
   ```
   Item 1: Resurfacing, Size 12x18, Qty 1, Price $100.00
   Item 2: Stainless Insert, Qty 2, Price $25.00 each
   ```

2. **Manual Calculation:**
   ```
   Subtotal: $100.00 + $50.00 = $150.00
   GST (5%): $150.00 × 0.05 = $7.50
   PST (7%): $150.00 × 0.07 = $10.50
   Total: $150.00 + $7.50 + $10.50 = $168.00
   ```

3. **Verify in Frontend:**
   - Check the invoice shows: $168.00 total
   - View invoice details to see GST and PST breakdown

4. **Verify After Restart:**
   - Restart servers
   - Go back to that invoice
   - ✅ **PROOF:** All amounts are still there!

---

## 🧪 TEST 3: Payment Tracking

### Test Marking Invoice as Paid:

1. Create a new invoice (any amount)
2. Note its status: **DRAFT** or **SENT**
3. Click on the invoice to view details
4. Look for **Mark as Paid** button (or similar)
5. Select payment method: "E-Transfer"
6. Set paid date: Today's date
7. Save

**Expected Result:**
- Invoice status changes to **PAID**
- Payment method: "E-Transfer"
- Paid date: Today
- Invoice appears in "Paid" filter

### Verify Payment Data Persists:

1. Restart servers
2. Find that invoice again
3. ✅ **PROOF:** Status still shows PAID with payment date!

---

## 🧪 TEST 4: Customer Transaction History

### Test:

1. Pick one customer (e.g., "Acme Restaurant")
2. Create 3 invoices for them:
   - Invoice A: $100 (DRAFT)
   - Invoice B: $200 (SENT)
   - Invoice C: $150 (PAID)

3. Go to **Customers** page
4. Click on "Acme Restaurant"
5. Look for "Invoice History" or "Transactions" section

**Expected Result:**
- Shows all 3 invoices linked to this customer
- Total amount owed
- Payment history
- ✅ **PROOF:** Complete customer transaction tracking!

---

## 🧪 TEST 5: Date Range Filtering (For Reports)

### Test:

1. Go to **Reports** or **Invoices** page
2. Look for date filters
3. Set date range: "Last 7 days"
4. Apply filter

**Expected Result:**
- Shows only invoices from last 7 days
- Correct totals calculated
- This is how you'll generate monthly/yearly reports

### Try These Filters:
- This month
- Last month
- This quarter
- This year
- Custom date range

---

## 🔍 Verify Data in Database Directly

Want to see the raw data? Here's how:

### Method 1: Use the Check Script

```bash
node check-data-integrity.js
```

This shows:
- Current invoice sequence number
- Invoice count and range
- Revenue by status
- Gaps in numbering (should be none)

### Method 2: API Endpoints

**Get Invoice Sequence:**
```bash
curl http://localhost:3001/api/invoices/sequence
```

**Get All Invoices:**
```bash
curl http://localhost:3001/api/invoices
```

**Get Specific Invoice:**
```bash
curl http://localhost:3001/api/invoices/[invoice-id]
```

**Get Invoice Stats:**
```bash
curl "http://localhost:3001/api/invoices/stats?startDate=2025-01-01&endDate=2025-12-31"
```

### Method 3: Database Direct (Advanced)

If you want to see the actual PostgreSQL tables:

```bash
# Connect to database
sudo -u postgres psql cbg_db

# Check invoice sequence
SELECT * FROM "InvoiceSequence";

# Check recent invoices
SELECT "invoiceNumber", status, total, "invoiceDate"
FROM "Invoice"
ORDER BY "invoiceNumber" DESC
LIMIT 10;

# Check for gaps in numbering
SELECT "invoiceNumber" FROM "Invoice" ORDER BY "invoiceNumber";

# Exit
\q
```

---

## 📊 Test Scenario: Month-End Closing

This simulates what you'd do for bookkeeping:

### Scenario: Generate October 2025 Report

1. **Filter invoices:**
   - Start Date: 2025-10-01
   - End Date: 2025-10-31

2. **Verify you can see:**
   - Total invoices created: ?
   - Total revenue: $?
   - Paid invoices: ?
   - Outstanding: $?
   - GST collected: $?
   - PST collected: $?

3. **Export data** (if feature exists):
   - Download CSV or PDF
   - Give to accountant

4. **Restart server and verify:**
   - Run same report again
   - ✅ **PROOF:** Numbers match exactly!

---

## 🚨 What To Watch For (Red Flags)

### ❌ BAD - If You See This:

1. **Duplicate invoice numbers**
   - Two invoices with same number
   - This should NEVER happen

2. **Gaps after server restart**
   - Invoice #10015 before restart
   - Invoice #10001 after restart
   - This would be a CRITICAL bug

3. **Missing financial data**
   - Invoice shows total but no GST/PST breakdown
   - This would break tax reporting

4. **Lost payment status**
   - Mark invoice as PAID
   - Restart server
   - Shows as UNPAID again
   - This would be a data persistence failure

### ✅ GOOD - If You See This:

1. **Sequential numbering always**
   - 10007, 10008, 10009, 10010...
   - No gaps, no duplicates

2. **Numbers continue after restart**
   - Last number before restart: 10020
   - First number after restart: 10021
   - Perfect continuity

3. **Complete tax breakdown**
   - Subtotal + GST + PST = Total
   - All amounts stored, not calculated on-the-fly

4. **Status persists**
   - PAID stays PAID
   - Payment date preserved
   - Payment method recorded

---

## 📝 Testing Checklist

Copy this and check off as you test:

- [ ] Created 3 invoices, got sequential numbers
- [ ] Restarted server, next invoice continues sequence
- [ ] Checked invoice details show GST, PST, total
- [ ] Marked invoice as PAID, status preserved after restart
- [ ] Viewed customer transaction history
- [ ] Filtered invoices by date range
- [ ] Ran check-data-integrity.js script
- [ ] Verified no gaps in invoice numbering
- [ ] Created invoice, deleted server (crashed), sequence continued correctly
- [ ] Generated report, restarted, ran report again, numbers matched

---

## 🎓 Understanding the Database Tables

### InvoiceSequence Table

```
┌────────────┬──────────┬────────────────────┐
│ regionId   │ lastInvoiceNumber │ updatedAt │
├────────────┼──────────┼────────────────────┤
│ BC         │ 10010    │ 2025-10-28 14:30   │
└────────────┴──────────┴────────────────────┘
```

- This table has ONE row per region
- `lastInvoiceNumber` gets updated BEFORE creating invoice
- Atomic operation (no race conditions)

### Invoice Table

```
┌─────┬───────────────┬────────┬──────────┬─────────┬──────────┬────────┐
│ id  │ invoiceNumber │ status │ subtotal │ gstAmount│ pstAmount│ total  │
├─────┼───────────────┼────────┼──────────┼─────────┼──────────┼────────┤
│ abc │ 10008         │ PAID   │ 150.00   │ 7.50    │ 10.50    │ 168.00 │
│ def │ 10009         │ SENT   │ 200.00   │ 10.00   │ 14.00    │ 224.00 │
│ ghi │ 10010         │ DRAFT  │ 100.00   │ 5.00    │ 7.00     │ 112.00 │
└─────┴───────────────┴────────┴──────────┴─────────┴──────────┴────────┘
```

- Each row is ONE invoice
- All financial data stored (not calculated)
- Linked to customer via `customerId`
- Timestamps for audit trail

---

## 💡 Pro Tips

### Quick Ways to Test:

**1. Rapid Invoice Creation:**
- Open 2 browser tabs
- Create invoices in both simultaneously
- Check they get different sequential numbers

**2. Crash Test:**
```bash
# Create invoice, note next number will be 10015
# Force kill the backend process
kill -9 [backend-process-id]
# Restart servers
./start-servers.sh
# Create new invoice
# Should get 10015 (not lost)
```

**3. Long-Term Test:**
- Create invoice today
- Don't touch system for a week
- Come back, create invoice
- Should continue sequence (not reset)

---

## 📞 If Something Goes Wrong

### Invoice Numbers Reset to 10001:

**Problem:** InvoiceSequence table was deleted or reset

**Check:**
```bash
node check-data-integrity.js
```

**Fix:**
- Find highest invoice number
- Manually update InvoiceSequence table
- Or contact developer

### Numbers Have Gaps:

**This is OK if:**
- You created then deleted a draft invoice
- Testing caused deletions

**This is BAD if:**
- Paid invoices were deleted
- Sequence jumped randomly

### Total Doesn't Match GST + PST:

**Check:**
- Is it rounding? ($0.01 difference is OK)
- Are tax rates correct? (GST 5%, PST 7%)
- Report this if amounts are way off

---

## ✅ Success Criteria

Your system is working correctly if:

1. ✅ Invoice numbers NEVER duplicate
2. ✅ Invoice numbers NEVER reset after restart
3. ✅ All financial data (GST, PST, totals) are stored
4. ✅ Payment status persists after restart
5. ✅ Can generate reports for any date range
6. ✅ Customer transaction history is complete
7. ✅ No data loss after server crashes/restarts

If ALL of these are true, your bookkeeping data is SAFE! 🎉

---

## 🚀 Next Steps After Testing

Once you've verified everything works:

1. **Test with real data** for 1 week
2. **Generate your first monthly report**
3. **Show accountant the reports**
4. **Set up regular database backups**
5. **Consider activating audit tables** (see DATA_PRESERVATION_REPORT.md)

---

**Need Help?** Run the test scenarios above and let me know which ones pass/fail!
