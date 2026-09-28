/**
 * Public write-endpoint rate limiting.
 *
 * A quote form on a public website is a spam magnet, so the public POST is
 * capped per IP. Admin endpoints get a separate, much tighter limiter because
 * they sit behind credentials and are the ones worth brute-forcing.
 */
import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { sendFailure } from '../utils/response.js';

function build(options: Partial<Options> & { limit: number; windowMs: number; message: string }) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: options.message,
    handler: (_req: Request, res: Response) => {
      sendFailure(res, 429, 'RATE_LIMITED', options.message);
    },
  });
}

/** Quote submissions: generous enough for a shared office IP, still bounded. */
export const enquirySubmitLimiter = build({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  message: 'Too many quote requests from this device. Please try again in a few minutes, or call us directly.',
});

/** Login attempts: strict, to slow credential stuffing. */
export const loginLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
});
