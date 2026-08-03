import { NextResponse } from "next/server";

import { upsertCaseClaim } from "@/lib/claims";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

type Body = {
  receipt?: string;
  countryOfBirth?: string | null;
  premiumProcessing?: string | null;
  visaCategory?: string | null;
  serviceCenter?: string | null;
};

export async function POST(request: Request) {
  const limit = await rateLimit("track", getClientIdentifier(request.headers));
  if (!limit.success) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "rate_limited",
          message: "Too many requests. Try again later.",
        },
      },
      { status: 429 },
    );
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  if (!userId) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "unauthorized",
          message: "Sign in to save case details.",
        },
      },
      { status: 401 },
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

  const result = await upsertCaseClaim(userId, {
    receipt: body.receipt ?? "",
    countryOfBirth: body.countryOfBirth,
    premiumProcessing: body.premiumProcessing,
    visaCategory: body.visaCategory,
    serviceCenter: body.serviceCenter,
  });

  if (!result.ok) {
    const status =
      result.code === "upstream"
        ? 502
        : result.code === "unauthorized"
          ? 401
          : 400;
    return NextResponse.json(
      {
        data: null,
        error: { code: result.code, message: result.message },
      },
      { status },
    );
  }

  return NextResponse.json({ data: { profile: result.profile }, error: null });
}
