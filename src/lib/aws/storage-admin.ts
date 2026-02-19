import "server-only";
import {
  CloudFrontClient,
  GetDistributionCommand,
  type Distribution,
} from "@aws-sdk/client-cloudfront";
import {
  type BucketLocationConstraint,
  CreateBucketCommand,
  GetBucketEncryptionCommand,
  HeadBucketCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

interface AwsCredentialsInput {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

interface SetupInput {
  credentials: AwsCredentialsInput;
  region: string;
  bucket: string;
  cloudFrontDistributionId?: string;
  createBucketIfMissing: boolean;
}

export interface SetupResult {
  accountId: string;
  bucketReady: boolean;
  distributionDomain?: string;
}

function createS3Client(region: string, credentials: AwsCredentialsInput): S3Client {
  return new S3Client({ region, credentials });
}

function createCloudFrontClient(credentials: AwsCredentialsInput): CloudFrontClient {
  return new CloudFrontClient({ region: "us-east-1", credentials });
}

/**
 * Validates AWS credentials, configures S3 baseline security, and validates CloudFront distribution.
 */
export async function setupStorageInfrastructure(input: SetupInput): Promise<SetupResult> {
  const sts = new STSClient({ region: input.region, credentials: input.credentials });
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  if (!identity.Account) {
    throw new Error("Unable to validate AWS credentials.");
  }

  const s3 = createS3Client(input.region, input.credentials);
  let bucketExists = true;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: input.bucket }));
  } catch {
    bucketExists = false;
  }

  if (!bucketExists && !input.createBucketIfMissing) {
    throw new Error("Bucket does not exist and auto-create was not enabled.");
  }

  if (!bucketExists) {
    await s3.send(
      new CreateBucketCommand({
        Bucket: input.bucket,
        ...(input.region === "us-east-1"
          ? {}
          : {
              CreateBucketConfiguration: {
                LocationConstraint: input.region as BucketLocationConstraint,
              },
            }),
      }),
    );
  }

  await s3.send(
    new PutBucketEncryptionCommand({
      Bucket: input.bucket,
      ServerSideEncryptionConfiguration: {
        Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }],
      },
    }),
  );

  await s3.send(
    new PutBucketVersioningCommand({
      Bucket: input.bucket,
      VersioningConfiguration: { Status: "Enabled" },
    }),
  );

  await s3.send(new GetBucketEncryptionCommand({ Bucket: input.bucket }));

  let distribution: Distribution | undefined;
  if (input.cloudFrontDistributionId) {
    const cloudFront = createCloudFrontClient(input.credentials);
    const output = await cloudFront.send(
      new GetDistributionCommand({ Id: input.cloudFrontDistributionId }),
    );
    distribution = output.Distribution;
  }

  return {
    accountId: identity.Account,
    bucketReady: true,
    distributionDomain: distribution?.DomainName,
  };
}
