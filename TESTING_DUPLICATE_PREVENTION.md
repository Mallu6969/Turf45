# Testing Duplicate Booking Prevention

## Overview
The system has multiple layers of duplicate prevention to ensure bookings are never created twice, regardless of timing.

## Protection Layers

### 1. Reconciliation Endpoint (`/api/razorpay/reconcile-payment`)
- **Checks FIRST** (line 316-341): Before creating, checks if booking exists with `payment_txn_id`
- **Checks AGAIN** (line 364-384): After verifying payment, checks again before creating
- **Checks in createBookingFromPayment** (line 187-196): Final check before insert

### 2. Success Page (`PublicPaymentSuccess.tsx`)
- **Calls reconciliation first** (line 64-84): Tries reconciliation before fallback
- **Checks with retries** (line 112-142): Waits and retries to find booking
- **Final check before fallback** (line 303-380): Checks one more time before creating
- **Handles duplicate errors** (line 428-480): If insert fails due to duplicate, shows existing booking

### 3. Automatic Reconciliation (Cron/Background)
- **Checks before creating** (reconcile-pending-cron.ts line 273-299): Always checks first

## Test Scenarios

### Test 1: Customer Returns Before Reconciliation Runs
**Scenario**: Customer pays, returns to browser immediately, booking created via success page, then reconciliation runs later.

