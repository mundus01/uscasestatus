import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { requestTrackCase } from "@/lib/tracking";

type Body = {
  receipt?: string;
  email?: string;
  locale?: string;
};

export async function POST(request: Request) {
  const limit = await rateLimit("track", getClientIdentifier(request.headers));
  if (!limit.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "rate_limited",
          message: "Too many track requests. Try again later.",
        },
      },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      {
        data: null,
        error: { code: "invalid_body", message: "Expected JSON body." },
      },
      { status: 400 },
    );
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    // Auth optional for track-by-email.
  }

  const result = await requestTrackCase({
    receipt: body.receipt ?? "",
    email: body.email ?? "",
    locale: body.locale ?? "en",
    userId,
  });

  if (!result.ok) {
    const status =
      result.code === "limit_reached"
        ? 403
        : result.code === "upstream" || result.code === "email_failed"
          ? 502
          : 400;
    return NextResponse.json(
      {
        data: null,
        error: { code: result.code, message: result.message },
      },
      { status },
    );
  }

  return NextResponse.json({
    data: {
      alreadyTracked: result.alreadyTracked,
      needsConfirmation: result.needsConfirmation,
    },
    error: null,
  });
}
