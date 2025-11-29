# Automatic Payment Reconciliation

## Overview

The system now automatically reconciles payments **every minute** using a Vercel Cron job. This ensures bookings are created even if customers don't return to the browser after completing payment.

## How It Works

### 1. Payment Intent Storage
When a Razorpay order is created:
- Payment intent is stored in `pending_payments` table
- Includes complete booking data
- Status: `pending`

### 2. Automatic Reconciliation (Every Minute)
Vercel Cron calls `/api/razorpay/reconcile-pending-cron` every minute:
- Fetches all pending payments from last 24 hours
- For each payment:
  - Checks Razorpay API for payment status
  - If payment successful → Creates booking automatically
  - Updates payment status to `success` or `failed`
- Processes up to 50 payments per run

### 3. Multiple Reconciliation Points
Reconciliation happens at multiple points:
1. **Immediate** - When payment succeeds (Razorpay handler)
2. **Success Page** - When customer returns to success page
3. **Automatic Cron** - Every minute (PRIMARY METHOD)
4. **Manual** - From Booking Management page

## Configuration

### Vercel Cron Setup
The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/razorpay/reconcile-pending-cron",
      "schedule": "* * * * *"
    }
  ]
}
```

**Schedule**: `* * * * *` = Every minute

### Optional Security
Add `CRON_SECRET` environment variable for security:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add: `CRON_SECRET` = (any random string)
3. Cron endpoint will verify this secret

## Flow Diagram

```
Customer Pays
     │
     ├─► Payment Intent Stored in pending_payments
     │
     ├─► Customer Completes Payment in UPI App
     │
     ├─► [Immediate] Razorpay Handler Tries Reconciliation
     │   └─► May succeed or fail (non-blocking)
     │
     ├─► [Success Page] Customer Returns
     │   └─► Tries Reconciliation Again
     │
     └─► [Automatic] Cron Job Runs Every Minute
         └─► Checks All Pending Payments
         └─► Verifies with Razorpay API
         └─► Creates Booking if Payment Successful
         └─► Updates Status
```

## Benefits

✅ **Fully Automatic** - No manual intervention needed
✅ **Reliable** - Checks Razorpay API directly (source of truth)
✅ **Fast** - Processes payments within 1 minute
✅ **Efficient** - Processes up to 50 payments per run
✅ **Safe** - Idempotent (won't create duplicate bookings)
✅ **Visible** - Updates show in Booking Management page

## Monitoring

### Check Cron Job Status
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter for `/api/razorpay/reconcile-pending-cron`
3. Check execution logs:
   - `⏰ Automatic reconciliation cron job started`
   - `📋 Found X pending payments to reconcile`
   - `✅ Reconciliation complete: X successful, Y failed`

### View Pending Payments
1. Go to Booking Management → Payment Reconciliation tab
2. See all pending payments with status
3. Auto-refreshes every 30 seconds

### Manual Reconciliation
If needed, you can manually reconcile from:
- Booking Management → Payment Reconciliation tab
- Click "Reconcile" on any pending payment
- Or "Reconcile All Pending" for batch processing

## Testing

### Test Automatic Reconciliation
1. Make a test payment
2. Complete payment in UPI app
3. **Close browser immediately** (don't return)
4. Wait 1-2 minutes
5. Check Booking Management → Payment Reconciliation tab
6. Payment should show as "success" and booking should exist

### Verify Cron is Running
1. Check Vercel logs for cron execution
2. Should see logs every minute
3. Should process pending payments automatically

## Troubleshooting

### Cron Not Running
- Check `vercel.json` has cron configuration
- Verify deployment includes the cron endpoint
- Check Vercel logs for cron execution

### Payments Not Reconciling
- Check Razorpay API credentials are correct
- Verify `pending_payments` table exists
- Check cron job logs for errors
- Verify payment status in Razorpay dashboard

### Bookings Not Created
- Check cron job logs for specific errors
- Verify booking data exists in `pending_payments.booking_data`
- Check Supabase connection
- Verify customer creation logic

## Summary

The automatic reconciliation system ensures:
- ✅ Payments are checked every minute
- ✅ Bookings are created automatically when payment succeeds
- ✅ Works even if customer doesn't return to browser
- ✅ No manual intervention needed
- ✅ Fully automated and reliable

This is the **primary method** for creating bookings from online payments. The system is now production-ready and will handle all payment scenarios automatically.

