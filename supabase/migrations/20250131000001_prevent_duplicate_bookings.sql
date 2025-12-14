-- Prevent Duplicate Bookings: Real-time validation and database constraints
-- This ensures no two bookings can exist for the same station at overlapping times

-- 1. Create function to check for overlapping bookings
-- FIXED: Properly handles midnight (00:00:00) as end of day
CREATE OR REPLACE FUNCTION public.check_booking_overlap(
  p_station_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  has_overlap BOOLEAN;
BEGIN
  -- Check if there's an overlapping booking
  -- Special handling: when end_time is 00:00:00, treat it as end of day (midnight)
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.station_id = p_station_id
      AND b.booking_date = p_booking_date
      AND b.status IN ('confirmed', 'in-progress')
      AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
      AND (
        -- Case 1: New booking starts during existing booking
        -- If existing ends at midnight (00:00:00), it extends to end of day
        (b.start_time <= p_start_time AND (
          (b.end_time > p_start_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME)
        )) OR
        -- Case 2: New booking ends during existing booking
        (b.start_time < p_end_time AND (
          (b.end_time >= p_end_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time = '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time != '00:00:00'::TIME)
        )) OR
        -- Case 3: New booking is contained within existing booking
        (b.start_time >= p_start_time AND (
          (b.end_time <= p_end_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time = '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time != '00:00:00'::TIME)
        )) OR
        -- Case 4: Existing booking is contained within new booking
        (b.start_time <= p_start_time AND (
          (b.end_time >= p_end_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME)
        ))
      )
  ) INTO has_overlap;
  
  RETURN has_overlap;
END;
$$;

-- 2. Create function to validate booking before insert/update
CREATE OR REPLACE FUNCTION public.validate_booking_no_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  has_overlap BOOLEAN;
BEGIN
  -- Only validate for confirmed or in-progress bookings
  IF NEW.status IN ('confirmed', 'in-progress') THEN
    -- Check for overlaps
    SELECT public.check_booking_overlap(
      NEW.station_id,
      NEW.booking_date,
      NEW.start_time,
      NEW.end_time,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
    ) INTO has_overlap;
    
    IF has_overlap THEN
      RAISE EXCEPTION 'Booking conflict: Another booking already exists for station % at % from % to %',
        NEW.station_id,
        NEW.booking_date,
        NEW.start_time,
        NEW.end_time
      USING ERRCODE = '23505'; -- Unique violation error code
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Create trigger to prevent overlapping bookings
DROP TRIGGER IF EXISTS prevent_duplicate_bookings_trigger ON public.bookings;
CREATE TRIGGER prevent_duplicate_bookings_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status IN ('confirmed', 'in-progress'))
  EXECUTE FUNCTION public.validate_booking_no_overlap();

-- 4. Create index for faster overlap checks
CREATE INDEX IF NOT EXISTS idx_bookings_station_date_status 
ON public.bookings(station_id, booking_date, status)
WHERE status IN ('confirmed', 'in-progress');

CREATE INDEX IF NOT EXISTS idx_bookings_station_date_time 
ON public.bookings(station_id, booking_date, start_time, end_time)
WHERE status IN ('confirmed', 'in-progress');

-- 5. Add comment for documentation
COMMENT ON FUNCTION public.check_booking_overlap IS 'Checks if a booking time slot overlaps with existing confirmed/in-progress bookings for the same station and date';
COMMENT ON FUNCTION public.validate_booking_no_overlap IS 'Trigger function that prevents inserting/updating bookings that overlap with existing bookings';
COMMENT ON TRIGGER prevent_duplicate_bookings_trigger ON public.bookings IS 'Prevents duplicate/overlapping bookings at the database level';

