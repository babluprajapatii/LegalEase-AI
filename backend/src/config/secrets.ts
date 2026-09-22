import { logger } from '../utils/logging';

/**
 * Secret Manager Helper
 * Safely fetches secrets from GCP Secret Manager in production environment,
 * or falls back cleanly to process.env variables in local development.
 */
export async function getSecret(secretName: string, fallbackEnvVar?: string): Promise<string> {
  const envVal = fallbackEnvVar ? process.env[fallbackEnvVar] : process.env[secretName];

  if (process.env.NODE_ENV !== 'production' || process.env.USE_LOCAL_SECRETS === 'true') {
    return envVal || '';
  }

  try {
    // Dynamic require to keep secret manager SDK optional in local dev
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const secretManager = require('@google-cloud/secret-manager');
    const client = new secretManager.SecretManagerServiceClient();

    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      logger.warn('GCP_PROJECT_ID not set, using env fallback for secret', { secretName });
      return envVal || '';
    }

    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });

    const payload = version.payload?.data?.toString();
    if (payload) {
      return payload;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(
      `Failed to retrieve secret ${secretName} from Secret Manager, falling back to env`,
      {
        error: msg,
      },
    );
  }

  return envVal || '';
}
