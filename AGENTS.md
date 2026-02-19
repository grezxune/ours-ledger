# AGENTS.md (Project Local)

## Project Identity
- Product name: Ours Ledger
- Target users: individuals and teams managing shared household or business finances
- Core model: entity-first collaboration (`household`, `business`)
- Motto: "What's mine is ours"
- This is a PROFESSIONAL product and every shipped UI must be presentable to the world.

## Product Constraints
- Every ledger object belongs to an entity.
- Entity types in v1: `household`, `business`.
- Membership roles in v1: `owner`, `user`.
- Invites can assign either role (`owner` or `user`).
- At least one owner must always exist per entity.

## Financial Capabilities
- Support one-off income/expense entries.
- Support recurring income/expense schedules.
- Support manual transaction entry plus Plaid-imported transactions.
- Support automation rules based on recurring patterns and category logic.

## UX Baseline
- Follow `UxStyle.md` for color, typography, motion, and accessibility.
- Support light and dark themes for all newly built screens.
- Mobile-first layouts with resilient breakpoints and no horizontal scroll.
- Always use the shared `SelectField` component (`src/components/ui/field.tsx`) for dropdowns; do not use raw `<select>` in feature code.
- Entity addresses must use Google Places autocomplete for structured capture; avoid freeform single-field address inputs.
- In dense row/table/list action groups, sibling actions must use one consistent structural style (for example, all icon-only ghost actions). Do not mix filled/text buttons with icon-only actions in the same row.
- For row-level contextual actions, use a compact 3-dot action menu with icon + text labels instead of multiple inline buttons.
- Any destructive action must require an explicit confirmation modal before execution.
- Confirmation flows must use the shared modal primitives (`src/components/ui/modal.tsx` and `src/components/ui/confirmation-modal.tsx`) for consistent branding and behavior.

## Engineering Baseline
- App Router only.
- Use server components by default.
- Keep files under 200 LOC (except files in `prds/`).
- Use Bun for dependency and script execution.
- Use industry-standard patterns for architecture and development decisions.

## Authentication Standard
- Use Auth.js (NextAuth.js) as the only authentication framework.
- Do not introduce alternate auth platforms (Auth0, Clerk, Supabase Auth, custom JWT auth) without explicit owner approval.
- Google Sign-In is the initial provider and must be implemented through Auth.js.
- All token/session validation must happen server-side.

## Security Baseline (Financial App)
- Treat Ours Ledger as a high-sensitivity financial application.
- Enforce deny-by-default authorization with least-privilege role checks on every protected operation.
- Never trust client-supplied identity or role fields for authorization decisions.
- Require server-side ownership checks for all entity, transaction, and document reads/writes.
- Store secrets only in environment/managed secret systems; never commit credentials.
- AWS setup flows must use short-lived credentials or IAM role assumptions; never persist raw AWS secret keys.
- Keep S3 buckets private by default and deliver documents through controlled CloudFront access.
- Maintain immutable audit logging for auth, role changes, ledger mutations, document access, and admin actions.
- Redact sensitive material (tokens, secrets, account identifiers) from logs and error payloads.

## Presentation Standard
- Use industry-standard patterns for style decisions and interaction design.
- Prioritize clean spacing, hierarchy, and accessibility so screens are production-ready by default.
- Avoid temporary-looking UI; every new screen should read as launch-quality.

## Clarification Needed From Owner
- Business entity minimum fields: legal name/tax fields required at creation or optional?
- Should `user` role be allowed to edit recurring schedules or view-only for these?
- Should both entity types share the same category taxonomy or maintain separate defaults?
