import Link from "next/link";
import { Card } from "@/components/ui/card";

const proofPoints = [
  { label: "Entity-first model", value: "Household + business" },
  { label: "Access governance", value: "Granular team permissions" },
  { label: "Financial-grade posture", value: "Audit-ready operations" },
];

const featureGrid = [
  {
    title: "Shared Operational Ledger",
    summary:
      "One-off and recurring entries in a single source of truth with explicit ownership and history.",
  },
  {
    title: "Team-Ready Access Control",
    summary:
      "Entity-scoped invites and server-validated permissions keep sensitive actions tightly controlled.",
  },
  {
    title: "Document Intelligence",
    summary:
      "Upload receipts, contracts, and statements to keep evidence anchored to the exact transaction context.",
  },
  {
    title: "Automated Bank Workflows",
    summary:
      "Plaid-powered ingestion and rule-driven categorization reduce manual reconciliation overhead.",
  },
];

const operatingFlow = [
  "Create a household or business entity with clear ownership",
  "Invite collaborators with explicit roles",
  "Track one-off and recurring income/expenses",
  "Attach supporting documents and keep a complete audit trail",
];

/**
 * Marketing experience shown to visitors before authentication.
 */
export function MarketingLanding() {
  return (
    <div className="space-y-5">
      <section className="reveal-up rounded-3xl border border-line/80 bg-surface/90 p-6 shadow-sm sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">Financial collaboration platform</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Finance operations built for teams, not spreadsheets.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
              Ours Ledger unifies household and business cash movement into one secure operating layer. Invite
              collaborators, control permissions, and keep every transaction backed by context.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white" href="/signin">
                Start Secure Workspace
              </Link>
              <a className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium" href="#security">
                Security Architecture
              </a>
            </div>
          </div>
          <Card className="reveal-up reveal-delay-1" title="Operating Snapshot">
            <ul className="space-y-3 text-sm">
              {proofPoints.map((item) => (
                <li key={item.label} className="rounded-xl border border-line bg-surface px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-foreground/70">{item.label}</p>
                  <p className="mt-1 font-medium">{item.value}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {featureGrid.map((feature, index) => (
          <Card key={feature.title} className={`reveal-up ${index > 1 ? "reveal-delay-2" : "reveal-delay-1"}`}>
            <h3 className="font-serif text-2xl">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">{feature.summary}</p>
          </Card>
        ))}
      </section>

      <section className="reveal-up reveal-delay-2 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card title="How Teams Run Ours Ledger">
          <ol className="space-y-3 text-sm leading-relaxed">
            {operatingFlow.map((step, idx) => (
              <li key={step} className="flex gap-3 rounded-xl border border-line bg-surface px-3 py-2">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent-strong">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="bg-surface-muted/45" title="Built for Financial Trust">
          <div id="security" className="space-y-3 text-sm leading-relaxed text-foreground/85">
            <p>Secure identity with server-side session validation.</p>
            <p>Deny-by-default authorization and ownership checks on protected operations.</p>
            <p>Private document storage and auditable access patterns.</p>
            <p>Dedicated infrastructure controls for storage and delivery governance.</p>
          </div>
          <div className="mt-4">
            <Link className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium" href="/signin">
              Sign In
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
