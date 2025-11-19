-- Add photo_url column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN expenses.photo_url IS 'URL of the photo/receipt uploaded for this expense';

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'expense-receipts',
  'expense-receipts',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Remove any existing RLS policies for expense-receipts bucket
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated users to upload expense receipts" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to update expense receipts" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to delete expense receipts" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public read access to expense receipts" ON storage.objects;
END $$;

-- Create permissive storage policies for expense-receipts bucket (effectively no RLS)
DO $$
BEGIN
  -- Allow everyone (anon and authenticated) to upload files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow all to upload expense receipts'
  ) THEN
    CREATE POLICY "Allow all to upload expense receipts"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'expense-receipts');
  END IF;

  -- Allow everyone to update files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow all to update expense receipts'
  ) THEN
    CREATE POLICY "Allow all to update expense receipts"
    ON storage.objects FOR UPDATE
    TO public
    USING (bucket_id = 'expense-receipts')
    WITH CHECK (bucket_id = 'expense-receipts');
  END IF;

  -- Allow everyone to delete files
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow all to delete expense receipts'
  ) THEN
    CREATE POLICY "Allow all to delete expense receipts"
    ON storage.objects FOR DELETE
    TO public
    USING (bucket_id = 'expense-receipts');
  END IF;

  -- Allow public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow all to read expense receipts'
  ) THEN
    CREATE POLICY "Allow all to read expense receipts"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'expense-receipts');
  END IF;
END $$;

