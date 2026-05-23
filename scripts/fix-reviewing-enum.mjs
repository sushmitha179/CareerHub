/**
 * Adds REVIEWING to PostgreSQL AppStatus enum if missing.
 * Run: npm run db:fix-reviewing
 */
import { PrismaClient } from "@prisma/client";

const SQL = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AppStatus' AND e.enumlabel = 'REVIEWING'
  ) THEN
    ALTER TYPE "AppStatus" ADD VALUE 'REVIEWING';
    RAISE NOTICE 'Added REVIEWING to AppStatus';
  ELSE
    RAISE NOTICE 'REVIEWING already exists';
  END IF;
END $$;
`;

async function main() {
  const urls = [
    process.env.DIRECT_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.DATABASE_URL,
  ].filter(Boolean);

  const unique = [...new Set(urls)];

  for (const url of unique) {
    const prisma = new PrismaClient({
      datasources: { db: { url } },
    });

    try {
      console.log(`Trying connection (${url.includes("pooler") ? "pooler" : "direct"})...`);
      await prisma.$executeRawUnsafe(SQL);
      console.log("✅ REVIEWING enum value is ready.");
      await prisma.$disconnect();
      process.exit(0);
    } catch (err) {
      console.error(`Failed:`, err.message);
      await prisma.$disconnect();
    }
  }

  console.error(
    "\n❌ Could not add REVIEWING. Paste scripts/ensure-reviewing-enum.sql into Neon SQL Editor (use direct connection)."
  );
  process.exit(1);
}

main();
