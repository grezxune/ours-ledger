# Ours Ledger UX Style Guide

## Product Feel
- Confident, calm, and practical.
- Built for shared financial stewardship across households and businesses.
- Tone: transparent, grounded, never judgmental.
- Professional and presentable to the world at launch quality.

## Design Principles
- Entity-first context: always show active entity and role context clearly.
- Shared-by-default visibility: collaboration should feel native, not bolted on.
- Decision clarity: surface tradeoffs and consequences directly in plain language.
- Friction where it helps: confirmations for destructive actions, low friction for routine tracking.
- Use industry-standard patterns for architecture, development, and style decisions.

## Color Direction
- Primary: `#0EA5E9`
- Primary dark: `#0284C7`
- Surface light: `#F7FBFF`
- Surface dark: `#14253A`
- Text light mode: `#16324A`
- Text dark mode: `#F0F7FF`

## Typography
- Sans: Manrope (UI, labels, data displays)
- Serif: Fraunces (headlines, key value statements)

## Spacing & Layout
- Prioritize breathing room around balances and decisions.
- Use cards and sectioning for cognitive chunking.
- Keep entity switcher and role indicators visible at key decision points.
- No horizontal page overflow. Root layout must enforce `overflow-x: hidden`.

## Motion
- Subtle, meaning-driven transitions only.
- Use motion to indicate state change (saved, synced, alerted), not decoration.
- Use one shared ambient parallax background system across all routes so visual depth stays consistent throughout the product.

## Icon Actions
- Standalone icon actions (icon-only controls) must use transparent backgrounds and no border by default.
- Icon color should carry semantic intent using the same token family as filled actions:
  - Primary icon actions use accent tones.
  - Neutral icon actions use foreground tones.
  - Destructive icon actions use red/destructive tones.
- Preserve accessible hit targets (minimum 36x36), visible focus rings, and clear tooltips/ARIA labels.
- In row-level action groups (tables/lists), peer actions must share the same control structure. If one action is icon-only, all peer actions in that group should also be icon-only (for example, `Edit` + `Delete`).
- Row-level contextual actions should default to a 3-dot action menu with icon + text labels for each menu item.

## Confirmation Patterns
- All destructive actions (delete/remove/revoke/archive) must require an explicit confirmation modal before execution.
- Do not use browser-native dialogs; always use shared branded modal components for confirmation flows.
- Confirmation UIs should use shared modal primitives so behavior and visual style stay consistent across the app.

## Floating UI Boundaries
- Tooltips must always stay within the viewport; clamp horizontal position and flip vertically when needed.
- Select/dropdown menus must choose open direction (`up` or `down`) based on available viewport space.
- Opening a select/dropdown must never require page scrolling; constrain menu height and use internal list scrolling instead.
- Modals must stay fully reachable on all viewport sizes; when content exceeds available height, modal content must scroll internally.

## Accessibility
- WCAG 2.2 AA contrast minimum.
- Keyboard accessible navigation, menus, modals, and critical workflows.
- Avoid color-only status indicators; pair with text or iconography.

## Production Bar
- Every authentication, onboarding, and navigation touchpoint must look polished and enterprise-ready.
- Prefer familiar control patterns (e.g., provider buttons, form labels, error placement) to reduce user friction.
- Visual quality should feel intentional on desktop and mobile, not prototype-like.

## Open Brand Questions
- Should household and business entities use visual differentiation (badges/colors) or one neutral system?
- Should the onboarding voice be more operational (finance ops) or coaching-oriented (behavioral budgeting)?
