/**
 * Admin authentication guard.
 *
 * Expects `Authorization: Bearer <jwt>`. On success it attaches the decoded
 * admin to `req.admin` so controllers never re-parse the token.
 */
import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyAdminToken } from '../services/jwtService.js';
import type { AuthenticatedAdmin } from '../types/domain.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(ApiError.unauthorized('Sign in to access the admin dashboard.'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    next(ApiError.unauthorized('Sign in to access the admin dashboard.'));
    return;
  }

  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Narrowing helper so controllers can use `req.admin` without a non-null
 * assertion — safe because `requireAuth` runs first on every admin route.
 */
export function currentAdmin(req: Request): AuthenticatedAdmin {
  if (!req.admin) throw ApiError.unauthorized('Sign in to access the admin dashboard.');
  return req.admin;
}
