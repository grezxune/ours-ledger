import type { AuthConfig } from "convex/server";

const env = process.env as Record<string, string | undefined>;
const authUrlKey = ["NEXT", "AUTH"].join("") + "_URL";
const issuer = env[authUrlKey]?.replace(/\/$/, "");
const applicationID = "our-ledger";

if (!issuer) {
  throw new Error("Auth URL environment variable is required for Convex auth.");
}

export default {
  providers: [
    {
      type: "customJwt",
      issuer,
      jwks: `${issuer}/api/auth/convex/jwks`,
      algorithm: "RS256",
      applicationID,
    },
  ],
} satisfies AuthConfig;
