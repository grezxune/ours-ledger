import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

/**
 * Resolves the current server session.
 */
export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

/**
 * Requires an authenticated session and redirects to sign-in when missing.
 */
export async function requireAuthSession(): Promise<Session> {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    redirect("/signin");
  }

  return session;
}

/**
 * Requires a super admin platform role.
 */
export async function requireSuperAdminSession(): Promise<Session> {
  const session = await requireAuthSession();
  if (session.user?.platformRole !== "super_admin") {
    redirect("/");
  }

  return session;
}
