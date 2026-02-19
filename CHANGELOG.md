# Changelog

## [0.2.25] - 2026-02-19

- Added shared Auth.js secret resolution that gracefully falls back when `NEXTAUTH_SECRET`/`AUTH_SECRET` are missing.
- Wired NextAuth config to the new resolver so environments without explicit auth secret no longer crash with `NO_SECRET`.
- Added unit tests covering secret precedence and deterministic fallback behavior.

## [0.2.24] - 2026-02-19

- Replaced project no-words logo assets with the updated `~/Documents/ours-ledger-logo-no-words.png` source after background removal and tight trimming.
- Rebuilt favicon sources/derivatives from the updated no-words mark and regenerated `src/app/favicon.ico`.
- Updated header branding to use the no-words logo mark with the app title rendered as text to the right of the mark.

## [0.2.23] - 2026-02-19

- Replaced the Documents source logo with the new `~/Downloads/ours-ledger-logo.png` asset.
- Overwrote project logo originals/runtime copy with a cleaned version of the new logo (background removed and tightly trimmed to content).
- Regenerated the web-sized header logo from the cleaned original and updated header intrinsic image dimensions to match.

## [0.2.22] - 2026-02-19

- Removed checker/white matte backgrounds from all provided logo assets (both originals and runtime copies) and converted them to true alpha transparency.
- Trimmed all provided logo assets to tight content bounds to eliminate excess canvas/padding around marks and lockups.
- Regenerated favicon/icon derivatives (`16x16`, `32x32`, `apple-touch`, Android, and `src/app/favicon.ico`) from the cleaned transparent source.
- Updated header logo image intrinsic dimensions to match trimmed assets and reduced motto text size for a cleaner lockup.

## [0.2.21] - 2026-02-19

- Imported new brand assets into `public/branding` with both full-size originals and optimized runtime copies.
- Replaced text-based header title with the new logo image and added a mark-only logo variant for smaller screens.
- Reduced the visual size of the "What's mine is ours." line in the header.
- Configured app metadata icons to use the new favicon and apple-touch assets.

## [0.2.20] - 2026-02-19

- Added clickable audit event rows with drill-down links from both the dashboard and a new dedicated `/audits` index route.
- Added audit detail route `/audits/[id]` showing action metadata, resolved target record, and related entity/account/budget/transaction context.
- Added server-side audit visibility filtering and detail resolution in Convex (`listRecent` now user-scoped, plus new `getById` query).
- Enriched audit metadata capture across entity, account, transaction, budget, invitation, document, and storage mutations for higher-fidelity event context.
- Added unit/integration test coverage for audit presentation helpers and audit event list rendering.
- Added PRD `prds/audit-event-drilldown.md` and updated the PRD index.

## [0.2.19] - 2026-02-19

- Lightened the full blue theme palette (background, surfaces, text, lines, and accent strength) to reduce perceived darkness across light and dark modes.
- Added a shared root-level `GlobalParallaxBackground` component so the same animated/parallax backdrop appears on every page, including marketing routes.
- Replaced static body gradient painting with layered animated background primitives that respond to scroll depth and honor reduced-motion preferences.

## [0.2.18] - 2026-02-19

- Removed the visible `Actions` header label from the planned-income table and constrained the action column width for the 3-dot menu.

## [0.2.17] - 2026-02-19

- Replaced remaining green-tinted global theme neutrals with sky-blue variants (`background`, `foreground`, `surface-muted`, and `line`) in light and dark modes.
- Updated the super-admin storage success banner from `emerald` utility classes to `sky` classes to remove the last explicit green success styling.
- Synced `UxStyle.md` surface/text color tokens with the new blue-forward palette.

## [0.2.16] - 2026-02-19

- Generalized shared `ActionMenu` to a modular input model (`id`, `label`, optional `icon`, `tone`, `disabled`, `closeOnSelect`) plus configurable trigger/menu labels and alignment.
- Updated planned-income usage to the new modular menu API so the component can be reused for non-income contexts.

## [0.2.15] - 2026-02-19

- Updated the global primary/accent theme from green to sky blue by replacing shared accent tokens in `src/app/globals.css` for light and dark modes.
- Updated `UxStyle.md` color direction values to match the new sky-blue primary palette.

## [0.2.14] - 2026-02-19

- Replaced planned-income inline action buttons with a compact 3-dot action menu containing labeled `Edit` and `Delete` items.
- Added a shared `ActionMenu` component for consistent row-level contextual actions.
- Added a shared `ConfirmationModal` component (built on shared `Modal`) and routed income-source deletion through explicit confirmation.
- Moved planned-income add/edit form entry from in-page expansion to a shared modal flow opened by CTA/menu actions.
- Routed recurring planned-expense deletion through the same shared confirmation modal pattern for consistency on the budget page.
- Updated local `AGENTS.md` and `UxStyle.md` to require action menus for row actions and confirmation modals for destructive actions.

