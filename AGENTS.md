# AGENTS.md (Project Local)

## Project Identity
- Product name: Ours Ledger
- Target users: singles and couples running one shared household budget
- Financial model: fully shared money by default
- Motto: "What's mine is ours"

## Product Constraints
- No private/hidden partner accounts in v1.
- Shared visibility is the baseline across balances, budgets, and transaction history.
- Collaboration workflows should assume equal partner permissions.

## UX Baseline
- Follow `UxStyle.md` for color, typography, motion, and accessibility.
- Support light and dark themes for all newly built screens.
- Mobile-first layouts with resilient breakpoints and no horizontal scroll.

## Engineering Baseline
- App Router only.
- Use server components by default.
- Keep files under 200 LOC (except files in `prds/`).
- Use Bun for dependency and script execution.

## Clarification Needed From Owner
- Preferred visual style: earthy and warm vs premium and minimal.
- Onboarding voice: practical planner vs emotionally supportive coach.
- Initial launch audience priority: newly married couples vs established households.
