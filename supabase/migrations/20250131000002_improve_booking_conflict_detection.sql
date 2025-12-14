-- Improve booking conflict detection to return conflicting booking details
-- This helps debug why conflicts are detected but not visible in UI

-- Create function to get conflicting booking details (for diagnostics)
CREATE OR REPLACE FUNCTION public.get_booking_conflicts(
  p_station_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS TABLE(
  booking_id UUID,
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  status TEXT,
  station_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.status::TEXT,
    s.name,
    b.created_at
  FROM public.bookings b
  INNER JOIN public.stations s ON s.id = b.station_id
  WHERE b.station_id = p_station_id
    AND b.booking_date = p_booking_date
    AND b.status IN ('confirmed', 'in-progress')
    AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
    AND (
      -- Handle midnight (00:00:00) as end of day
      -- Case 1: New booking starts during existing booking
      (b.start_time <= p_start_time AND (b.end_time > p_start_time OR b.end_time = '00:00:00'::TIME)) OR
      -- Case 2: New booking ends during existing booking (or at midnight)
      (b.start_time < p_end_time AND (b.end_time >= p_end_time OR (b.end_time = '00:00:00'::TIME AND p_end_time = '00:00:00'::TIME))) OR
      -- Case 3: New booking is contained within existing booking
      (b.start_time >= p_start_time AND (b.end_time <= p_end_time OR (b.end_time = '00:00:00'::TIME AND p_end_time = '00:00:00'::TIME))) OR
      -- Case 4: Existing booking is contained within new booking
      (b.start_time <= p_start_time AND (b.end_time >= p_end_time OR b.end_time = '00:00:00'::TIME))
    )
  ORDER BY b.created_at DESC;
END;
$$;

-- Enhanced overlap check that handles midnight (00:00:00) properly
-- When end_time is 00:00:00, it represents the end of the day
CREATE OR REPLACE FUNCTION public.check_booking_overlap_with_details(
  p_station_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  has_overlap BOOLEAN;
  conflict_details JSONB;
BEGIN
  -- Check for overlaps on the specified date
  -- Special handling: when end_time is 00:00:00, treat it as end of day
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

  -- Get conflict details if overlap exists
  IF has_overlap THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', b.id,
        'booking_date', b.booking_date,
        'start_time', b.start_time,
        'end_time', b.end_time,
        'status', b.status,
        'station_name', s.name,
        'created_at', b.created_at
      )
    )
    INTO conflict_details
    FROM public.bookings b
    INNER JOIN public.stations s ON s.id = b.station_id
    WHERE b.station_id = p_station_id
      AND b.booking_date = p_booking_date
      AND b.status IN ('confirmed', 'in-progress')
      AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
      AND (
        (b.start_time <= p_start_time AND (
          (b.end_time > p_start_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME)
        )) OR
        (b.start_time < p_end_time AND (
          (b.end_time >= p_end_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time = '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time != '00:00:00'::TIME)
        )) OR
        (b.start_time >= p_start_time AND (
          (b.end_time <= p_end_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time = '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME AND p_end_time != '00:00:00'::TIME)
        )) OR
        (b.start_time <= p_start_time AND (
          (b.end_time >= p_end_time AND b.end_time != '00:00:00'::TIME) OR
          (b.end_time = '00:00:00'::TIME)
        ))
      );
  END IF;

  RETURN jsonb_build_object(
    'has_overlap', has_overlap,
    'conflicts', COALESCE(conflict_details, '[]'::jsonb)
  );
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.get_booking_conflicts IS 'Returns details of bookings that conflict with the given time slot';
COMMENT ON FUNCTION public.check_booking_overlap_with_details IS 'Enhanced version of check_booking_overlap that also checks previous day for midnight-spanning bookings and returns conflict details';
