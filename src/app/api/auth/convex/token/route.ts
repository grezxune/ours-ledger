import { NextResponse } from "next/server";
import { mintConvexAuthToken } from "@/lib/auth/convex-token";
import { resolveConvexTokenIdentity } from "@/lib/auth/convex-token-identity";
import { getAuthSession } from "@/lib/auth/session";

/**
 * Mints a short-lived Convex actor token for the currently authenticated session.
 */
export async function GET() {
  const session = await getAuthSession();
  const identity = resolveConvexTokenIdentity(session);
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await mintConvexAuthToken(identity);

  return NextResponse.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
