import { NextResponse } from "next/server";

/** @deprecated Use POST /api/select-role */
export async function POST() {
  return NextResponse.json(
    { error: "Use POST /api/select-role instead" },
    { status: 410 }
  );
}
