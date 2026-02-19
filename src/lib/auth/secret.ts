import { createHash } from "node:crypto";

const AUTH_SECRET_WARNING =
  "[auth] NEXTAUTH_SECRET/AUTH_SECRET is not set. Using a deterministic fallback secret.";

/**
 * Resolves the Auth.js secret across environments.
 * Falls back to a deterministic derived secret when no explicit secret is configured.
 */
export function resolveAuthSecret(
  env: NodeJS.ProcessEnv = process.env,
  logger: Pick<Console, "warn"> = console,
): string {
  const configuredSecret = env.NEXTAUTH_SECRET?.trim() || env.AUTH_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  if (env.NODE_ENV === "production") {
    logger.warn(AUTH_SECRET_WARNING);
  }

  const seed = [
    env.NEXTAUTH_URL,
    env.AUTH_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    env.HOSTNAME,
    "ours-ledger-auth-fallback",
  ]
    .filter(Boolean)
    .join("|");

  return createHash("sha256").update(seed).digest("hex");
}

