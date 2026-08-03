import { NextResponse } from "next/server";

import { getCaseClaimForUser } from "@/lib/claims";
import { validateReceipt } from "@/lib/receipt";
import { getClientIdentifier, rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ receipt: string }> },
) {
  const limit = await rateLimit("check", getClientIdentifier(request.headers));
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
          message: "Sign in to view case details.",
        },
      },
      { status: 401 },
    );
  }

  const { receipt } = await context.params;
  const validation = validateReceipt(receipt);
  if (!validation.ok) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "invalid_receipt",
          message: "Enter a valid USCIS receipt number.",
        },
      },
      { status: 400 },
    );
  }

  const profile = await getCaseClaimForUser(userId, validation.receipt);
  return NextResponse.json({
    data: { profile },
    error: null,
  });
}
