-- Add REVIEWING to AppStatus enum (idempotent — safe if already applied)
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
  END IF;
END $$;
