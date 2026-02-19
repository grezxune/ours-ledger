import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth/session";
import { SignInForm } from "@/app/signin/signin-form";

/**
 * Sign-in route backed by Auth.js providers.
 */
export default async function SignInPage() {
  const session = await getAuthSession();
  if (session?.user?.email) {
    redirect("/");
  }

  return (
    <AppShell session={session}>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="reveal-up" title="Finance Operations, One Trusted Workspace">
          <p className="max-w-xl text-sm leading-relaxed text-foreground/80">
            Ours Ledger is designed for modern teams managing shared household and business money. Access is
            secure, workflows are clear, and every financial move stays auditable and organized.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/70">Visibility</p>
              <p className="mt-1 text-sm font-medium">Shared financial clarity</p>
            </div>
            <div className="rounded-xl border border-line bg-surface px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/70">Control</p>
              <p className="mt-1 text-sm font-medium">Governed collaboration</p>
            </div>
            <div className="rounded-xl border border-line bg-surface px-3 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/70">Auditability</p>
              <p className="mt-1 text-sm font-medium">Traceable operations</p>
            </div>
          </div>
        </Card>

        <Card className="reveal-up reveal-delay-1" title="Welcome Back">
          <p className="text-sm text-foreground/80">
            Sign in with Google for standard access, or use developer credentials for local testing.
          </p>
          <div className="mt-5">
            <SignInForm />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
