import { afterEach, describe, expect, it } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import { GET } from "@/app/api/auth/convex/jwks/route";
import { resetConvexTokenCacheForTests } from "@/lib/auth/convex-token";

const originalPrivateKey = process.env.CONVEX_AUTH_PRIVATE_KEY;

afterEach(() => {
  process.env.CONVEX_AUTH_PRIVATE_KEY = originalPrivateKey;
  resetConvexTokenCacheForTests();
});

describe("GET /api/auth/convex/jwks", () => {
  it("returns a public JWKS document with one signing key", async () => {
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    process.env.CONVEX_AUTH_PRIVATE_KEY = privateKey;
    resetConvexTokenCacheForTests();

    const response = await GET();
    const payload = (await response.json()) as { keys: Array<Record<string, string>> };

    expect(response.status).toBe(200);
    expect(Array.isArray(payload.keys)).toBe(true);
    expect(payload.keys[0]?.kty).toBe("RSA");
    expect(payload.keys[0]?.alg).toBe("RS256");
    expect(payload.keys[0]?.use).toBe("sig");
    expect(typeof payload.keys[0]?.kid).toBe("string");
  });
});
