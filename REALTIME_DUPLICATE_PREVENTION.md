# Real-Time Duplicate Booking Prevention System

## Overview
This system prevents duplicate bookings for the same station at overlapping time slots using **multiple layers of protection**:
1. **Database-level constraints** (trigger)
2. **Application-level validation** (before insert)
3. **Real-time conflict detection**

## Architecture

### 1. Database Layer (Primary Protection)
**File**: `supabase/migrations/20250131000001_prevent_duplicate_bookings.sql`

- **Function**: `check_booking_overlap()` - Checks if a time slot overlaps with existing bookings
- **Trigger**: `prevent_duplicate_bookings_trigger` - Automatically prevents overlapping bookings at INSERT/UPDATE
- **Indexes**: Optimized indexes for fast conflict detection

**How it works**:
- Before any booking is inserted/updated, the trigger checks for overlaps
- If overlap detected → Raises exception with error code `23505`
- Only validates `confirmed` and `in-progress` bookings (cancelled/completed don't block)

### 2. Application Layer (Pre-Validation)
**File**: `src/utils/bookingValidation.ts`

- **Function**: `checkBookingConflicts()` - Client-side validation
- **Function**: `validateBookingSlots()` - Uses database function for validation

**How it works**:
- Validates slots BEFORE creating bookings
- Returns detailed conflict information
- Provides user-friendly error messages

### 3. Integration Points

All booking creation paths now validate before inserting:

1. **Payment Reconciliation** (`api/razorpay/reconcile-payment.ts`)
   - Validates before creating bookings from payments
   - Handles conflicts gracefully

2. **Success Page Fallback** (`src/pages/PublicPaymentSuccess.tsx`)
   - Validates before fallback booking creation
   - Shows error if conflict detected

3. **Public Booking** (`src/pages/PublicBooking.tsx`)
   - Validates before venue bookings
   - Prevents double-booking in real-time

4. **Bookings API** (`api/bookings/create.ts`)
   - Validates before creating bookings
   - Returns 409 Conflict if overlap detected

5. **Payment Callback** (`api/razorpay/callback.ts`)
   - Validates before creating bookings in callback
   - Handles conflicts from same payment

6. **Cron Reconciliation** (`api/razorpay/reconcile-pending-cron.ts`)
   - Validates before automatic reconciliation
   - Marks payment as failed if conflict

## How It Prevents Duplicates

### Scenario 1: Two Customers Book Same Slot Simultaneously

**Timeline**:
1. Customer A selects slot 2:00 PM - 3:00 PM
2. Customer B selects same slot (at same time)
3. Both click "Book Now" simultaneously

**Protection**:
- Customer A's booking is validated → No conflict → Inserted
- Customer B's booking is validated → Conflict detected → Error shown
- Database trigger also catches it if validation missed

**Result**: ✅ Only Customer A's booking is created

### Scenario 2: Race Condition During Payment

**Timeline**:
1. Customer pays and returns to browser
2. Success page creates booking via fallback
3. Reconciliation also tries to create booking

**Protection**:
- Success page validates → Creates booking
- Reconciliation validates → Finds existing booking → Skips
- Database trigger prevents duplicate if both try simultaneously

**Result**: ✅ Only one booking created

### Scenario 3: Multiple Reconciliation Attempts

**Timeline**:
1. Payment succeeds
2. Multiple reconciliation processes run simultaneously
3. All try to create booking

**Protection**:
- First reconciliation validates → Creates booking
- Other reconciliations validate → Find existing → Skip
- Database trigger prevents duplicates

**Result**: ✅ Only one booking created

## Database Function Usage

```sql
-- Check if booking overlaps
SELECT check_booking_overlap(
  'station-uuid',
  '2025-01-31',
  '14:00:00',
  '15:00:00',
  NULL  -- exclude_booking_id (for updates)
);
-- Returns: true if overlap exists, false otherwise
```

## Error Handling

### Application-Level Errors
- **409 Conflict**: Returned when validation detects conflict
- **User-friendly messages**: "This time slot is already booked. Please select a different time."

### Database-Level Errors
- **Error Code 23505**: Unique violation (trigger caught overlap)
- **Error Message**: "Booking conflict: Another booking already exists..."

### Error Recovery
- If conflict detected → Check if it's same payment (idempotency)
- If same payment → Return existing booking
- If different payment → Return error to user

## Testing

### Test 1: Simultaneous Bookings
1. Open two browser windows
2. Both select same station and time slot
3. Click "Book" in both simultaneously
4. **Expected**: Only one booking succeeds, other shows error

### Test 2: Payment Reconciliation
1. Make payment
2. Return to browser immediately
3. Check if booking created
4. Wait for reconciliation
5. **Expected**: No duplicate booking

### Test 3: Database Trigger
1. Try to insert overlapping booking directly via SQL
2. **Expected**: Trigger prevents insertion with error

```sql
-- This should fail
INSERT INTO bookings (station_id, booking_date, start_time, end_time, status, customer_id)
VALUES (
  'existing-station-id',
  '2025-01-31',
  '14:00:00',
  '15:00:00',
  'confirmed',
  'customer-id'
);
-- Error: Booking conflict...
```

## Performance

- **Indexes**: Fast lookup for conflict detection
- **Function**: Efficient overlap checking
- **Trigger**: Minimal overhead (only on INSERT/UPDATE)
- **Validation**: Happens before insert (prevents wasted operations)

## Real-Time Updates

The system works with Supabase real-time subscriptions:
- When booking is created → Real-time update sent
- UI automatically refreshes availability
- Other users see slot as unavailable immediately

## Migration

To apply this system:

1. **Run migration**:
   ```bash
   # Migration file is automatically applied
   supabase/migrations/20250131000001_prevent_duplicate_bookings.sql
   ```

2. **Verify trigger exists**:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'prevent_duplicate_bookings_trigger';
   ```

3. **Test function**:
   ```sql
   SELECT check_booking_overlap(
     'station-id',
     CURRENT_DATE,
     '14:00:00',
     '15:00:00',
     NULL
   );
   ```

## Summary

✅ **Database-level protection** - Trigger prevents duplicates at DB level  
✅ **Application-level validation** - Checks before inserting  
✅ **Real-time conflict detection** - Immediate feedback to users  
✅ **Idempotency** - Same payment won't create duplicates  
✅ **Error handling** - Graceful error messages  
✅ **Performance** - Optimized with indexes  

**Result**: No duplicate bookings can be created, regardless of timing or race conditions.

