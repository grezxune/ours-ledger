import { describe, expect, it } from "bun:test";
import { resolveConvexTokenIdentity } from "@/lib/auth/convex-token-identity";

describe("resolveConvexTokenIdentity", () => {
  it("returns null when no session email is available", () => {
    expect(resolveConvexTokenIdentity(null)).toBeNull();
    expect(
      resolveConvexTokenIdentity({
        expires: "2999-12-31T00:00:00.000Z",
        user: { id: "u1", name: "No Email", platformRole: "user" },
      }),
    ).toBeNull();
  });

  it("normalizes email and preserves role/name fields", () => {
    const identity = resolveConvexTokenIdentity({
      expires: "2999-12-31T00:00:00.000Z",
      user: {
        id: "u1",
        email: "  ADMIN@Example.COM ",
        name: "Admin",
        platformRole: "super_admin",
      },
    });

    expect(identity).toEqual({
      email: "admin@example.com",
      name: "Admin",
      platformRole: "super_admin",
    });
  });
});
