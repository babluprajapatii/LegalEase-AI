import { z } from 'zod';

// Phase 1: Only PORT, NODE_ENV, FRONTEND_URL, and JWT_SECRET are required.
// Phase 2+ keys (Firebase, Gemini) are optional here so the server can start
// in Phase 1 without a full Google Cloud / Firebase project configured.
const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(1).default('dev-secret-change-in-production'),

  // Phase 2+ — optional until Cloud/Firebase integration is wired up
  GEMINI_API_KEY: z.string().optional(),
  FIREBASE_ADMIN_SDK_PRIVATE_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  if (result.data.JWT_SECRET === 'dev-secret-change-in-production') {
    console.warn(
      '⚠️  JWT_SECRET is using the insecure default. Set JWT_SECRET in .env for any real usage.',
    );
  }
  return result.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
