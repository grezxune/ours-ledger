---
title: Audit Event Drilldown
created: 2026-02-19
status: in-progress
owner: Tommy
log:
  - 2026-02-19: Initial requirements documented for clickable audit events and full event detail drilldown.
  - 2026-02-19: Implemented dashboard-to-audit drilldown routes and backend detail query context resolution.
---

## Problem
Audit rows on the dashboard are currently non-clickable summary lines. Users cannot open one event to inspect the complete operational context for what changed.

## Business Context
Ours Ledger is a shared finance platform with high-sensitivity financial operations. Strong event auditability improves trust, operator confidence, and support/debug workflows.

## Goals & KPIs
- Enable users to click an audit item and open a detail view.
- Show complete event context, including affected records and related entities/accounts/budgets/transactions.
- Preserve useful context even when records are later deleted.
- KPI: 0 unresolved support escalations caused by missing audit detail context.

## Personas/Journeys
- Owner reviewing suspicious or unexpected changes.
- Collaborator verifying who changed a budget or transaction and when.
- Admin/support tracing operational issues from audit history.

Journey:
1. Open dashboard or audits page.
2. Click an audit event.
3. Review action, actor, target record, related records, and captured metadata.
4. Navigate back to audit index or linked entity context.

## Functional Requirements
- Add a dedicated audit index route: `/app/audits/page.tsx`.
- Add a dedicated audit detail route: `/app/audits/[id]/page.tsx`.
- Make dashboard audit entries clickable and routed to detail pages.
- Add backend query for fetching one audit event with resolved context records.
- Include captured metadata fields for entity/account/budget/transaction/document/invitation contexts where available.
- Restrict audit visibility to authorized scope (entity membership, actor, or super admin when platform-scoped).

## Non-functional Requirements
- Detail pages must render server-side with App Router patterns.
- Must remain mobile-friendly and support light/dark themes.
- File-level maintainability constraints remain in place (under 200 LOC per non-PRD file).

## Data & Integrations
- Convex `auditEvents` remains the source of truth.
- Add resolved context lookup against related Convex tables:
  - `entities`, `entityBudgets`, `budgetIncomeSources`, `budgetRecurringExpenses`
  - `entityAccounts`, `transactions`, `documents`, `invitations`, `storageConfigurations`

## Open Questions
- Should we eventually add diff views for update events (before vs after snapshots)?
- Should platform-scoped events be visible to all users or only actor + super admins?

## Risks & Mitigations
- Risk: deleted records remove context.
  Mitigation: store richer metadata snapshots during destructive mutations.
- Risk: unauthorized cross-entity visibility.
  Mitigation: enforce server-side audit visibility checks in queries.

## Success Metrics
- Users can open any visible audit event into a full detail view.
- Detail view includes target and related records for common financial actions.
- No horizontal overflow or accessibility regressions in audit routes.

## Rollout Plan
1. Ship backend query and visibility guard changes.
2. Ship dashboard and audits route click-through UI.
3. Validate with unit/integration tests and full build/test runs.

## Next Steps
- Add dedicated filters (action type, entity, actor, date range) on `/audits`.
- Add immutable update diffs for `*.updated` events.
