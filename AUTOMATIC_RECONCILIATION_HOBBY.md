# Automatic Payment Reconciliation (Vercel Hobby Plan)

## Overview

Since Vercel Hobby plan only supports **daily cron jobs** (not every minute), we use **client-side automatic reconciliation** that works whenever admin pages are open. This ensures bookings are created even if customers don't return to the browser after completing payment.

## How It Works

### 1. Payment Intent Storage
When a Razorpay order is created:
- Payment intent is stored in `pending_payments` table
- Includes complete booking data
- Status: `pending`

### 2. Automatic Reconciliation (Client-Side)
Reconciliation happens automatically in multiple ways:

#### A. Background Reconciliation (When Admin Pages Open)
- When admin/staff opens Dashboard, Booking Management, or Staff Portal
- Automatically reconciles pending payments every 60 seconds
- Runs in the background while admin is using the system
- **No server-side cron needed** - works on Hobby plan!

#### B. Reconciliation Tab Auto-Reconciliation
- When admin opens "Payment Reconciliation" tab in Booking Management
- Automatically reconciles pending payments every 30 seconds
- Shows real-time updates as payments are reconciled

#### C. Success Page Reconciliation
- When customer returns to success page
- Immediately tries to reconcile payment
- Creates booking if payment successful

#### D. Manual Reconciliation
- Admin can manually reconcile from Booking Management page
- "Reconcile" button for individual payments
- "Reconcile All Pending" for batch processing

## Architecture

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
     └─► [Automatic] Client-Side Polling
         ├─► When Admin Opens Dashboard/Booking Management
         │   └─► Background reconciliation every 60 seconds
         └─► When Admin Opens Reconciliation Tab
             └─► Auto-reconciliation every 30 seconds
```

## Benefits

✅ **Works on Hobby Plan** - No server-side cron needed
✅ **Automatic** - Runs whenever admin is using the system
✅ **Fast** - Processes payments within 30-60 seconds when admin is active
✅ **Reliable** - Checks Razorpay API directly (source of truth)
✅ **Efficient** - Processes up to 50 payments per run
✅ **Safe** - Idempotent (won't create duplicate bookings)
✅ **Visible** - Updates show in Booking Management page

## How to Use

### For Admins
1. **Just use the system normally** - Reconciliation happens automatically
2. When you open Dashboard or Booking Management, reconciliation starts automatically
3. Check "Payment Reconciliation" tab to see pending payments
4. Payments are automatically reconciled every 30-60 seconds while you're using the system

### Manual Reconciliation (Optional)
If you want to manually reconcile:
1. Go to Booking Management → Payment Reconciliation tab
2. Click "Reconcile" on any pending payment
3. Or click "Reconcile All Pending" for batch processing

## Technical Details

### Client-Side Background Reconciliation
- **File**: `src/utils/backgroundReconciliation.ts`
- **Triggers**: When admin pages are open (Dashboard, Booking Management, Staff Portal)
- **Frequency**: Every 60 seconds
- **Endpoint**: `/api/razorpay/reconcile-pending-cron`

### Reconciliation Tab Auto-Reconciliation
- **Location**: `src/pages/BookingManagement.tsx`
- **Triggers**: When "Payment Reconciliation" tab is active
- **Frequency**: Every 30 seconds
- **Action**: Fetches fresh pending payments and reconciles them

### API Endpoint
- **Path**: `/api/razorpay/reconcile-pending-cron`
- **Method**: POST
- **Purpose**: Process all pending payments
- **Returns**: Number of successful/failed reconciliations

## Monitoring

### View Pending Payments
1. Go to Booking Management → Payment Reconciliation tab
2. See all pending payments with status
3. Auto-refreshes every 30 seconds when tab is open

### Check Reconciliation Status
- Open browser console (F12)
- Look for logs:
  - `🔄 Starting background reconciliation...`
  - `✅ Background reconciliation: X successful, Y failed`

## Testing

### Test Automatic Reconciliation
1. Make a test payment
2. Complete payment in UPI app
3. **Close browser immediately** (don't return)
4. Open Booking Management page (as admin)
5. Wait 30-60 seconds
6. Check Payment Reconciliation tab
7. Payment should show as "success" and booking should exist

### Verify Background Reconciliation
1. Open Dashboard or Booking Management as admin
2. Open browser console (F12)
3. Should see: `🔄 Starting background reconciliation...`
4. Every 60 seconds, should see reconciliation logs

## Comparison: Hobby vs Pro Plan

| Feature | Hobby Plan (Current) | Pro Plan |
|---------|---------------------|----------|
| Cron Jobs | Daily only | Every minute |
| Reconciliation | Client-side (when admin active) | Server-side (always running) |
| Frequency | 30-60 seconds (when admin active) | Every minute (always) |
| Reliability | High (when admin using system) | Very High (always running) |
| Cost | Free | Paid |

## Summary

The client-side automatic reconciliation system ensures:
- ✅ Payments are checked every 30-60 seconds when admin is active
- ✅ Bookings are created automatically when payment succeeds
- ✅ Works even if customer doesn't return to browser
- ✅ No server-side cron needed (works on Hobby plan)
- ✅ Fully automated when admin is using the system

**Note**: For maximum reliability, keep the Booking Management or Dashboard page open. The system will automatically reconcile pending payments while you're using it.

If you upgrade to Vercel Pro plan, you can enable server-side cron jobs for 24/7 automatic reconciliation without needing admin pages to be open.

