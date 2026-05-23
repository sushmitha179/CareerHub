export const DASHBOARD_BY_ROLE = {
  STUDENT: "/student/dashboard",
  COMPANY: "/company/dashboard",
} as const;

export const SELECT_ROLE_PATH = "/select-role";

export function dashboardPath(
  role?: "STUDENT" | "COMPANY" | null | string
): string {
  if (role === "STUDENT") return DASHBOARD_BY_ROLE.STUDENT;
  if (role === "COMPANY") return DASHBOARD_BY_ROLE.COMPANY;
  return SELECT_ROLE_PATH;
}
