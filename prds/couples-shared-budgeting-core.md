---
title: Couples Shared Budgeting Core
created: 2026-02-19
status: draft
owner: Tommy
log:
  - 2026-02-19: Initial requirements documented
---

## Problem
Most budgeting apps are built around individual money management with optional partner collaboration. Households that combine finances often need to force-fit joint behavior into tools that assume separate ownership, fragmented visibility, or permissions complexity.

## Business Context
Ours Ledger is intentionally opinionated toward the "one household wallet" model. The product will optimize for couples (and optionally single users) who want one source of truth for all cash flow, goals, and tradeoffs.

### Competitive Research Snapshot (as of 2026-02-19)
Leading apps reviewed and what they validate:

- YNAB: zero-based budgeting, real-time sync, and budget sharing for partners are central adoption drivers. Source: [YNAB Features](https://www.ynab.com/features), [YNAB Together](https://www.ynab.com/ynab-together)
- Monarch Money: multi-account aggregation, shared household access, collaborative planning, and dashboarding are high-value for families. Source: [Monarch Features](https://www.monarchmoney.com/features), [Monarch Couples](https://www.monarchmoney.com/couples)
- Rocket Money: recurring bill/subscription awareness and active cost-reduction flows improve perceived savings impact. Source: [Rocket Money Features](https://www.rocketmoney.com/features)
- Quicken Simplifi: spend planning and watchlist-style monitoring of key categories are useful for proactive cash management. Source: [Quicken Simplifi](https://www.quicken.com/products/simplifi/)
- Copilot Money: strong transaction categorization, automation, and upcoming-partner support signal demand for shared oversight with modern UX. Source: [Copilot](https://copilot.money/)
- EveryDollar: straightforward, category-first monthly planning remains attractive for households wanting simple discipline. Source: [EveryDollar](https://www.ramseysolutions.com/ramseyplus/everydollar)
- PocketGuard: debt payoff planning plus budget guardrails resonate with users focused on reducing financial stress. Source: [PocketGuard](https://pocketguard.com/)
- Goodbudget: envelope-based budgeting and cross-device sync prove enduring demand for shared planning rituals. Source: [Goodbudget Home](https://goodbudget.com/), [Goodbudget Why](https://goodbudget.com/why-goodbudget)

## Goals & KPIs
Primary goals:

- Deliver a couples-first budgeting system where all account visibility is shared by default.
- Reduce household budgeting friction through one unified workflow.
- Improve planning confidence via actionable forecasts and routines.

KPIs (first 6 months post-beta):

- 70%+ of households complete account-link onboarding within 24 hours.
- 60%+ of active households set a monthly zero-based plan before day 3 of each month.
- 50%+ of active households complete at least one weekly budget review check-in.
- <2% monthly churn for paying households by month 6.
- 25%+ of households create at least one long-term goal and one debt payoff plan.

## Personas/Journeys
Primary persona:

- Shared-money couples (married/partnered) with pooled income and shared responsibilities.

Secondary persona:

- Single household operator planning to invite a partner later.

Core journeys:

1. Couple onboarding: connect accounts, confirm joint assumptions, create first monthly plan.
2. Weekly alignment: review spend vs plan, reassign dollars, decide tradeoffs together.
3. Monthly reset: roll budget forward, assign new income, rebalance sinking funds.
4. Goal acceleration: allocate extra cash toward debt payoff or savings goals.

## Functional Requirements
MVP (Phase 1):

- Shared household workspace with equal default permissions.
- Multi-account aggregation (bank, credit card, loans, savings, manual accounts).
- Zero-based monthly budgeting by category and envelope-style buckets.
- Shared transaction feed with category assignment and split support.
- Recurring transaction detection and bill calendar.
- Rule-based categorization and merchant normalization.
- Partner activity history (who changed category, target, or note).

Phase 2:

- Subscription center with cancellation prompts and potential savings flags.
- Cash-flow forecasting for 30/60/90-day horizons.
- Goal engine (emergency fund, vacation, major purchase) with contribution pacing.
- Debt payoff planner (snowball/avalanche views).
- Weekly review ritual templates and nudges.

Phase 3:

- Scenario planning (income loss, new baby, move, major repairs).
- Smart anomaly detection and personalized spending alerts.
- Household net worth timeline with milestones.
- Advisor or coach view (read-only share links with expiration).

## Non-functional Requirements
- Reliability: 99.9% uptime target for authenticated experience.
- Performance: initial dashboard load <2.5s on median US broadband.
- Accessibility: WCAG 2.2 AA across core budgeting flows.
- Security: encrypted credentials in transit and at rest; least-privilege access model.
- Compliance: privacy controls aligned with GDPR/CCPA principles.

## Data & Integrations
Core integrations:

- Auth.js with Google Sign-In as initial provider.
- Convex as system of record for users, budgets, transactions, goals, and files.
- Plaid or equivalent account-linking provider (evaluation required).
- Resend for lifecycle and notification emails.
- Stripe for subscription billing.

Data model principles:

- Household is the primary ownership boundary.
- All household members with accepted invite have full ledger visibility by default.
- Budget periods, categories, goals, and debt plans are versioned for auditability.

## Open Questions
- Should we allow temporary category-level editing locks for conflict reduction?
- Should partners be required to acknowledge major budget changes?
- What is the best default method for paycheck assignment in irregular-income households?
- Which onboarding style produces best activation: guided wizard or immediate dashboard?

## Risks & Mitigations
- Risk: users from separate-finance households may churn quickly.
  Mitigation: explicit positioning and onboarding qualification screens.
- Risk: data-link reliability issues reduce trust.
  Mitigation: manual transaction fallback, transparent sync status, retry handling.
- Risk: partner disagreement creates product blame.
  Mitigation: add decision logs, change context, and structured review rituals.
- Risk: crowded category setup causes onboarding drop-off.
  Mitigation: provide prebuilt templates and progressive category expansion.

## Success Metrics
- Household activation rate (connected + first budget created)
- Weekly active households
- Median monthly budget completion percentage
- Recategorization correction rate
- Goal contribution consistency
- NPS segmented by household type and lifecycle stage

## Rollout Plan
1. Alpha (internal + 20 invited households)
   - Validate onboarding, syncing reliability, and baseline budgeting loop.
2. Private beta (200 households)
   - Add weekly rituals, goals, debt planner, and retention instrumentation.
3. Public launch
   - Expand templates, lifecycle messaging, and paid conversion funnel.
4. Post-launch optimization
   - Iterate on automation, anomaly detection, and collaboration ergonomics.

## Next Steps
1. Finalize brand direction and onboarding voice with project owner.
2. Define Convex schema draft and household permission model.
3. Build Auth.js + Convex + Google Sign-In foundation.
4. Implement Phase 1 account aggregation and budgeting core.
5. Add analytics instrumentation tied to KPIs.
