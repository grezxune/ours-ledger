# Ours Ledger

A shared-entity finance platform where users collaborate on household and business money in one place.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Auth.js (NextAuth.js) for authentication
- Bun package manager

## Product Principle

"What's mine is ours." Visibility and collaboration are defaults across shared entities.

## Security Posture

- Financial-grade security is a first-class product requirement.
- Authentication is Auth.js (NextAuth.js) only, with server-side token/session validation.
- Authorization is deny-by-default with explicit entity ownership and role checks.
- Secrets are environment-managed; credentials and keys are never persisted in plaintext.
- Document storage is private by default, with controlled delivery through CloudFront.
- Critical flows (auth, role changes, ledger updates, document actions, admin setup) require audit logging.

## Core Scope

- Create and manage `household` and `business` entities.
- Invite collaborators as `owner` or `user`.
- Track one-off and recurring income/expenses per entity.
- Connect Plaid to import account activity and power automation.
- Upload entity-scoped documents (receipts, invoices, contracts) tied to ledger workflows.
- Provide a `super_admin` dashboard to configure AWS S3 buckets and CloudFront distribution settings for file storage and delivery.

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:4100](http://localhost:4100).

## Environment Variables

```bash
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000

# Optional Google Auth.js provider
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Google Places API (New) for address autocomplete
GOOGLE_MAPS_API_KEY=

# Optional fallback for local/client-side integrations only
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Dev credentials sign-in passphrase (default: ours-ledger)
DEV_AUTH_PASSPHRASE=ours-ledger

# Comma-separated super admin emails
SUPER_ADMIN_EMAILS=admin@example.com

# Optional runtime AWS credentials for document uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
```

## Implemented Routes

- `/signin`: Auth.js sign-in (Google + dev credentials).
- `/entity/create`: create household/business entities.
- `/entity/[id]`: entity detail view.
- `/entity/[id]/update`: owner-only entity profile updates.
- `/entity/[id]/manage`: invites, transactions, and document uploads.
- `/admin/storage`: super admin S3/CloudFront configuration dashboard.

## Scripts

```bash
bun run dev
bun run lint
bun run test
bun run build
bun run start
```

## Planning Docs

- Core roadmap PRD: `prds/shared-entity-finance-core.md`
- PRD index: `prds/README.md`
- UX direction: `UxStyle.md`
- Project-specific agent guidance: `AGENTS.md`
