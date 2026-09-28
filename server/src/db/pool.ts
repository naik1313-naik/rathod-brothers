/**
 * MySQL connection pool.
 *
 * Every query in this codebase goes through `execute()` (not `query()`), which
 * sends parameters separately to the server. That is what makes the app immune
 * to SQL injection — no user input is ever concatenated into SQL text.
 */
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
    password: env.db.password,
    waitForConnections: true,
    connectionLimit: env.db.connectionLimit,
    queueLimit: 0,
    charset: 'utf8mb4_unicode_ci',
    // Return DATE columns as 'YYYY-MM-DD' strings rather than JS Dates, which
    // avoids timezone shifting a requested date onto the wrong day.
    dateStrings: ['DATE'],
    timezone: 'Z',
    supportBigNumbers: true,
  });

  return pool;
}

/** Verify the database is reachable. Used by /api/health and on boot. */
export async function pingDatabase(): Promise<void> {
  const connection = await getPool().getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

/**
 * A pool that is not bound to a database name — required to run
 * `CREATE DATABASE` during migration.
 */
export async function getServerConnection(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  });
}

export async function closePool(): Promise<void> {
  if (!pool) return;
  await pool.end();
  pool = null;
  logger.info('MySQL connection pool closed.');
}
