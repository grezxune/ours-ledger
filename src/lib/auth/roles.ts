import type { PlatformRole } from "@/lib/domain/types";

/**
 * Parses comma-separated super admin emails from environment input.
 */
export function parseSuperAdminEmails(rawValue: string | undefined): Set<string> {
  if (!rawValue) {
    return new Set<string>();
  }

  const entries = rawValue
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);

  return new Set(entries);
}

/**
 * Resolves platform role from authenticated email.
 */
export function resolvePlatformRole(email: string | null | undefined): PlatformRole {
  if (!email) {
    return "user";
  }

  const superAdminEmails = parseSuperAdminEmails(process.env.SUPER_ADMIN_EMAILS);
  return superAdminEmails.has(email.toLowerCase()) ? "super_admin" : "user";
}

/**
 * Runtime guard for super admin-only operations.
 */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return resolvePlatformRole(email) === "super_admin";
}
