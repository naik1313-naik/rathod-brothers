/**
 * Minimal structured logger.
 *
 * Deliberately dependency-free. In production only warn/error are emitted, and
 * every line is prefixed so log aggregation stays readable.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const isProduction = process.env['NODE_ENV'] === 'production';

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = isProduction ? ORDER.info : ORDER.debug;

function emit(level: Level, message: string, meta?: unknown): void {
  if (ORDER[level] < threshold) return;

  const stamp = new Date().toISOString();
  const tag = level.toUpperCase().padEnd(5);
  const line = `${stamp} [${tag}] ${message}`;

  if (meta === undefined) {
    console.log(line);
    return;
  }
  if (level === 'error') {
    console.error(line, meta);
    return;
  }
  console.log(line, typeof meta === 'string' ? meta : JSON.stringify(meta));
}

export const logger = {
  debug: (message: string, meta?: unknown) => emit('debug', message, meta),
  info: (message: string, meta?: unknown) => emit('info', message, meta),
  warn: (message: string, meta?: unknown) => emit('warn', message, meta),
  error: (message: string, meta?: unknown) => emit('error', message, meta),
};
