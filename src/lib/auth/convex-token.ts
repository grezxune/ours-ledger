import { randomUUID } from "node:crypto";
import { createPublicKey } from "node:crypto";
import { SignJWT, calculateJwkThumbprint, exportJWK, importPKCS8 } from "jose";
import type { JWK } from "jose";
import { resolvePlatformRole } from "@/lib/auth/roles";

const TOKEN_TTL_SECONDS = 60 * 5;

interface ConvexTokenIdentity {
  email: string;
  name?: string | null;
  platformRole?: "user" | "super_admin";
}

let cachedPrivateKey: Promise<CryptoKey> | null = null;
let cachedSigningKey: Promise<JWK> | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function requireConvexIssuer(): string {
  const issuer = process.env.NEXTAUTH_URL;
  if (!issuer) {
    throw new Error("NEXTAUTH_URL is required to mint Convex auth tokens.");
  }
  return issuer;
}

function getConvexAudience(): string {
  return "our-ledger";
}

function requirePrivateKeyPem(): string {
  const encoded = process.env.CONVEX_AUTH_PRIVATE_KEY?.trim();
  if (!encoded) {
    throw new Error("CONVEX_AUTH_PRIVATE_KEY is required to mint Convex auth tokens.");
  }

  return encoded.includes("\\n") ? encoded.replace(/\\n/g, "\n") : encoded;
}

async function getPrivateKey(): Promise<CryptoKey> {
  if (!cachedPrivateKey) {
    cachedPrivateKey = importPKCS8(requirePrivateKeyPem(), "RS256");
  }

  return cachedPrivateKey;
}

export async function getConvexJwksKey(): Promise<JWK> {
  if (!cachedSigningKey) {
    cachedSigningKey = (async () => {
      const publicKey = createPublicKey(requirePrivateKeyPem());
      const key = await exportJWK(publicKey);
      const kid = await calculateJwkThumbprint(key);
      return {
        ...key,
        use: "sig",
        alg: "RS256",
        kid,
      };
    })();
  }

  return cachedSigningKey;
}

export async function mintConvexAuthToken(identity: ConvexTokenIdentity): Promise<string> {
  const email = normalizeEmail(identity.email);
  const platformRole = identity.platformRole ?? resolvePlatformRole(email);
  const now = Math.floor(Date.now() / 1000);
  const key = await getPrivateKey();
  const jwk = await getConvexJwksKey();

  return new SignJWT({
    email,
    name: identity.name?.trim() || email.split("@")[0] || "user",
    platformRole,
  })
    .setProtectedHeader({
      alg: "RS256",
      kid: jwk.kid,
      typ: "JWT",
    })
    .setIssuer(requireConvexIssuer())
    .setAudience(getConvexAudience())
    .setSubject(email)
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_TTL_SECONDS)
    .setJti(randomUUID())
    .sign(key);
}

export function resetConvexTokenCacheForTests() {
  cachedPrivateKey = null;
  cachedSigningKey = null;
}
