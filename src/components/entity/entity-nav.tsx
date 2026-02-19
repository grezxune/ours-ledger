"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Menu,
  ReceiptText,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { MembershipRole } from "@/lib/domain/types";
import { Tooltip } from "@/components/ui/tooltip";

interface EntityNavProps {
  entityId: string;
  role: MembershipRole;
}

interface NavLinkItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

function navButtonClass(isActive: boolean): string {
  return [
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
    isActive
      ? "border-accent bg-accent/10 text-foreground"
      : "border-line bg-surface/70 text-foreground/90 hover:bg-foreground/5",
  ].join(" ");
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }
  return href !== "/" && pathname.startsWith(`${href}/`);
}

/**
 * Entity-scoped navigation with desktop tabs and mobile slide-over menu.
 */
export function EntityNav({ entityId, role }: EntityNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = useMemo<NavLinkItem[]>(() => {
    const base: NavLinkItem[] = [
      { href: `/entity/${entityId}`, label: "Overview", icon: LayoutDashboard },
      { href: `/entity/${entityId}/budget`, label: "Budget", icon: Wallet },
      { href: `/entity/${entityId}/transactions`, label: "Transactions", icon: ReceiptText },
      { href: `/entity/${entityId}/members`, label: "Members", icon: Users },
      { href: `/entity/${entityId}/manage`, label: "Manage", icon: Settings },
    ];

    if (role === "owner") {
      base.push({ href: `/entity/${entityId}/update`, label: "Settings", icon: Settings });
    }

    return base;
  }, [entityId, role]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="hidden flex-wrap gap-2 sm:flex">
        {links.map((link) => (
          <Link
            aria-label={`Open ${link.label.toLowerCase()} section`}
            className={navButtonClass(isActiveRoute(pathname, link.href))}
            href={link.href}
            key={link.href}
          >
            <link.icon aria-hidden className="size-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="sm:hidden">
        <Tooltip content="Open entity section menu">
          <button
            aria-controls="entity-mobile-nav"
            aria-expanded={isMobileMenuOpen}
            aria-label="Open entity section menu"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            onClick={() => setIsMobileMenuOpen(true)}
            type="button"
          >
            <Menu aria-hidden className="size-4" />
            Entity Menu
          </button>
        </Tooltip>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            aria-label="Close entity navigation"
            className="absolute inset-0 bg-foreground/45"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
          />
          <aside
            className="absolute right-0 top-0 flex h-full w-[84%] max-w-xs flex-col gap-3 border-l border-line bg-surface p-4 shadow-xl"
            id="entity-mobile-nav"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.08em] text-foreground/80">Entity Sections</p>
              <Tooltip content="Close section menu">
                <button
                  aria-label="Close entity section menu"
                  className="inline-flex size-8 items-center justify-center rounded-md text-foreground/75 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                  type="button"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </Tooltip>
            </div>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  aria-label={`Open ${link.label.toLowerCase()} section`}
                  className={navButtonClass(isActiveRoute(pathname, link.href))}
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon aria-hidden className="size-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
