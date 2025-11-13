-- Add payment_mode and payment_txn_id columns to bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_mode TEXT,
ADD COLUMN IF NOT EXISTS payment_txn_id TEXT;

-- Add comments for documentation
COMMENT ON COLUMN bookings.payment_mode IS 'Payment method: razorpay, venue, cash, upi, etc.';
COMMENT ON COLUMN bookings.payment_txn_id IS 'Transaction ID from payment gateway (e.g., Razorpay payment ID)';

-- Create an index on payment_txn_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_txn_id ON bookings(payment_txn_id);

-- Create an index on payment_mode for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_payment_mode ON bookings(payment_mode);

