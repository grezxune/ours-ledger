import { afterEach, describe, expect, it } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import { importSPKI, jwtVerify } from "jose";
import { mintConvexAuthToken, resetConvexTokenCacheForTests } from "@/lib/auth/convex-token";

const originalEnv = {
  CONVEX_AUTH_PRIVATE_KEY: process.env.CONVEX_AUTH_PRIVATE_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS,
};

afterEach(() => {
  process.env.CONVEX_AUTH_PRIVATE_KEY = originalEnv.CONVEX_AUTH_PRIVATE_KEY;
  process.env.NEXTAUTH_URL = originalEnv.NEXTAUTH_URL;
  process.env.SUPER_ADMIN_EMAILS = originalEnv.SUPER_ADMIN_EMAILS;
  resetConvexTokenCacheForTests();
});

describe("mintConvexAuthToken", () => {
  it("mints a signed JWT with Convex auth claims", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    process.env.CONVEX_AUTH_PRIVATE_KEY = privateKey;
    process.env.NEXTAUTH_URL = "https://ledger.example";
    process.env.SUPER_ADMIN_EMAILS = "owner@example.com";
    resetConvexTokenCacheForTests();

    const token = await mintConvexAuthToken({
      email: "Owner@Example.com",
      name: "Owner",
    });

    const key = await importSPKI(publicKey, "RS256");
    const { payload } = await jwtVerify(token, key, {
      issuer: "https://ledger.example",
      audience: "our-ledger",
    });

    expect(payload.email).toBe("owner@example.com");
    expect(payload.platformRole).toBe("super_admin");
    expect(payload.sub).toBe("owner@example.com");
  });
});
