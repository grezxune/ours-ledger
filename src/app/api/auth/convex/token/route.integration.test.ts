import { beforeEach, describe, expect, it, mock } from "bun:test";

let sessionState: {
  expires: string;
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    platformRole: "user" | "super_admin";
  };
} | null = null;
let tokenState = "token_123";
const mintedCalls: Array<{ email: string; name?: string | null; platformRole?: "user" | "super_admin" }> = [];

mock.module("@/lib/auth/session", () => ({
  getAuthSession: async () => sessionState,
}));

mock.module("@/lib/auth/convex-token", () => ({
  mintConvexAuthToken: async (identity: { email: string; name?: string | null; platformRole?: "user" | "super_admin" }) => {
    mintedCalls.push(identity);
    return tokenState;
  },
}));

let GET: typeof import("@/app/api/auth/convex/token/route").GET;

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-secret";
  sessionState = null;
  tokenState = "token_123";
  mintedCalls.length = 0;
});

describe("GET /api/auth/convex/token", () => {
  it("returns 401 when no authenticated user is present", async () => {
    ({ GET } = await import("@/app/api/auth/convex/token/route"));
    const response = await GET();
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Unauthorized");
    expect(mintedCalls.length).toBe(0);
  });

  it("returns a token for authenticated sessions and normalizes email", async () => {
    ({ GET } = await import("@/app/api/auth/convex/token/route"));
    sessionState = {
      expires: "2999-12-31T00:00:00.000Z",
      user: {
        id: "user_1",
        email: "  PERSON@Example.COM ",
        name: "Person",
        platformRole: "user",
      },
    };
    tokenState = "token_abc";

    const response = await GET();
    const payload = (await response.json()) as { token: string };

    expect(response.status).toBe(200);
    expect(payload.token).toBe("token_abc");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(mintedCalls[0]).toEqual({
      email: "person@example.com",
      name: "Person",
      platformRole: "user",
    });
  });
});
