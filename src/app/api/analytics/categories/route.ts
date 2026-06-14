import { NextRequest, NextResponse } from "next/server";
import { requireOrgContext } from "@/server/auth/context";
import { getCategoryAnalytics } from "@/server/analytics";

export async function GET(request: NextRequest) {
  const auth = await requireOrgContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get("locationId");
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));

  const result = await getCategoryAnalytics({
    organizationId: auth.ctx.organization.id,
    locationId,
    days,
  });

  return NextResponse.json(result);
}
