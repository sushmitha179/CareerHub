-- Run manually if REVIEWING updates fail (Neon / PostgreSQL)
-- psql $DATABASE_URL -f scripts/ensure-reviewing-enum.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AppStatus'
      AND e.enumlabel = 'REVIEWING'
  ) THEN
    ALTER TYPE "AppStatus" ADD VALUE 'REVIEWING';
    RAISE NOTICE 'Added REVIEWING to AppStatus enum';
  ELSE
    RAISE NOTICE 'REVIEWING already exists on AppStatus';
  END IF;
END $$;
