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

  it("derives a deterministic fallback when no secret is configured", () => {
    const logger = { warn: () => undefined };
    const env = {
      NODE_ENV: "production",
      NEXTAUTH_URL: "https://ours-ledger.example",
      HOSTNAME: "app-server-1",
    };
    const first = resolveAuthSecret(env, logger);
    const second = resolveAuthSecret(env, logger);

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(20);
  });
});

