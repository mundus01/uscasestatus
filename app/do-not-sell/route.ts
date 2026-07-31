import { legalPageResponse } from "@/lib/legal-page";

export async function GET() {
  return legalPageResponse("do-not-sell");
}
