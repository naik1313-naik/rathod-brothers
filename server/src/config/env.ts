/**
 * Centralised, validated environment configuration.
 *
 * The whole process reads configuration from here — nothing else touches
 * `process.env`. Validation happens once at import time so a misconfigured
 * deployment fails loudly on boot instead of at the first request.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const here = path.dirname(fileURLToPath(import.meta.url));
/** server/ — repo root is one level up from this file's dist/src location. */
export const SERVER_ROOT = path.resolve(here, '..', '..');
export const REPO_ROOT = path.resolve(SERVER_ROOT, '..');

// server/.env takes precedence, then a repo-root .env for convenience.
dotenv.config({ path: path.join(SERVER_ROOT, '.env') });
dotenv.config({ path: path.join(REPO_ROOT, '.env') });

/** Values that must never reach production. */
const INSECURE_SECRETS = new Set([
  '',
  'change-me-to-a-long-random-string',
  'change-me',
  'secret',
  'your-secret',
]);

const booleanish = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1' || v === 'yes');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  DATABASE_URL: z.string().optional().default(''),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().default('rathod_brothers'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),

  JWT_SECRET: z.string().default('change-me-to-a-long-random-string'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  /**
   * bcrypt cost. Bounded because bcryptjs is pure JS: much above 14 makes the
   * seed script and test suite painfully slow for no real security gain.
   */
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  SEED_ADMIN_NAME: z.string().default('Rathod Brothers Admin'),
  SEED_ADMIN_EMAIL: z.string().default('admin@rathodbrothers.com'),
  SEED_ADMIN_PASSWORD: z.string().default(''),

  TRUST_PROXY: booleanish,
  SERVE_CLIENT: booleanish,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const raw = parsed.data;

if (raw.NODE_ENV === 'production' && INSECURE_SECRETS.has(raw.JWT_SECRET)) {
  throw new Error(
    'JWT_SECRET must be set to a strong, unique value in production. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
  );
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionLimit: number;
}

/**
 * Resolve database settings, preferring an explicit DATABASE_URL when present.
 * A URL lets you point at a managed instance without changing any code.
 */
function resolveDatabase(): DatabaseConfig {
  if (raw.DATABASE_URL) {
    let url: URL;
    try {
      url = new URL(raw.DATABASE_URL);
    } catch {
      throw new Error('DATABASE_URL is set but is not a valid URL.');
    }
    if (url.protocol !== 'mysql:') {
      throw new Error(`DATABASE_URL must use the mysql: protocol, got "${url.protocol}".`);
    }
    return {
      host: url.hostname || '127.0.0.1',
      port: url.port ? Number(url.port) : 3306,
      database: decodeURIComponent(url.pathname.replace(/^\//, '')) || raw.DB_NAME,
      user: decodeURIComponent(url.username) || raw.DB_USER,
      password: decodeURIComponent(url.password),
      connectionLimit: raw.DB_CONNECTION_LIMIT,
    };
  }
  return {
    host: raw.DB_HOST,
    port: raw.DB_PORT,
    database: raw.DB_NAME,
    user: raw.DB_USER,
    password: raw.DB_PASSWORD,
    connectionLimit: raw.DB_CONNECTION_LIMIT,
  };
}

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  port: raw.PORT,
  db: resolveDatabase(),
  jwtSecret: raw.JWT_SECRET,
  jwtExpiresIn: raw.JWT_EXPIRES_IN,
  bcryptRounds: raw.BCRYPT_ROUNDS,
  /** Origins allowed by CORS. */
  clientOrigins: raw.CLIENT_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  trustProxy: raw.TRUST_PROXY === true,
  /** Serve the built React app from this process (single-origin production). */
  serveClient: raw.SERVE_CLIENT === true,
  seed: {
    name: raw.SEED_ADMIN_NAME,
    email: raw.SEED_ADMIN_EMAIL,
    password: raw.SEED_ADMIN_PASSWORD,
  },
} as const;

export type Env = typeof env;
