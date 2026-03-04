import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { uploadDocument } from "@/lib/data/documents";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Uploads an entity document and stores metadata for the authenticated member.
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await getAuthSession();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: entityId } = await context.params;
  const formData = await request.formData();
  const sourceTransactionId = String(formData.get("sourceTransactionId") || "").trim() || undefined;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "A valid document file is required." }, { status: 400 });
  }

  try {
    const document = await uploadDocument(email, entityId, { file, sourceTransactionId });
    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload document.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
