import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { FolderPlus, House, LogIn, ScrollText, Shield } from "lucide-react";
import { PRODUCT_MOTTO, PRODUCT_NAME } from "@/lib/household-principles";
import { UserAvatarMenu } from "@/components/layout/user-avatar-menu";

interface AppShellProps {
  session: Session | null;
  children: ReactNode;
}

/**
 * App shell with responsive navigation and role-aware links.
 */
export function AppShell({ session, children }: AppShellProps) {
  const isAuthenticated = Boolean(session?.user?.email);
  const isSuperAdmin = session?.user?.platformRole === "super_admin";
  const navLinkClass = "inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2";

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-line/80 bg-surface/90 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                aria-label={isAuthenticated ? "Open dashboard" : "Open home"}
                className="inline-flex items-center gap-3"
                href="/"
              >
                <Image
                  alt="Ours Ledger mark"
                  className="h-auto w-10 shrink-0 sm:w-12"
                  height={360}
                  priority
                  src="/branding/ours-ledger-logo-no-words.png"
                  width={333}
                />
                <span className="font-serif text-2xl leading-none sm:text-3xl">{PRODUCT_NAME}</span>
              </Link>
              <p className="mt-1 font-serif text-xs text-foreground/80 sm:text-sm">{PRODUCT_MOTTO}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link aria-label={isAuthenticated ? "Open dashboard" : "Open home"} className={navLinkClass} href="/">
                <House aria-hidden className="size-4" />
                {isAuthenticated ? "Dashboard" : "Home"}
              </Link>
              {isAuthenticated ? (
                <Link aria-label="Create a new entity" className={navLinkClass} href="/entity/create">
                  <FolderPlus aria-hidden className="size-4" />
                  Create Entity
                </Link>
              ) : null}
              {isAuthenticated ? (
                <Link aria-label="Open audits page" className={navLinkClass} href="/audits">
                  <ScrollText aria-hidden className="size-4" />
                  Audits
                </Link>
              ) : null}
              {isAuthenticated && isSuperAdmin ? (
                <Link aria-label="Open admin storage settings" className={navLinkClass} href="/admin/storage">
                  <Shield aria-hidden className="size-4" />
                  Admin Storage
                </Link>
              ) : null}
              {isAuthenticated ? (
                <UserAvatarMenu
                  email={session?.user?.email}
                  image={session?.user?.image}
                  name={session?.user?.name}
                />
              ) : (
                <Link aria-label="Open sign in page" className={navLinkClass} href="/signin">
                  <LogIn aria-hidden className="size-4" />
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
