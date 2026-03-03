"use client";

import Link from "next/link";
import { type ComponentType } from "react";
import { createPortal } from "react-dom";
import { FolderPlus, LogIn, LogOut, Shield, X } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/household-principles";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

interface MobileNavDrawerProps {
  open: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  navItems: NavItem[];
  onClose: () => void;
}

const mobileNavLink =
  "inline-flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-surface-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const primaryAction =
  "inline-flex items-center gap-2 rounded-full bg-action-primary px-4 py-2 text-sm font-semibold text-action-primary-foreground transition hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Right-side mobile nav drawer rendered through a portal.
 */
export function MobileNavDrawer({ open, isAuthenticated, isSuperAdmin, navItems, onClose }: MobileNavDrawerProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <Button
        aria-label="Close menu overlay"
        className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-[2px] xl:hidden"
        type="button"
        unstyled
        onClick={onClose}
      />
      <aside
        aria-label="Mobile navigation"
        className="fixed inset-y-0 right-0 z-50 h-[100dvh] w-[min(88vw,22rem)] overflow-y-auto border-l border-line/80 bg-surface p-5 shadow-2xl xl:hidden"
        id="mobile-site-nav"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="font-serif text-xl">{PRODUCT_NAME}</span>
            <Button
              aria-label="Close mobile menu"
              className="inline-flex size-9 items-center justify-center rounded-full text-foreground/75 transition hover:bg-surface-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              iconOnly
              type="button"
              onClick={onClose}
            >
              <X aria-hidden className="size-5" />
            </Button>
          </div>

          <nav className="mt-5 grid gap-1" onClick={onClose}>
            {navItems.map((item) => (
              <Button asChild className={mobileNavLink} key={item.href} variant="secondary">
                <Link href={item.href}>
                  <item.icon aria-hidden className="size-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
            {isAuthenticated ? (
              <Button asChild className={mobileNavLink} variant="secondary">
                <Link href="/entity/create">
                  <FolderPlus aria-hidden className="size-4" />
                  Create Entity
                </Link>
              </Button>
            ) : null}
            {isSuperAdmin ? (
              <Button asChild className={mobileNavLink} variant="secondary">
                <Link href="/admin/storage">
                  <Shield aria-hidden className="size-4" />
                  Admin Storage
                </Link>
              </Button>
            ) : null}
          </nav>

          <div className="mt-auto border-t border-line/80 pt-4">
            {isAuthenticated ? (
              <Button asChild className={mobileNavLink} variant="secondary">
                <Link href="/api/auth/signout?callbackUrl=/">
                  <LogOut aria-hidden className="size-4" />
                  Sign Out
                </Link>
              </Button>
            ) : (
              <Button asChild className={primaryAction}>
                <Link href="/signin">
                  <LogIn aria-hidden className="size-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