**Steps**:
1. Make a test payment
2. **Immediately return to browser** (don't wait)
3. Success page should create booking via fallback
4. Wait 30-60 seconds
5. Check Payment Reconciliation tab - should show "success" status
6. Verify only ONE booking exists in database

**Expected Result**: 
- ✅ Booking created by success page
- ✅ Reconciliation finds existing booking and skips creation
- ✅ No duplicate booking

**How to Verify**:
```sql
-- Check bookings for a payment
SELECT id, payment_txn_id, created_at 
FROM bookings 
WHERE payment_txn_id = 'pay_XXXXX'
ORDER BY created_at;

-- Should show only ONE booking
```

### Test 2: Reconciliation Runs Before Customer Returns
**Scenario**: Customer pays, doesn't return, reconciliation creates booking, then customer returns later.

**Steps**:
1. Make a test payment
2. **Close browser immediately** (don't return)
3. Wait 30-60 seconds for automatic reconciliation
4. Check Payment Reconciliation tab - should show "success"
5. Now return to success page manually: `/public/payment/success?payment_id=XXX&order_id=XXX`
6. Success page should detect existing booking

**Expected Result**:
- ✅ Booking created by reconciliation
- ✅ Success page finds existing booking (line 144-207)
- ✅ No duplicate booking created

### Test 3: Race Condition - Both Try Simultaneously
**Scenario**: Customer returns while reconciliation is running at the same time.

**Steps**:
1. Make a test payment
2. **Quickly return to browser** (within 1-2 seconds)
3. Success page calls reconciliation (async)
4. Success page checks for booking (might not find it yet)
5. Success page tries fallback creation
6. Reconciliation also tries to create

**Expected Result**:
- ✅ One of them creates booking first
- ✅ The other detects existing booking and skips
- ✅ No duplicate booking

**How to Test**:
- Open browser console and watch logs
- Look for: "✅ Booking already exists" messages
- Check database for duplicates

### Test 4: Multiple Reconciliation Attempts
**Scenario**: Multiple reconciliation processes try to create booking simultaneously.

**Steps**:
1. Make a test payment
2. Manually trigger reconciliation multiple times quickly:
   ```bash
   # In browser console or via API
   fetch('/api/razorpay/reconcile-payment', {
     method: 'POST',
     body: JSON.stringify({ order_id: 'XXX', payment_id: 'XXX' })
   });
   ```
3. Run this 3-5 times quickly
4. Check database

**Expected Result**:
- ✅ Only ONE booking created
- ✅ Other attempts detect existing booking and skip

## Manual Testing Steps

### Step 1: Prepare Test Environment
1. Open browser DevTools (F12)
2. Go to Console tab
3. Go to Network tab (to see API calls)

### Step 2: Make Test Payment
1. Go to public booking page
2. Select station and time slot
3. Complete payment
4. **Note the payment_id and order_id from URL**

### Step 3: Test Scenario A - Immediate Return
1. **Stay on success page** (don't close)
2. Watch console logs:
   - Should see: "🔍 Reconciling payment with Razorpay API..."
   - Should see: "✅ Payment reconciled and booking created" OR "✅ Booking already exists"
3. Check database:
   ```sql
   SELECT COUNT(*) FROM bookings WHERE payment_txn_id = 'pay_XXXXX';
   -- Should be 1
   ```

### Step 4: Test Scenario B - Delayed Return
1. Make another test payment
2. **Close browser immediately** after payment
3. Wait 30-60 seconds
4. Go to Booking Management → Payment Reconciliation tab
5. Check if payment shows "success" status
6. Manually visit success page with payment_id and order_id
7. Should detect existing booking

### Step 5: Test Scenario C - Race Condition
1. Make test payment
2. **Quickly return** (within 1 second)
3. In console, watch for:
   - Multiple "🔍 Reconciling payment" logs
   - "✅ Booking already exists" messages
4. Check database for duplicates

## Database Verification Queries

### Check for Duplicates
```sql
-- Find duplicate bookings (same payment_txn_id)
SELECT 
  payment_txn_id,
  COUNT(*) as booking_count,
  array_agg(id) as booking_ids,
  array_agg(created_at) as created_times
FROM bookings
WHERE payment_txn_id IS NOT NULL
GROUP BY payment_txn_id
HAVING COUNT(*) > 1
ORDER BY booking_count DESC;
```

### Check Recent Bookings
```sql
-- Recent bookings with payment info
SELECT 
  b.id,
  b.payment_txn_id,
  b.created_at,
  c.name as customer_name,
  s.name as station_name
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
LEFT JOIN stations s ON b.station_id = s.id
WHERE b.payment_txn_id IS NOT NULL
ORDER BY b.created_at DESC
LIMIT 20;
```

### Check Pending Payments Status
```sql
-- Check reconciliation status
SELECT 
  razorpay_order_id,
  razorpay_payment_id,
  status,
  created_at,
  verified_at
FROM pending_payments
ORDER BY created_at DESC
LIMIT 20;
```

## Expected Console Logs

### Successful Reconciliation (Booking Exists)
```
🔍 Reconciling payment: { orderId: '...', paymentId: '...' }
✅ Booking already exists (early check), skipping reconciliation: <booking_id>
```

### Successful Reconciliation (Creates Booking)
```
🔍 Reconciling payment: { orderId: '...', paymentId: '...' }
✅ Payment verified as successful: captured
✅ Booking created successfully: X records
```

### Success Page (Booking Found)
```
✅ Booking already exists (created by webhook - PRIMARY METHOD): <booking_id>
```

### Success Page (Fallback - Booking Exists)
```
⚠️ Creating booking via success page (FALLBACK) - webhook should have created it
✅ Booking already exists (found in final check), skipping fallback creation: <booking_id>
```

### Success Page (Fallback - Duplicate Error)
```
⚠️ Duplicate booking detected in fallback, fetching existing booking...
```

## Troubleshooting

### If Duplicates Still Occur

1. **Check Database Constraints**:
   ```sql
   -- Ensure unique constraint on payment_txn_id
   SELECT constraint_name, constraint_type 
   FROM information_schema.table_constraints 
   WHERE table_name = 'bookings' 
   AND constraint_type = 'UNIQUE';
   ```

2. **Check Timing**: Look at `created_at` timestamps - if they're within milliseconds, it's a race condition

3. **Check Logs**: Look for error messages in console or server logs

4. **Verify Idempotency Checks**: All creation paths should check `payment_txn_id` before inserting

## Success Criteria

✅ **Test passes if**:
- No duplicate bookings in database
- All reconciliation attempts show "already exists" after first creation
- Success page detects existing bookings correctly
- Console shows proper idempotency messages

❌ **Test fails if**:
- Multiple bookings with same `payment_txn_id`
- Reconciliation creates duplicate after success page created booking
- Success page creates duplicate after reconciliation created booking

