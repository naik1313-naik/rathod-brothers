/**
 * Vitest bootstrap.
 *
 * Loads the repository `.env` so the tests can reach the same MySQL instance
 * and use the same seeded admin credentials as a local run, then forces
 * NODE_ENV=test so the app skips request logging.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');

loadEnv({ path: path.join(repoRoot, '.env') });
process.env.NODE_ENV = 'test';

// Expose the seeded admin to the integration suite without hard-coding secrets.
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL;
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD;
