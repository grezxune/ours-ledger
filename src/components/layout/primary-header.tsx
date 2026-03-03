"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { FolderPlus, House, LogIn, Menu, ScrollText, Shield, X } from "lucide-react";
import { PRODUCT_MOTTO, PRODUCT_NAME } from "@/lib/household-principles";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { Button } from "@/components/ui/button";
import { TabNav } from "@/components/ui/tab-nav";
import { UserAvatarMenu } from "@/components/layout/user-avatar-menu";

interface PrimaryHeaderProps {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  email?: string | null;
  image?: string | null;
  name?: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  match: "exact" | "prefix";
}

const actionButton =
  "inline-flex items-center gap-2 rounded-full border border-line/80 bg-background/70 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const primaryAction =
  "inline-flex items-center gap-2 rounded-full bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-foreground transition hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function isActiveRoute(pathname: string, href: string, match: NavItem["match"]): boolean {
  if (pathname === href) {
    return true;
  }
  if (match !== "prefix") {
    return false;
  }
  return pathname.startsWith(`${href}/`);
}

/**
 * Shared high-polish app header with desktop rail nav and mobile slide-over.
 */
export function PrimaryHeader({ isAuthenticated, isSuperAdmin, email, image, name }: PrimaryHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = useMemo<NavItem[]>(
    () => [
      { href: "/", label: isAuthenticated ? "Dashboard" : "Home", icon: House, match: "exact" },
      ...(isAuthenticated ? [{ href: "/audits", label: "Audits", icon: ScrollText, match: "prefix" as const }] : []),
    ],
    [isAuthenticated],
  );
  const desktopTabs = navItems.map((item) => ({
    href: item.href,
    label: item.label,
    icon: item.icon,
    ariaLabel: `Open ${item.label}`,
    isActive: isActiveRoute(pathname, item.href, item.match),
  }));

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="rounded-3xl border border-line/80 bg-surface/80 p-4 shadow-[0_20px_60px_-42px_color-mix(in_oklab,var(--foreground)_40%,transparent)] backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            aria-label={isAuthenticated ? "Open dashboard" : "Open home"}
            className="inline-flex items-center gap-3"
            href="/"
          >
            <Image
              alt="Our Ledger mark"
              className="h-auto w-10 shrink-0 sm:w-12"
              height={360}
              priority
              src="/branding/our-ledger-logo-no-words.png"
              width={333}
            />
            <span className="font-serif text-2xl leading-none sm:text-3xl">{PRODUCT_NAME}</span>
          </Link>
          <p className="mt-1 font-serif text-[0.72rem] italic tracking-[0.1em] text-foreground/70 sm:text-xs">
            {PRODUCT_MOTTO}
          </p>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <TabNav ariaLabel="Primary" items={desktopTabs} />

          {isAuthenticated ? (
            <>
              <Button asChild ariaLabel="Create a new entity" className={primaryAction}>
                <Link href="/entity/create">
                  <FolderPlus aria-hidden className="size-4" />
                  Create Entity
                </Link>
              </Button>
              {isSuperAdmin ? (
                <Button asChild ariaLabel="Open admin storage settings" className={actionButton} variant="secondary">
                  <Link href="/admin/storage">
                    <Shield aria-hidden className="size-4" />
                    Admin
                  </Link>
                </Button>
              ) : null}
              <UserAvatarMenu email={email} image={image} name={name} />
            </>
          ) : (
            <Button asChild ariaLabel="Open sign in page" className={primaryAction}>
              <Link href="/signin">
                <LogIn aria-hidden className="size-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>

        <Button
          aria-controls="mobile-site-nav"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-full border border-line/80 bg-background/70 text-foreground transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:hidden"
          iconOnly
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        </Button>
      </div>
      <MobileNavDrawer
        isAuthenticated={isAuthenticated}
        isSuperAdmin={isSuperAdmin}
        navItems={navItems}
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
