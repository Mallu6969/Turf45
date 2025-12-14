-- Mark expired pending payments as 'expired' status instead of keeping them as 'pending'
-- This runs as a one-time update for existing expired payments

UPDATE public.pending_payments
SET status = 'expired',
    failure_reason = COALESCE(failure_reason, 'Payment expired')
WHERE status = 'pending'
  AND expires_at < NOW();
