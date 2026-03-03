# Our Ledger UX Style Guide

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
- Accent: `#0EA5E9`
- Accent dark: `#0284C7`
- Primary action fill (buttons): `#0B78B5`
- Primary action hover: `#075985`
- Primary action text: `#F8FCFF`
- Surface light: `#F7FBFF`
- Surface dark: `#14253A`
- Text light mode: `#16324A`
- Text dark mode: `#F0F7FF`

## Primary Button Rule
- Do not pair light-blue fills with white text for primary CTA buttons.
- All filled primary buttons must use the `action-primary` token pair (`#0B78B5` default, `#075985` hover) with `#F8FCFF` text.
- Any future palette change for primary CTA buttons must preserve WCAG 2.2 AA contrast in both light and dark themes.

## Button Component Rule
- All button-like actions and links must use the shared `Button` component (`src/components/ui/button.tsx`).
- Use `asChild` on `Button` when the action is navigation (`Link`/anchor) so visual treatment stays centralized.
- Tab navigation is the explicit exception: tabs must use the shared `TabNav` component (`src/components/ui/tab-nav.tsx`), not `Button`.
- Raw `<button>` usage is allowed only for low-level UI primitives where structural behavior is required (for example listbox options, combobox triggers, or menu-item internals).

## Tab Navigation Rule
- All tab bars and stacked tab menus must use the shared `TabNav` component (`src/components/ui/tab-nav.tsx`).
- Do not render tabs as nested button surfaces; tab styling must come from `TabNav` item states.
- Active tab state must always be route-aware and exposed via `aria-current="page"`.

## Typography
- Sans: Manrope (UI, labels, data displays)
- Serif: Fraunces (headlines, key value statements)

## Spacing & Layout
- Prioritize breathing room around balances and decisions.
- Use cards and sectioning for cognitive chunking.
- Keep entity switcher and role indicators visible at key decision points.
- No horizontal page overflow. Root layout must enforce `overflow-x: hidden`.
- For planned financial line items (for example planned income and recurring planned expenses), default to compact tables with dense row spacing instead of card-per-row layouts.

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

## Planning Table Standard
- Planned-income and recurring-planned-expense lists must use the same compact table pattern: subtle header divider, dense row spacing (`py-2`), and a right-aligned actions column.
- Planned-income and recurring-planned-expense surfaces must stay in responsive parity (same breakpoint strategy and interaction pattern families).
- The first column should carry the primary row label plus optional muted metadata lines (for example notes) to avoid adding wide extra columns.
- Recurring planned expenses should expose dedicated `Category` and `Account` columns (not combined inline with the expense title) to support fast scanning.
- Dense planned tables must provide a mobile fallback (`< md`) that stacks content/inputs vertically; do not rely on horizontal scrolling for core planning interactions.
- Table data entry for planned income and recurring planned expenses must use an inline input row directly under the table rows (not a detached card form or standalone modal for creation).
- When a table does not include a dedicated Notes column, notes input should appear in a compact secondary row immediately below the main input row using a full-width/colspan layout.
- Inline under-table entry controls should use ghost-style field treatment (no individual rounded borders/background blocks) with tight cell padding so the row reads as one continuous table entry surface.
- Inline under-table entry controls should be square in all states (no border radius when focused or unfocused) and use bottom-border-only focus styling with no full-outline ring.
- Do not use large padded tile/card rows for planned line-item lists unless there is a documented exception in the PRD.

## Confirmation Patterns
- All destructive actions (delete/remove/revoke/archive) must require an explicit confirmation modal before execution.
- Do not use browser-native dialogs; always use shared branded modal components for confirmation flows.
- Confirmation UIs should use shared modal primitives so behavior and visual style stay consistent across the app.

## Floating UI Boundaries
- Tooltips must always stay within the viewport; clamp horizontal position and flip vertically when needed.
- Shared select dropdown menus must render in a portal attached to `document.body` so they are never clipped by parent overflow/stacking contexts.
- Select/dropdown menus must choose open direction (`up` or `down`) based on available viewport space.
- Opening a select/dropdown must never require page scrolling; constrain menu height and use internal list scrolling instead.
- Select/dropdown menus must recompute viewport placement on scroll/resize and clamp position so menus remain fully visible.
- Add-new select actions (for example `Add Category`, `Add Account`, `Add Institution`) must render as CTA-style options inside the shared `SelectField` dropdown with:
  - a divider line above the first add option in the menu
  - icon + text treatment using the shared plus-circle CTA icon style
  - no duplicate standalone add button outside the select for the same action
- Modals must stay fully reachable on all viewport sizes; when content exceeds available height, modal content must scroll internally.
- Dismiss overlays for drawers/modals must always use a full-viewport backdrop (`fixed` + `inset-0`) and must not use sized icon-button styles.

## Accessibility
- WCAG 2.2 AA contrast minimum.
- Keyboard accessible navigation, menus, modals, and critical workflows.
- Avoid color-only status indicators; pair with text or iconography.

## Production Bar
- Every authentication, onboarding, and navigation touchpoint must look polished and enterprise-ready.
- Prefer familiar control patterns (e.g., provider buttons, form labels, error placement) to reduce user friction.
- Visual quality should feel intentional on desktop and mobile, not prototype-like.
- Primary header desktop navigation must only render when there is enough horizontal room for all items (use a high breakpoint with mobile drawer fallback rather than cramped tabs).

## Open Brand Questions
- Should household and business entities use visual differentiation (badges/colors) or one neutral system?
- Should the onboarding voice be more operational (finance ops) or coaching-oriented (behavioral budgeting)?
