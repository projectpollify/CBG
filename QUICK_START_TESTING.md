# Quick Start - Test Invoice System NOW

## 🚀 30-Second Setup

```bash
# Make sure servers are running
./start-servers.sh
```

Open browser: **http://localhost:3000**

---

## ✅ 5-Minute Test Plan

### Test 1: Create Your First Test Invoice (2 min)

1. Go to **Invoices** → **Create Invoice**
2. Select customer: "A-1 Steaks" (or any customer)
3. Add line item:
   - Service: Resurfacing
   - Description: "Test Board"
   - Size: 12x18
   - Quantity: 1
   - Price: $100
4. Click **Save**

**What to check:**
- ✅ Invoice gets number #10008 (or next in sequence)
- ✅ Total shows: $112.00 (includes GST $5 + PST $7)
- ✅ Invoice appears in list

### Test 2: Verify Numbering (1 min)

1. Create another invoice (any customer, any amount)

**What to check:**
- ✅ Gets #10009 (sequential, no gap)

### Test 3: Test Server Restart (2 min)

1. **In terminal:**
   ```bash
   ./stop-servers.sh
   ./start-servers.sh
   ```

2. **In browser (after servers start):**
   - Create another invoice

**What to check:**
- ✅ Gets #10010 (sequence continued!)
- ✅ **THIS PROVES DATA PERSISTENCE**

---

## 🔍 Current System Status

Run this anytime to check your data:

```bash
node check-data-integrity.js
```

Shows:
- Current invoice sequence number
- Total invoices
- Revenue by status
- Any gaps in numbering

---

## 📊 Where's My Data?

### Frontend URLs:
- **Invoices:** http://localhost:3000/invoices
- **Create Invoice:** http://localhost:3000/invoices/create
- **Customers:** http://localhost:3000/customers
- **Reports:** http://localhost:3000/reports

### API URLs (for nerds):
- **Health:** http://localhost:3001/api/health
- **Database:** http://localhost:3001/api/test-db
- **Invoices:** http://localhost:3001/api/invoices

---

## 🎯 What Each Number Means

When you see an invoice total of **$112.00**:

```
Item Price:        $100.00  (what you charged)
GST (5%):         +  $5.00  (goes to CRA)
PST (7%):         +  $7.00  (goes to Province)
                  ─────────
TOTAL:             $112.00  (customer pays this)
```

**All of this is saved in database for tax purposes!**

---

## ✅ Success = These 3 Things:

1. **Sequential numbers:** 10007, 10008, 10009...
2. **No resets:** Numbers continue after restart
3. **Tax breakdown:** Can see GST + PST amounts

If you see all 3, your system works! 🎉

---

## 🆘 Quick Troubleshooting

**Can't create invoice?**
- Check servers are running: `curl http://localhost:3001/api/health`
- Check you're logged in
- Check customer exists

**Numbers reset to 10001?**
- Database may have been cleared
- Check: `node check-data-integrity.js`

**Math doesn't add up?**
- GST should be 5% of subtotal
- PST should be 7% of subtotal
- Total = Subtotal + GST + PST

---

## 📚 Full Details

See **TESTING_GUIDE.md** for:
- Detailed test scenarios
- How the system works
- Advanced verification
- Month-end closing procedures

See **DATA_PRESERVATION_REPORT.md** for:
- What data is preserved
- Tax compliance details
- Audit features
- Recommendations

---

**Ready to test? Open http://localhost:3000 and create an invoice!**
