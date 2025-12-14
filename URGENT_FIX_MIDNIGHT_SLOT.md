# URGENT: Fix "Already Booked" Error for 11:30 PM - 12:00 AM Slot

## Immediate Steps to Fix

### Step 1: Apply Database Migrations (CRITICAL)

The database functions need to be updated. Run these migrations in order:

```sql
-- In Supabase Dashboard > SQL Editor, run:

-- 1. First migration (fixes check_booking_overlap)
-- Copy and run: supabase/migrations/20250131000001_prevent_duplicate_bookings.sql

-- 2. Second migration (fixes get_available_slots)  
-- Copy and run: supabase/migrations/20250131000003_fix_midnight_slot_availability.sql
```

**OR using Supabase CLI:**
```bash
supabase migration up
```

### Step 2: Check What's Blocking the Slot

Use the cleanup script to see what bookings are blocking:

```bash
# In browser console or via API call:
POST /api/bookings/cleanup-midnight-bookings
{
  "station_id": "51259b71-226e-428b-8509-636b0c6ccb22",  // Your station ID
  "booking_date": "2025-12-14",  // The date you're trying to book
  "action": "find"  // Just find, don't delete
}
```

This will show:
- All bookings for that station/date
- Which bookings are blocking the 23:30-00:00 slot
- What the database function returns

### Step 3: Clean Up Phantom Bookings (if needed)

If the script finds bookings with status `cancelled`, `completed`, or `no-show` that are blocking:

```bash
POST /api/bookings/cleanup-midnight-bookings
{
  "station_id": "51259b71-226e-428b-8509-636b0c6ccb22",
  "booking_date": "2025-12-14",
  "action": "delete"  // This will delete non-active bookings
}
```

**WARNING:** Only deletes bookings with status `cancelled`, `completed`, or `no-show`. Active bookings (`confirmed`, `in-progress`) will NOT be deleted.

### Step 4: Verify the Fix

1. Try booking the 23:30-00:00 slot again
2. Check the browser console - you should now see detailed conflict information if there's a real conflict
3. The error message will now show which booking is blocking (if any)

## What Changed

1. **Better Error Messages**: Now shows which specific booking is causing the conflict
2. **Improved Logging**: Console will show detailed conflict information
3. **Database Functions Fixed**: Both `check_booking_overlap` and `get_available_slots` now handle midnight correctly

## If Still Not Working

If after applying migrations it still shows as booked:

1. **Check the console logs** - The new code will show exactly which booking is blocking
2. **Verify migrations were applied**:
   ```sql
   -- Check if function exists with correct signature
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'check_booking_overlap';
   ```
3. **Check for actual bookings**:
   ```sql
   SELECT id, start_time, end_time, status, created_at
   FROM bookings
   WHERE station_id = '51259b71-226e-428b-8509-636b0c6ccb22'
     AND booking_date = '2025-12-14'
     AND status IN ('confirmed', 'in-progress')
   ORDER BY start_time;
   ```

## Quick Test

After applying migrations, test with:

```sql
-- This should return FALSE if no bookings exist
SELECT check_booking_overlap(
  '51259b71-226e-428b-8509-636b0c6ccb22'::uuid,
  '2025-12-14'::date,
  '23:30:00'::time,
  '00:00:00'::time,
  NULL::uuid
);
```

If this returns `true` when no bookings exist, the migration wasn't applied correctly.
