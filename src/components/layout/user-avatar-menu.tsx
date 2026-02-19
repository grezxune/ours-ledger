import Link from "next/link";
import { LogOut } from "lucide-react";

interface UserAvatarMenuProps {
  email?: string | null;
  image?: string | null;
  name?: string | null;
}

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "U").trim();
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

/**
 * Click-triggered avatar menu for account actions.
 */
export function UserAvatarMenu({ email, image, name }: UserAvatarMenuProps) {
  const initials = getInitials(name, email);

  return (
    <details className="group relative">
      <summary
        aria-label="Account menu"
        className="inline-flex list-none cursor-pointer items-center rounded-full p-0 transition focus:outline-none focus:ring-2 focus:ring-accent [&::-webkit-details-marker]:hidden [&::marker]:hidden"
        title="Open account menu"
      >
        <span
          className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-accent/15 text-xs font-semibold text-accent-strong"
          style={
            image
              ? {
                  backgroundImage: `url(${image})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  color: "transparent",
                }
              : undefined
          }
        >
          {initials}
        </span>
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-lg">
        <div className="rounded-lg px-2 py-2 text-xs text-foreground/70">
          <p className="font-medium text-foreground">Signed in</p>
          <p className="truncate">{email || "Unknown account"}</p>
        </div>
        <Link
          aria-label="Sign out"
          className="mt-1 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-surface-muted/50"
          href="/api/auth/signout?callbackUrl=/"
        >
          <LogOut aria-hidden className="size-4" />
          Sign Out
        </Link>
      </div>
    </details>
  );
}
