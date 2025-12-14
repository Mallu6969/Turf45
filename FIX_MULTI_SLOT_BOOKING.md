# Fix for Multi-Slot Booking Conflict Issue

## Problem
- User can book "11:30 PM - 12:00 AM" slot alone ✅
- User CANNOT book "10:30 PM - 12:00 AM" (multiple slots) ❌
- Error: "This time slot is already booked"

## Root Cause
When booking multiple slots (e.g., 10:30-12:00), the system creates multiple booking records:
1. 10:30-11:00
2. 11:00-11:30  
3. 11:30-23:59:59

The issue is that `check_booking_overlap` doesn't properly handle **existing bookings that end at `00:00:00`** (old format) when checking against **new slots that end at `23:59:59`**.

## Solution

### 1. Apply Database Migrations (IN ORDER)

**Critical: Apply these migrations in Supabase Dashboard > SQL Editor:**

1. **`20250131000005_change_last_slot_to_2359.sql`**
   - Changes slots to end at 23:59:59
   - Simplifies overlap detection

2. **`20250131000006_optimize_get_available_slots.sql`** (OPTIONAL - for performance)
   - Optimizes slot generation to prevent timeouts

3. **`20250131000007_fix_overlap_with_old_bookings.sql`** ⭐ **NEW - REQUIRED**
   - Fixes `check_booking_overlap` to handle both:
     - Old bookings ending at `00:00:00`
     - New slots ending at `23:59:59`
   - Normalizes both to `23:59:59` for comparison

### 2. UI Display Fix
- Updated `PublicBooking.tsx` to display `23:59:59` as "12:00 AM" for user clarity
- This is just a display change - backend still uses `23:59:59`

### 3. Verify Migration Applied

Run this in browser console or use the API:
```javascript
// Check if migration is applied
fetch('/api/bookings/verify-migration?station_id=51259b71-226e-428b-8509-636b0c6ccb22')
  .then(r => r.json())
  .then(console.log);
```

Expected result:
```json
{
  "migration_applied": true,
  "last_slot_end_time": "23:59:59",
  "uses_2359": true
}
```

## How It Works

The fix normalizes both old and new end times:
- `00:00:00` → treated as `23:59:59` for comparison
- `23:59:59` → used as-is

This ensures:
- Old bookings (00:00:00) don't cause false conflicts
- New slots (23:59:59) work correctly
- Multi-slot bookings work properly

## Testing

After applying migrations:

1. ✅ Book single slot: 11:30 PM - 12:00 AM (should work)
2. ✅ Book multiple slots: 10:30 PM - 12:00 AM (should work now)
3. ✅ Book any other multi-slot range (should work)

## Files Changed

1. `supabase/migrations/20250131000007_fix_overlap_with_old_bookings.sql` - NEW
2. `src/pages/PublicBooking.tsx` - UI display fix
3. `api/bookings/verify-migration.ts` - Diagnostic endpoint
