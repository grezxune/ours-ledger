import { describe, expect, it } from "bun:test";
import { parseSuperAdminEmails } from "@/lib/auth/roles";

describe("roles", () => {
  it("parses normalized super admin email entries", () => {
    const emails = parseSuperAdminEmails(" Admin@Example.com, owner@example.com , ");

    expect(emails.has("admin@example.com")).toBe(true);
    expect(emails.has("owner@example.com")).toBe(true);
    expect(emails.has("Admin@Example.com")).toBe(false);
  });
});
