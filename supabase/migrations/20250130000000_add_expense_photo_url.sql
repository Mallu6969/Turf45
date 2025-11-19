-- Add photo_url column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN expenses.photo_url IS 'URL of the photo/receipt uploaded for this expense';

