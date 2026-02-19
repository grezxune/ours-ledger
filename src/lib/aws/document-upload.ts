import "server-only";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

interface UploadInput {
  bucket: string;
  region: string;
  key: string;
  file: File;
}

/**
 * Uploads a document to S3 using server-managed credentials.
 */
export async function uploadDocumentToS3(input: UploadInput): Promise<void> {
  const client = new S3Client({
    region: input.region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          }
        : undefined,
  });

  const body = Buffer.from(await input.file.arrayBuffer());
  await client.send(
    new PutObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
      Body: body,
      ContentType: input.file.type || "application/octet-stream",
      ServerSideEncryption: "AES256",
    }),
  );
}
