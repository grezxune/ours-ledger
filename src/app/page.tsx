import { PRODUCT_MOTTO, PRODUCT_NAME } from "../lib/household-principles";

const productPillars = [
  {
    title: "One Household Ledger",
    summary:
      "All linked accounts, balances, and transactions sit in one shared source of truth.",
  },
  {
    title: "Zero-Based at the Core",
    summary:
      "Every dollar gets a job before the month starts so both partners align on priorities.",
  },
  {
    title: "Collaboration, Not Permissions",
    summary:
      "Both adults have equal visibility and full editing rights by default.",
  },
];

const roadmapPreview = [
  "Household account linking + shared onboarding",
  "Shared budgeting workflow with weekly review rituals",
  "Shared transaction feed with rule-based categorization",
  "Subscription insights, bill calendar, and cash-flow forecasts",
  "Goals, debt payoff, and net worth dashboards",
];

/**
 * Marketing placeholder for the initial project scaffold.
 */
export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-3xl border border-line/70 bg-surface/80 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.2em] text-accent-strong">
              {PRODUCT_NAME}
            </p>
            <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-5xl">
              {PRODUCT_MOTTO}
            </h1>
          </div>
          <p className="max-w-sm rounded-2xl border border-line bg-surface-muted/60 px-4 py-3 text-sm leading-relaxed">
            Couples-first money management for households that share everything.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {productPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-line/80 bg-surface p-5"
            >
              <h2 className="font-serif text-xl">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {pillar.summary}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-line/80 bg-surface-muted/55 p-5">
          <h2 className="font-serif text-2xl">Roadmap Preview</h2>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {roadmapPreview.map((item) => (
              <li key={item} className="rounded-xl border border-line/70 bg-surface/80 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-foreground/80">
            Full requirements and market-derived feature roadmap live in
            {" "}
            <code>prds/couples-shared-budgeting-core.md</code>.
          </p>
        </section>
      </div>
    </main>
  );
}
