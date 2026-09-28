/**
 * Create (or update) the first admin account for /admin.
 *
 *   npm run db:seed
 *
 * Reads SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.
 * Re-running with an existing email updates that admin's name and password,
 * which is also the documented way to reset a forgotten admin password.
 *
 * No default password is committed anywhere in this repository.
 */
import { env } from '../config/env.js';
import { closePool, getPool } from '../db/pool.js';
import { createAdmin, findAdminByEmail } from '../models/adminModel.js';
import { hashPassword, isStrongEnough } from '../services/passwordService.js';
import { logger } from '../utils/logger.js';

const PLACEHOLDER_PASSWORDS = new Set([
  'changethisadminpassword123!',
  'password',
  'admin123',
  'change-me',
]);

async function seed(): Promise<void> {
  const { name, email, password } = env.seed;

  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD is not set. Add it to your .env (see .env.example) and run "npm run db:seed" again.',
    );
  }

  if (!isStrongEnough(password) || PLACEHOLDER_PASSWORDS.has(password.toLowerCase())) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be at least 12 characters, contain a letter and a number, ' +
        'and must not be the placeholder value from .env.example.',
    );
  }

  const existing = await findAdminByEmail(email);
  const passwordHash = await hashPassword(password);

  if (existing) {
    await getPool().execute('UPDATE admins SET name = ?, password_hash = ? WHERE id = ?', [
      name,
      passwordHash,
      existing.id,
    ]);
    logger.info(`Updated existing admin "${email}" (id ${existing.id}).`);
  } else {
    const admin = await createAdmin({ name, email, passwordHash });
    logger.info(`Created admin "${admin.email}" (id ${admin.id}).`);
  }

  logger.info('Admin ready. Sign in at /admin/login');
  await closePool();
}

const isDirectRun = process.argv[1]?.includes('seedAdmin');

if (isDirectRun) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
