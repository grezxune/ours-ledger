import Link from "next/link";
import type { ComponentType, Ref } from "react";

type TabLayout = "bar" | "list";

interface TabLinkItem {
  href: string;
  label: string;
  ariaLabel?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  isActive?: boolean;
  onClick?: () => void;
}

interface TabNavProps {
  items: TabLinkItem[];
  ariaLabel: string;
  layout?: TabLayout;
  className?: string;
  navRef?: Ref<HTMLElement>;
}

function navClass(layout: TabLayout, className?: string): string {
  return [
    layout === "bar"
      ? "inline-flex items-center gap-1 rounded-full border border-line/80 bg-background/70 p-1"
      : "flex flex-col gap-2",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");
}

function tabClass(layout: TabLayout, isActive: boolean): string {
  const base =
    "inline-flex items-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  if (layout === "bar") {
    return [
      base,
      "rounded-full px-3 py-2 font-medium",
      isActive
        ? "bg-surface text-foreground shadow-[0_10px_24px_-18px_color-mix(in_oklab,var(--foreground)_55%,transparent)]"
        : "text-foreground/75 hover:bg-surface/70 hover:text-foreground",
    ].join(" ");
  }

  return [
    base,
    "rounded-xl border px-3 py-2",
    isActive
      ? "border-accent/70 bg-accent/15 text-foreground"
      : "border-line/70 bg-surface/70 text-foreground/85 hover:border-line hover:bg-foreground/5 hover:text-foreground",
  ].join(" ");
}

/**
 * Shared tab navigation for horizontal tab bars and stacked tab lists.
 */
export function TabNav({ items, ariaLabel, layout = "bar", className, navRef }: TabNavProps) {
  return (
    <nav aria-label={ariaLabel} className={navClass(layout, className)} ref={navRef}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            aria-current={item.isActive ? "page" : undefined}
            aria-label={item.ariaLabel}
            className={tabClass(layout, Boolean(item.isActive))}
            href={item.href}
            key={item.href}
            onClick={item.onClick}
          >
            {Icon ? <Icon aria-hidden className="size-4" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
