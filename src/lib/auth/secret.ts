/**
 * Resolves the Auth.js secret across environments.
 */
export function resolveAuthSecret(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configuredSecret = env.NEXTAUTH_SECRET?.trim() || env.AUTH_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  throw new Error("NEXTAUTH_SECRET or AUTH_SECRET must be configured.");
}
