/**
 * Single source of truth for application statuses.
 * Use these constants in frontend + backend — do not import AppStatus from
 * @prisma/client in client components (stale bundles can miss REVIEWING).
 */

export const APP_STATUSES = [
  "APPLIED",
  "REVIEWING",
  "INTERVIEWING",
  "OFFERED",
  "REJECTED",
] as const;

export type AppStatusValue = (typeof APP_STATUSES)[number];

/** Human-readable labels (UI only) */
export const STATUS_LABELS: Record<AppStatusValue, string> = {
  APPLIED: "Applied",
  REVIEWING: "Reviewing",
  INTERVIEWING: "Interviewing",
  OFFERED: "Offered",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<AppStatusValue, string> = {
  APPLIED: "bg-blue-500",
  REVIEWING: "bg-indigo-500",
  INTERVIEWING: "bg-yellow-500",
  OFFERED: "bg-green-500",
  REJECTED: "bg-red-500",
};

const STATUS_ALIASES: Record<string, AppStatusValue> = {
  REVIEW: "REVIEWING",
  UNDER_REVIEW: "REVIEWING",
  "UNDER REVIEW": "REVIEWING",
  IN_REVIEW: "REVIEWING",
};

export function normalizeAppStatus(value: unknown): AppStatusValue | null {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim().toUpperCase().replace(/\s+/g, "_");

  if (STATUS_ALIASES[raw]) return STATUS_ALIASES[raw];

  return APP_STATUSES.includes(raw as AppStatusValue)
    ? (raw as AppStatusValue)
    : null;
}

export function isAppStatus(value: unknown): value is AppStatusValue {
  return normalizeAppStatus(value) !== null;
}
