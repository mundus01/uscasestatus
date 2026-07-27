import { notFound } from "next/navigation";

/**
 * Without this catch-all, unmatched URLs resolve outside the `[locale]` segment
 * and render Next's unstyled default 404 instead of our localized one.
 */
export default function CatchAllPage() {
  notFound();
}
