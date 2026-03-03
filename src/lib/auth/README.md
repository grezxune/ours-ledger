# Auth Layer

Auth.js (NextAuth.js) configuration and server-session helpers for authentication and role enforcement.

## Convex JWT Bridge

Server-side Convex calls are authenticated with short-lived RS256 JWTs minted by
`src/lib/auth/convex-token.ts` and exposed via `GET /api/auth/convex/jwks`.

Required environment variables:

- `CONVEX_AUTH_PRIVATE_KEY` (PKCS8 PEM private key)
- `NEXTAUTH_URL` (public app URL used as JWT issuer)

Convex auth provider configuration lives in `convex/auth.config.ts`.
