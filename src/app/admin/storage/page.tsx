import { StorageAdminLive } from "@/components/admin/storage-admin-live";
import { requireSuperAdminSession } from "@/lib/auth/session";

/**
 * Super admin dashboard for S3 + CloudFront storage setup.
 */
export default async function StorageAdminPage() {
  const session = await requireSuperAdminSession();
  return <StorageAdminLive session={session} />;
}
