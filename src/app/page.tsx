import { AppShell } from "@/components/layout/app-shell";
import { HomeDashboardLive } from "@/components/home/home-dashboard-live";
import { MarketingLanding } from "@/components/marketing/marketing-landing";
import { getAuthSession } from "@/lib/auth/session";

/**
 * Authenticated workspace home with entity index and pending invites.
 */
export default async function Home() {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return (
      <AppShell session={session}>
        <MarketingLanding />
      </AppShell>
    );
  }

  return <HomeDashboardLive session={session} />;
}
