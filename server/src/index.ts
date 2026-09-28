/**
 * HTTP entrypoint.
 *
 * Boots in this order: load config -> verify the database -> listen -> wire
 * graceful shutdown. Refusing to start when MySQL is unreachable is deliberate;
 * a server that accepts quote requests it cannot store is worse than one that
 * clearly fails to start.
 */
import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool, pingDatabase } from './db/pool.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  const app = createApp();

  try {
    await pingDatabase();
    logger.info(
      `MySQL connected — ${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database}`,
    );
  } catch (error) {
    logger.error(
      `Could not connect to MySQL at ${env.db.host}:${env.db.port}/${env.db.database}. ` +
        'Check your .env values, then run "npm run db:migrate" to create the database and tables.',
      error,
    );
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`Rathod Brothers API listening on http://localhost:${env.port} [${env.nodeEnv}]`);
    logger.info(`Allowed client origins: ${env.clientOrigins.join(', ') || '(none)'}`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — shutting down gracefully.`);
    server.close(async () => {
      await closePool();
      logger.info('Shutdown complete.');
      process.exit(0);
    });
    // Do not hang forever on a stuck connection.
    setTimeout(() => {
      logger.warn('Forcing exit after shutdown timeout.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error('Fatal error during startup.', error);
  process.exit(1);
});
