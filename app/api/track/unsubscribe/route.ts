import { NextResponse } from "next/server";

import { publicEnv } from "@/lib/env";
import { unsubscribeTrackCase } from "@/lib/tracking";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const site = publicEnv.siteUrl.replace(/\/$/, "");

  if (!token) {
    return NextResponse.redirect(`${site}/?unsub=missing`);
  }

  const result = await unsubscribeTrackCase(token);
  return NextResponse.redirect(
    `${site}/?unsub=${result.ok ? "ok" : "invalid"}`,
  );
}
