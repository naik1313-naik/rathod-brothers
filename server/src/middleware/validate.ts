/**
 * Runs a Zod schema against part of the request and replaces it with the
 * parsed result, so downstream handlers receive coerced, trimmed, trusted data
 * (and never the raw user input).
 *
 * On failure it throws ApiError(422) carrying per-field messages, which the
 * quote form maps straight back onto its inputs.
 */
import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type Source = 'body' | 'query' | 'params';

function flatten(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_';
    // Keep the first message per field — it is the most specific one.
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

export function validate(schema: ZodTypeAny, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(ApiError.validation('Please correct the highlighted fields.', flatten(result.error)));
      return;
    }

    // `req.query` and `req.params` are getter-only in Express 5 typings, so we
    // assign defensively rather than assuming they are writable.
    if (source === 'body') {
      req.body = result.data;
    } else {
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
