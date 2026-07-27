import { NextResponse } from "next/server";

import { confirmTrackCase } from "@/lib/tracking";
import { publicEnv } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const site = publicEnv.siteUrl.replace(/\/$/, "");

  if (!token) {
    return NextResponse.redirect(`${site}/?track=missing`);
  }

  const result = await confirmTrackCase(token);
  if (!result.ok) {
    return NextResponse.redirect(`${site}/?track=invalid`);
  }

  return NextResponse.redirect(
    `${site}/case/${result.receipt}?track=confirmed`,
  );
}
