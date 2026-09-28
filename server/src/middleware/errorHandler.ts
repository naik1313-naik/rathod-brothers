/**
 * Terminal error handling.
 *
 * Contract:
 *   - ApiError  -> its own status/code/message (safe to show the user)
 *   - anything else -> logged with full detail, answered with a generic 500
 *
 * Stack traces and SQL messages never reach the client.
 */
import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { sendFailure } from '../utils/response.js';
import { env } from '../config/env.js';

interface BodyParserError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  // 1. Deliberate, user-safe failures.
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} -> ${error.code}`, error.internal ?? error.message);
    } else {
      logger.debug(`${req.method} ${req.originalUrl} -> ${error.statusCode} ${error.code}`);
    }
    sendFailure(res, error.statusCode, error.code, error.message, error.fields);
    return;
  }

  // 2. Malformed JSON from body-parser.
  const candidate = error as BodyParserError;
  if (candidate?.type === 'entity.parse.failed' || candidate instanceof SyntaxError) {
    sendFailure(res, 400, 'BAD_REQUEST', 'The request body is not valid JSON.');
    return;
  }

  // 3. Payload too large.
  if (candidate?.type === 'entity.too.large') {
    sendFailure(res, 413, 'PAYLOAD_TOO_LARGE', 'That request was too large.');
    return;
  }

  // 4. Unexpected: log everything, tell the client nothing specific.
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, error);

  const message = env.isProduction
    ? 'Something went wrong on our end. Please try again.'
    : `Unhandled error: ${error instanceof Error ? error.message : String(error)}`;

  sendFailure(res, 500, 'INTERNAL_ERROR', message);
}
