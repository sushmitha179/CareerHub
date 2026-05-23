import {
  APP_STATUSES,
  type AppStatusValue,
} from "@/lib/application-status";

export const TRACKER_STATUSES: AppStatusValue[] = [...APP_STATUSES];

export type ApplicationStats = {
  total: number;
  APPLIED: number;
  REVIEWING: number;
  INTERVIEWING: number;
  REJECTED: number;
  OFFERED: number;
  successRate: number;
};

export function emptyApplicationStats(): ApplicationStats {
  return {
    total: 0,
    APPLIED: 0,
    REVIEWING: 0,
    INTERVIEWING: 0,
    REJECTED: 0,
    OFFERED: 0,
    successRate: 0,
  };
}

export function computeApplicationStats(
  applications: { status: string }[]
): ApplicationStats {
  const stats = emptyApplicationStats();
  stats.total = applications.length;

  for (const app of applications) {
    const status = String(app.status).toUpperCase() as AppStatusValue;
    if (APP_STATUSES.includes(status)) {
      stats[status]++;
    }
  }

  stats.successRate =
    stats.total === 0
      ? 0
      : Math.round((stats.OFFERED / stats.total) * 100);

  return stats;
}

export { STATUS_LABELS, STATUS_COLORS } from "@/lib/application-status";
