import { NextResponse } from "next/server";

export type ApiSuccess<T> = { data: T; error: null };
export type ApiFailure = {
  data: null;
  error: { code: string; message: string };
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, error: null } satisfies ApiSuccess<T>, init);
}

export function apiError(
  code: string,
  message: string,
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    { data: null, error: { code, message } } satisfies ApiFailure,
    { status, headers },
  );
}
