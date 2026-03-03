import { NextResponse } from "next/server";
import { getConvexJwksKey } from "@/lib/auth/convex-token";

/**
 * Serves public signing keys for Convex custom JWT verification.
 */
export async function GET() {
  const key = await getConvexJwksKey();
  return NextResponse.json({ keys: [key] });
}
