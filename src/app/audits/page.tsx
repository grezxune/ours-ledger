import { AuditsLive } from "@/components/audits/audits-live";
import { requireAuthSession } from "@/lib/auth/session";

/**
 * Full audit index for the authenticated user scope.
 */
export default async function AuditsPage() {
  const session = await requireAuthSession();
  return <AuditsLive session={session} />;
}
