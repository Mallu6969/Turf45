-- Fix check_booking_overlap to handle both old bookings (00:00:00) and new slots (23:59:59)
-- This ensures backward compatibility while supporting the new 23:59:59 slots

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
  p_end_normalized TIME;
BEGIN
  -- Normalize new booking's end time: treat 00:00:00 as 23:59:59 for comparison
  -- This handles both old bookings (00:00:00) and new slots (23:59:59)
  p_end_normalized := CASE 
    WHEN p_end_time = '00:00:00'::TIME THEN '23:59:59'::TIME
    ELSE p_end_time
  END;
  
  -- Check for overlaps with existing bookings
  -- Normalize existing bookings' end times: 00:00:00 -> 23:59:59 for comparison
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.station_id = p_station_id
      AND b.booking_date = p_booking_date
      AND b.status IN ('confirmed', 'in-progress')
      AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
      AND (
        -- Normalize b.end_time: 00:00:00 -> 23:59:59, then check overlap
        (b.start_time <= p_start_time AND 
         (CASE WHEN b.end_time = '00:00:00'::TIME THEN '23:59:59'::TIME ELSE b.end_time END) > p_start_time) OR
        (b.start_time < p_end_normalized AND 
         (CASE WHEN b.end_time = '00:00:00'::TIME THEN '23:59:59'::TIME ELSE b.end_time END) >= p_end_normalized) OR
        (b.start_time >= p_start_time AND 
         (CASE WHEN b.end_time = '00:00:00'::TIME THEN '23:59:59'::TIME ELSE b.end_time END) <= p_end_normalized) OR
        (b.start_time <= p_start_time AND 
         (CASE WHEN b.end_time = '00:00:00'::TIME THEN '23:59:59'::TIME ELSE b.end_time END) >= p_end_normalized)
      )
    LIMIT 1
  ) INTO has_overlap;
  
  RETURN has_overlap;
END;
$$;

-- Update comment
COMMENT ON FUNCTION public.check_booking_overlap IS 'Checks if a booking time slot overlaps with existing confirmed/in-progress bookings. Handles both old bookings (00:00:00) and new slots (23:59:59) for backward compatibility.';
