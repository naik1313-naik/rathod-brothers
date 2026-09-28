/**
 * Drop and recreate the database. DESTRUCTIVE — for local development only.
 *
 *   npm run db:reset
 *
 * Requires an explicit confirmation flag so it cannot run by accident:
 *   npm run db:reset -- --force
 */
import { env } from '../config/env.js';
import { closePool, getServerConnection } from '../db/pool.js';
import { logger } from '../utils/logger.js';
import { migrate } from './migrate.js';

const isLocal =
  ['127.0.0.1', 'localhost', '::1'].includes(env.db.host) || env.db.host === 'db';

async function reset(): Promise<void> {
  if (!process.argv.includes('--force')) {
    throw new Error(
      'Refusing to reset without --force. This permanently deletes all enquiries. ' +
        'Run: npm run db:reset -- --force',
    );
  }

  if (!isLocal) {
    throw new Error(
      `Refusing to reset a non-local database (host "${env.db.host}"). ` +
        'Reset is only permitted against localhost.',
    );
  }

  const connection = await getServerConnection();
  try {
    const safeName = `\`${env.db.database.replace(/`/g, '')}\``;
    await connection.query(`DROP DATABASE IF EXISTS ${safeName}`);
    logger.warn(`Dropped database "${env.db.database}".`);
  } finally {
    await connection.end();
  }

  await migrate();
  await closePool();
  logger.info('Reset complete. Run "npm run db:seed" to recreate the admin account.');
}

const isDirectRun = process.argv[1]?.includes('reset');

if (isDirectRun) {
  reset()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
