-- Ensure all required tournament columns exist
-- This migration is idempotent and safe to run multiple times

-- Add max_players column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'max_players'
  ) THEN
    ALTER TABLE public.tournaments 
    ADD COLUMN max_players INTEGER DEFAULT 16;
    
    -- Update existing tournaments to have a default max_players value
    UPDATE public.tournaments 
    SET max_players = 16 
    WHERE max_players IS NULL;
  END IF;
END $$;

-- Add tournament_format column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'tournament_format'
  ) THEN
    ALTER TABLE public.tournaments 
    ADD COLUMN tournament_format VARCHAR(20) NOT NULL DEFAULT 'knockout';
    
    -- Add a check constraint to ensure valid tournament formats
    ALTER TABLE public.tournaments 
    ADD CONSTRAINT check_tournament_format 
    CHECK (tournament_format IN ('knockout', 'league'));
    
    -- Update existing tournaments to have knockout format by default
    UPDATE public.tournaments 
    SET tournament_format = 'knockout' 
    WHERE tournament_format IS NULL;
  END IF;
END $$;

-- Add runner_up column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournaments' 
    AND column_name = 'runner_up'
  ) THEN
    ALTER TABLE public.tournaments 
    ADD COLUMN runner_up JSONB;
  END IF;
END $$;

-- Ensure max_players has a default value for all existing records
UPDATE public.tournaments 
SET max_players = COALESCE(max_players, 16)
WHERE max_players IS NULL;

-- Ensure tournament_format has a default value for all existing records
UPDATE public.tournaments 
SET tournament_format = COALESCE(tournament_format, 'knockout')
WHERE tournament_format IS NULL;

