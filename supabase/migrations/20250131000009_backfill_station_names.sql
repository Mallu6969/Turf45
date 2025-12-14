-- Backfill station_names and timeslots for old pending_payments entries
-- This updates existing records that don't have station_names/timeslots populated

-- Backfill station_names from booking_data.selectedStations
-- This extracts station IDs from the JSONB and looks up their names
UPDATE public.pending_payments pp
SET station_names = (
  SELECT ARRAY_AGG(s.name ORDER BY s.name)
  FROM jsonb_array_elements_text(pp.booking_data->'selectedStations') AS station_id
  INNER JOIN public.stations s ON s.id = station_id::uuid
)
WHERE pp.station_names IS NULL
  AND pp.booking_data IS NOT NULL
  AND pp.booking_data->>'selectedStations' IS NOT NULL
  AND jsonb_typeof(pp.booking_data->'selectedStations') = 'array';

-- Backfill timeslots from booking_data.slots
UPDATE public.pending_payments
SET timeslots = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'start_time', slot->>'start_time',
      'end_time', slot->>'end_time'
    )
  )
  FROM jsonb_array_elements(booking_data->'slots') AS slot
)
WHERE timeslots IS NULL
  AND booking_data IS NOT NULL
  AND booking_data->>'slots' IS NOT NULL
  AND jsonb_typeof(booking_data->'slots') = 'array';

-- Mark expired payments as expired (not failed) and populate failure_reason
UPDATE public.pending_payments
SET status = 'expired',
    failure_reason = COALESCE(notes, 'Payment expired - payment window has passed')
WHERE status = 'pending'
  AND expires_at < NOW();

-- Also populate failure_reason for failed payments that have error info in notes
UPDATE public.pending_payments
SET failure_reason = COALESCE(notes, 'Payment failed (reason not recorded)')
WHERE status = 'failed'
  AND failure_reason IS NULL;