## [0.2.13] - 2026-02-19

- Moved planned income sources into the primary budget card and redesigned the section into a compact, lower-intensity table layout.
- Added per-income `Edit` actions and an on-demand shared add/edit form so income setup is hidden until needed.
- Added an under-table `Add income source` CTA that opens the form instead of showing full controls by default.
- Added backend update support for budget income sources (`updateIncomeSource`) with server action and data-layer wiring.
- Added unit and integration tests for the new planned-income source component behavior.
- Standardized planned-income row actions so `Edit` and `Delete` both use the same icon-only action styling.
- Added explicit guidance in `AGENTS.md` and `UxStyle.md` requiring consistent control structure across row-level action groups.

## [0.2.12] - 2026-02-19

- Rebuilt shared `Tooltip` as a viewport-aware floating surface that clamps to screen edges and auto-flips vertical placement.
- Added shared dropdown positioning hook and upgraded `SelectField` to open upward/downward based on available space.
- Ensured select menus stay in-viewport with constrained height and internal scrolling, avoiding page-scroll side effects when opened.
- Updated shared modal container to support internal scrolling (`max-height` + `overflow-y-auto`) for oversized content.
- Added explicit floating-surface boundary rules to `UxStyle.md` to keep tooltips/selects/modals consistent going forward.

## [0.2.11] - 2026-02-19

- Standardized standalone icon actions to render without filled backgrounds or borders, using semantic icon color only.
- Updated shared `Button` icon-only behavior to enforce transparent icon actions with accessible sizing and focus treatment.
- Aligned modal/entity mobile-nav close icon controls to the same transparent icon-action pattern.
- Added permanent icon-action guidance to `UxStyle.md` for consistency across future UI work.

## [0.2.10] - 2026-02-19

- Added `lucide-react` and introduced icon-first action affordances across app shell, entity navigation, and core form workflows.
- Replaced budget `Remove` text buttons with accessible trash-can icon actions, including contextual tooltips and explicit ARIA labels.
- Added shared `Tooltip` UI primitive and upgraded shared `Button` to support icons, icon-only mode, and reusable tooltip integration.
- Improved ARIA coverage for high-traffic controls (menus, dialog close controls, select interactions, address suggestions, and action links/buttons).

## [0.2.9] - 2026-02-19

- Added entity account support (`manual` and `plaid` sources) for budget paid-from attribution.
- Updated recurring planned expenses to require a selected paid-from account and persist `accountId` on budget expense records.
- Added an in-page modal account creation flow on the budget screen, including CTA-only select behavior when no accounts exist.
- Added recurring expense planner integration coverage for the no-account CTA state.

## [0.2.8] - 2026-02-19

- Added entity budget planning backend and UI section with expected remaining money summaries and period support (`weekly`, `monthly` default, `yearly`).
- Added dedicated entity sections/routes for `Budget`, `Transactions`, and `Members` (invite management) and refocused `Manage` on operational tools.
- Added entity-scoped responsive navigation with a mobile slide-over menu for section switching.
- Added Convex budget domain tables/functions (`entityBudgets`, `budgetIncomeSources`, `budgetRecurringExpenses`) and server-side data wrappers.
- Added budget period normalization utilities and test coverage (`src/lib/budget/math.test.ts`) plus entity nav integration coverage.

## [0.2.7] - 2026-02-19

- Added `prds/entity-budget-builder.md` defining requirements for a dedicated entity budget planning section (multi-source income + recurring planned expenses, separate from transactions/Plaid).
- Updated `prds/README.md` index with the new budget builder PRD.

## [0.2.6] - 2026-02-19

- Replaced shared `SelectField` native `<select>` styling with a custom dropdown trigger and menu styled to match the Google Places suggestion surface.
- Added explicit right-side trigger padding for the chevron icon to prevent text overlap and improve readability.
- Preserved form-post compatibility by keeping an underlying native `<select>` for submissions/events.
- Added unit and integration tests for custom select rendering and default-value behavior.

## [0.2.5] - 2026-02-19

- Migrated entity address autocomplete from legacy `google.maps.places.Autocomplete` to Places API (New) via server-side `/api/google/places/*` proxy routes.
- Added shared Google Places integration helpers for autocomplete and place detail normalization.
- Added unit coverage for Places API (New) address mapping into `EntityAddress`.
- Updated environment variable docs to prefer server-side `GOOGLE_MAPS_API_KEY` with `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` as optional fallback.

## [0.2.4] - 2026-02-19

