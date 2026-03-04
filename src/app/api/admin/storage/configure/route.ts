import { NextResponse } from "next/server";
import { setupStorageInfrastructure } from "@/lib/aws/storage-admin";
import { getAuthSession } from "@/lib/auth/session";
import { upsertStorageConfiguration } from "@/lib/data/storage-config";

/**
 * Validates AWS storage inputs and persists non-secret configuration for super admins.
 */
export async function POST(request: Request) {
  const session = await getAuthSession();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!session || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user?.platformRole !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const accessKeyId = String(formData.get("accessKeyId") || "").trim();
  const secretAccessKey = String(formData.get("secretAccessKey") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const bucket = String(formData.get("bucket") || "").trim();
  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    return NextResponse.json({ error: "Missing required storage configuration fields." }, { status: 400 });
  }

  try {
    const result = await setupStorageInfrastructure({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken: String(formData.get("sessionToken") || "").trim() || undefined,
      },
      region,
      bucket,
      cloudFrontDistributionId: String(formData.get("cloudFrontDistributionId") || "").trim() || undefined,
      createBucketIfMissing: formData.get("createBucketIfMissing") === "on",
    });

    await upsertStorageConfiguration(email, {
      bucket,
      region,
      cloudFrontDistributionId: String(formData.get("cloudFrontDistributionId") || "").trim() || undefined,
      cloudFrontDomain:
        String(formData.get("cloudFrontDomain") || "").trim() || result.distributionDomain || undefined,
    });

    return NextResponse.json({ accountId: result.accountId }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
