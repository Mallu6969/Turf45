-- Migration: Convert Gaming Center to Sports Turf Business
-- Description: Updates station types from gaming (ps5, 8ball, vr) to sports (turf, pickleball)
-- Date: 2025-12-21

-- ===================================================================
-- STEP 1: Add new sport tracking columns
-- ===================================================================

-- Add current_sport column to stations table (if it doesn't exist)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stations' AND column_name = 'current_sport'
  ) THEN
    ALTER TABLE stations ADD COLUMN current_sport TEXT;
    COMMENT ON COLUMN stations.current_sport IS 'Currently playing sport: football, cricket, or pickleball';
  END IF;
END $$;

-- Add sport column to sessions table (if it doesn't exist)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'sport'
  ) THEN
    ALTER TABLE sessions ADD COLUMN sport TEXT;
    COMMENT ON COLUMN sessions.sport IS 'Sport being played in this session: football, cricket, or pickleball';
  END IF;
END $$;

-- ===================================================================
-- STEP 2: Remove old constraints (if they exist)
-- ===================================================================

-- Drop old check constraints if they exist
DO $$
BEGIN
  -- Drop old stations_type_check if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'stations_type_check'
  ) THEN
    ALTER TABLE stations DROP CONSTRAINT IF EXISTS stations_type_check;
  END IF;
  
  -- Drop old current_sport check if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'stations_current_sport_check'
  ) THEN
    ALTER TABLE stations DROP CONSTRAINT IF EXISTS stations_current_sport_check;
  END IF;
  
  -- Drop old sessions sport check if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'sessions_sport_check'
  ) THEN
    ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_sport_check;
  END IF;
END $$;

-- ===================================================================
-- STEP 3: Update existing data - Convert gaming types to sports types
-- ===================================================================

-- Log what we're about to change
DO $$
DECLARE
  station_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO station_count FROM stations WHERE type IN ('ps5', '8ball', 'vr');
  IF station_count > 0 THEN
    RAISE NOTICE 'Found % stations with old types (ps5, 8ball, vr) - converting to sports types', station_count;
  END IF;
END $$;

-- Strategy: Convert gaming stations to turf/pickleball based on name patterns
-- If no pattern matches, default to 'turf' (main court)

-- First, show what exists
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id, name, type FROM stations WHERE type IN ('ps5', '8ball', 'vr')
  LOOP
    RAISE NOTICE 'Converting station: ID=%, Name=%, OldType=%', rec.id, rec.name, rec.type;
  END LOOP;
END $$;

-- Convert stations based on naming patterns
UPDATE stations 
SET type = 'pickleball' 
WHERE type IN ('ps5', '8ball', 'vr') 
  AND (
    LOWER(name) LIKE '%pickle%' 
    OR LOWER(name) LIKE '%pickle ball%'
  );

-- Convert remaining stations to 'turf' (main sports turf)
UPDATE stations 
SET type = 'turf' 
WHERE type IN ('ps5', '8ball', 'vr');

-- Log the results
DO $$
DECLARE
  turf_count INTEGER;
  pickleball_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO turf_count FROM stations WHERE type = 'turf';
  SELECT COUNT(*) INTO pickleball_count FROM stations WHERE type = 'pickleball';
  
  RAISE NOTICE 'Conversion complete: % turf courts, % pickleball courts', turf_count, pickleball_count;
END $$;

-- ===================================================================
-- STEP 4: Update active sessions to set sport field
-- ===================================================================

-- For turf courts, default to 'football' for active sessions
-- (Admin can change this manually if needed)
UPDATE sessions s
SET sport = 'football'
FROM stations st
WHERE s.station_id = st.id 
  AND st.type = 'turf' 
  AND s.end_time IS NULL
  AND s.sport IS NULL;

-- For pickleball courts, set to 'pickleball'
UPDATE sessions s
SET sport = 'pickleball'
FROM stations st
WHERE s.station_id = st.id 
  AND st.type = 'pickleball' 
  AND s.end_time IS NULL
  AND s.sport IS NULL;

-- ===================================================================
-- STEP 5: NOW add constraints for data validation
-- ===================================================================

DO $$
BEGIN
  -- Add check constraint for station types (turf or pickleball)
  -- Now safe to add because all data has been converted
  ALTER TABLE stations 
  ADD CONSTRAINT stations_type_check 
  CHECK (type IN ('turf', 'pickleball'));
  
  RAISE NOTICE 'Added stations_type_check constraint';

  -- Add check constraint for current_sport values
  ALTER TABLE stations 
  ADD CONSTRAINT stations_current_sport_check 
  CHECK (current_sport IS NULL OR current_sport IN ('football', 'cricket', 'pickleball'));
  
  RAISE NOTICE 'Added stations_current_sport_check constraint';

  -- Add check constraint for session sport values
  ALTER TABLE sessions 
  ADD CONSTRAINT sessions_sport_check 
  CHECK (sport IS NULL OR sport IN ('football', 'cricket', 'pickleball'));
  
  RAISE NOTICE 'Added sessions_sport_check constraint';
END $$;

-- ===================================================================
-- STEP 6: Create helper function to get court availability by sport
-- ===================================================================

CREATE OR REPLACE FUNCTION get_court_availability_by_sport(
  sport_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  station_id UUID,
  station_name TEXT,
  station_type TEXT,
  is_occupied BOOLEAN,
  current_sport TEXT,
  session_start_time TIMESTAMPTZ,
  session_customer_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS station_id,
    s.name AS station_name,
    s.type AS station_type,
    s.is_occupied,
    s.current_sport,
    ses.start_time AS session_start_time,
    ses.customer_id AS session_customer_id
  FROM stations s
  LEFT JOIN sessions ses ON s.id = ses.station_id AND ses.end_time IS NULL
  WHERE 
    sport_type IS NULL OR 
    s.type = sport_type OR
    (s.current_sport IS NOT NULL AND s.current_sport = sport_type)
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_court_availability_by_sport IS 'Gets court availability, optionally filtered by sport type (turf or pickleball)';

-- ===================================================================
-- STEP 7: Create indexes for performance
-- ===================================================================

-- Index on station type for fast filtering
CREATE INDEX IF NOT EXISTS idx_stations_type ON stations(type);

-- Index on station current_sport for fast filtering
CREATE INDEX IF NOT EXISTS idx_stations_current_sport ON stations(current_sport);

-- Index on session sport for analytics
CREATE INDEX IF NOT EXISTS idx_sessions_sport ON sessions(sport);

-- Composite index for active sessions by sport
CREATE INDEX IF NOT EXISTS idx_sessions_active_sport 
ON sessions(station_id, sport) 
WHERE end_time IS NULL;

-- ===================================================================
-- STEP 8: Final verification and summary
-- ===================================================================

DO $$
DECLARE
  turf_count INTEGER;
  pickleball_count INTEGER;
  active_sessions INTEGER;
BEGIN
  SELECT COUNT(*) INTO turf_count FROM stations WHERE type = 'turf';
  SELECT COUNT(*) INTO pickleball_count FROM stations WHERE type = 'pickleball';
  SELECT COUNT(*) INTO active_sessions FROM sessions WHERE end_time IS NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Complete: Gaming Center → Sports Turf Business';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Main Turf Courts: %', turf_count;
  RAISE NOTICE 'Pickleball Courts: %', pickleball_count;
  RAISE NOTICE 'Active Sessions: %', active_sessions;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Review station names - update if needed';
  RAISE NOTICE '2. Verify active sessions have correct sport set';
  RAISE NOTICE '3. Test the Court Management and Public Booking pages';
  RAISE NOTICE '';
END $$;