- Removed timezone from the entity application model and create/update forms.
- Reworked entity addresses into structured fields and integrated Google Places autocomplete for address capture.
- Added shared `SelectField` UI component and migrated entity/manage form dropdowns away from raw `<select>` usage.
- Updated Convex entity schema/functions and app data wrappers to persist structured addresses.
- Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` documentation and project guidance enforcing shared select usage.

## [0.2.3] - 2026-02-19

- Migrated app persistence from the in-memory server store to Convex-backed schema, queries, and mutations.
- Added Convex domain modules for users, entities, memberships, invitations, ledger transactions, documents, storage configuration, and audit events.
- Replaced `src/lib/data/*` implementations with server-only Convex HTTP client wrappers and removed the in-memory state module.
- Updated App Router pages and server actions to await asynchronous Convex data operations end-to-end.
- Kept S3 document upload on the Next.js server and persisted uploaded document metadata via Convex mutation.

## [0.2.2] - 2026-02-19

- Added Bun scripts for Convex workflows:
  - `bun run convex:dev` for local Convex development.
  - `bun run convex:deploy` for production Convex deployment (`--prod`).

## [0.2.1] - 2026-02-19

- Redesigned signed-out home route into a full marketing landing page with high-clarity product messaging, feature sections, and security callouts.
- Refined marketing copy to avoid exposing internal implementation details while keeping Plaid positioning in customer-facing messaging.
- Updated app shell navigation to show only relevant actions by auth state:
  - Signed-out: `Home`, `Sign In`
  - Signed-in: `Dashboard`, `Create Entity`, `Sign Out` (+ `Admin Storage` for `super_admin`)
- Added motion utilities for staged reveal animations with reduced-motion accessibility fallback.
- Expanded integration tests to cover both signed-in and signed-out navigation behavior.
- Redesigned `/signin` into a professional two-panel login experience with polished layout and trust-oriented messaging.
- Implemented industry-standard visual treatment for the Google sign-in button (white surface, border, Google mark, accessible focus states).
- Updated `AGENTS.md` and `UxStyle.md` to explicitly require professional, presentable UI and industry-standard architecture/development/style patterns.
- Replaced direct header sign-out link with a signed-in user avatar menu that opens account actions, including sign out.
- Refined avatar trigger styling to remove outer outline/border and present only the user circle.

## [0.2.0] - 2026-02-19

- Implemented Auth.js (NextAuth.js) authentication with Google + secure dev credentials flow and `super_admin` role derivation.
- Added entity App Router flows: `/entity/create`, `/entity/[id]`, `/entity/[id]/update`, and `/entity/[id]/manage`.
- Implemented owner-managed invitations and role assignment (`owner`/`user`) with acceptance/revocation flow.
- Implemented ledger transaction creation for one-off and recurring manual entries.
- Implemented S3-backed document upload flow with entity-scoped metadata and audit event logging.
- Added `super_admin` storage dashboard (`/admin/storage`) for AWS credential validation and S3/CloudFront setup checks.
- Added server-only data modules, AWS integration modules, route-level security guards, and reusable UI shell/components.
- Added unit and integration tests for role parsing and authenticated app shell behavior.

## [0.1.3] - 2026-02-19

- Strengthened local `AGENTS.md` with Auth.js (NextAuth.js)-only authentication policy.
- Added financial-grade security guardrails to local agent guidance (server-side authorization, credential handling, audit requirements).
- Updated PRD security architecture with explicit auth/session constraints, admin privilege controls, and release security gates.
- Updated README stack and security posture to reflect Auth.js-only auth and financial application security standards.

## [0.1.2] - 2026-02-19

- Added roadmap requirements for entity document uploads (receipts, invoices, contracts) and ledger attachment flows.
- Added roadmap requirements for a `super_admin` AWS setup dashboard to configure S3 bucket and CloudFront distribution settings.
- Documented credential handling constraints for AWS setup workflows (server-side execution, no raw secret persistence).

## [0.1.1] - 2026-02-19

- Updated project documentation to an entity-based model supporting both `household` and `business` workspaces.
- Documented role-based collaboration with invite flows (`owner`, `user`, invite-as-owner support).
- Expanded requirements for one-off and recurring income/expense ledger entries.
- Added Plaid API integration requirements for account linking, import, and automation flows.
- Renamed PRD to `prds/shared-entity-finance-core.md` and updated PRD index references.

## [0.1.0] - 2026-02-19

- Scaffolded Next.js 16 + Tailwind CSS 4 app using Bun.
- Established initial brand shell and homepage for Ours Ledger.
- Added project guidance files: `AGENTS.md` and `UxStyle.md`.
- Added PRD roadmap and market research synthesis in `prds/couples-shared-budgeting-core.md`.
- Added baseline unit and integration tests for shared-household messaging.
