import type { PrismaClient } from "@prisma/client";

/**
 * PostgreSQL was created with:
 *   ENUM ('APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED')
 * REVIEWING must exist in the DB or PATCH/update fails with 22P02.
 * This runs idempotent DDL before REVIEWING updates.
 */
const ENSURE_REVIEWING_SQL = `
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
`;

let reviewEnumReady: boolean | null = null;

export async function ensureReviewingAppStatus(
  prisma: PrismaClient
): Promise<{ ok: boolean; error?: string }> {
  if (reviewEnumReady === true) {
    return { ok: true };
  }

  const clients: PrismaClient[] = [prisma];

  const directUrl =
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.NEON_DATABASE_URL_UNPOOLED;

  if (directUrl && directUrl !== process.env.DATABASE_URL) {
    const { PrismaClient: PC } = await import("@prisma/client");
    clients.push(new PC({ datasources: { db: { url: directUrl } } }));
  }

  let lastError: string | undefined;

  for (const client of clients) {
    try {
      await client.$executeRawUnsafe(ENSURE_REVIEWING_SQL);
      reviewEnumReady = true;
      if (client !== prisma) {
        await client.$disconnect();
      }
      return { ok: true };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (client !== prisma) {
        await client.$disconnect().catch(() => {});
      }
    }
  }

  reviewEnumReady = false;
  return { ok: false, error: lastError };
}
