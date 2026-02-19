import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared card surface for dashboard and forms.
 */
export function Card({ title, children, className }: CardProps) {
  return (
    <section className={`rounded-2xl border border-line/80 bg-surface/90 p-5 shadow-sm ${className || ""}`}>
      {title ? <h2 className="font-serif text-2xl">{title}</h2> : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
