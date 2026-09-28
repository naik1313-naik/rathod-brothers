/**
 * Idempotent database migration.
 *
 * Creates the database if absent and applies `database/schema.sql`. Safe to run
 * repeatedly — every statement in the schema is IF NOT EXISTS.
 *
 *   npm run db:migrate
 */
import fs from 'node:fs';
import path from 'node:path';
import { env, REPO_ROOT } from '../config/env.js';
import { getPool, getServerConnection, closePool } from '../db/pool.js';
import { logger } from '../utils/logger.js';

const SCHEMA_PATH = path.join(REPO_ROOT, 'database', 'schema.sql');

async function ensureDatabaseExists(): Promise<void> {
  const connection = await getServerConnection();
  try {
    // Identifier cannot be a bound parameter, so the name is escaped for
    // backticks instead — it comes from our own config, not from user input.
    const safeName = `\`${env.db.database.replace(/`/g, '')}\``;
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${safeName} ` +
        'DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci',
    );
    await connection.query(`USE ${safeName}`);
    logger.info(`Database "${env.db.database}" is ready.`);
  } finally {
    await connection.end();
  }
}

async function applySchema(): Promise<void> {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }

  const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const pool = getPool();

  // The schema contains CREATE TABLE / CREATE DATABASE statements separated by
  // semicolons. Split on those, dropping comments and blank fragments.
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) =>
      statement
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await pool.query(statement);
  }

  logger.info(`Applied ${statements.length} schema statement(s) from database/schema.sql.`);
}

export async function migrate(): Promise<void> {
  await ensureDatabaseExists();
  await applySchema();
  await closePool();
}

const isDirectRun = process.argv[1]?.includes('migrate');

if (isDirectRun) {
  migrate()
    .then(() => {
      logger.info('Migration complete.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed.', error);
      process.exit(1);
    });
}
