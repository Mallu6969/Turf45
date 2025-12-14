-- Add station names, timeslots, and failure reason to pending_payments table
-- This allows better visibility into what was being booked and why it failed

ALTER TABLE public.pending_payments
  ADD COLUMN IF NOT EXISTS station_names TEXT[],
  ADD COLUMN IF NOT EXISTS timeslots JSONB,
  ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.pending_payments.station_names IS 'Array of station names being booked (for display purposes)';
COMMENT ON COLUMN public.pending_payments.timeslots IS 'JSONB array of timeslot objects with start_time and end_time (for display purposes)';
COMMENT ON COLUMN public.pending_payments.failure_reason IS 'Reason for payment/booking failure (populated when status is failed)';
