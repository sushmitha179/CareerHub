import { redirect } from "next/navigation";

/** Posting jobs is company-only — use /company/post */
export default function StudentAddJobRedirect() {
  redirect("/student/listings");
}
