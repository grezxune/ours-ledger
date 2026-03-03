import { describe, expect, it } from "bun:test";
import { resolveAuthSecret } from "@/lib/auth/secret";

describe("resolveAuthSecret", () => {
  it("uses NEXTAUTH_SECRET when available", () => {
    const secret = resolveAuthSecret({
      NEXTAUTH_SECRET: "nextauth-secret",
      AUTH_SECRET: "auth-secret",
      NODE_ENV: "production",
    });

    expect(secret).toBe("nextauth-secret");
  });

  it("uses AUTH_SECRET when NEXTAUTH_SECRET is missing", () => {
    const secret = resolveAuthSecret({
      AUTH_SECRET: "auth-secret",
      NODE_ENV: "production",
    });

    expect(secret).toBe("auth-secret");
  });

  it("throws when no secret is configured", () => {
    expect(() => resolveAuthSecret({ NODE_ENV: "production" })).toThrow(
      "NEXTAUTH_SECRET or AUTH_SECRET must be configured.",
    );
  });
});
