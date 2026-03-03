import "server-only";
import { ConvexHttpClient } from "convex/browser";
import type { Id, TableNames } from "@convex/_generated/dataModel";
import { mintConvexAuthToken } from "@/lib/auth/convex-token";

function getConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required for Convex data access.");
  }

  return url;
}

export function createConvexClient(): ConvexHttpClient {
  return new ConvexHttpClient(getConvexUrl());
}

export async function createAuthenticatedConvexClient(email: string, name?: string | null): Promise<ConvexHttpClient> {
  const client = createConvexClient();
  const token = await mintConvexAuthToken({ email, name });
  client.setAuth(token);
  return client;
}

export function asId<TableName extends TableNames>(value: string): Id<TableName> {
  return value as Id<TableName>;
}
