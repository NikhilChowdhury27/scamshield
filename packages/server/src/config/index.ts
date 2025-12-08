import { z } from 'zod';

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(4000),
  version: z.string().default('1.0.0'),
  geminiApiKey: z.string().min(1, 'GEMINI_API_KEY is required'),
  corsOrigins: z.string().transform((val) => val.split(',').map((s) => s.trim())),
  rateLimitWindowMs: z.coerce.number().default(60000),
  rateLimitMax: z.coerce.number().default(100),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

function loadConfig() {
  const result = configSchema.safeParse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    version: process.env.npm_package_version,
    geminiApiKey: process.env.GEMINI_API_KEY,
    corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: process.env.RATE_LIMIT_MAX,
    logLevel: process.env.LOG_LEVEL,
  });

  if (!result.success) {
    console.error('Configuration validation failed:');
    console.error(result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();

export type Config = z.infer<typeof configSchema>;
