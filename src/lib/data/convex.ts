import "server-only";
import { ConvexHttpClient } from "convex/browser";
import type { Id, TableNames } from "@convex/_generated/dataModel";

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

export function asId<TableName extends TableNames>(value: string): Id<TableName> {
  return value as Id<TableName>;
}
