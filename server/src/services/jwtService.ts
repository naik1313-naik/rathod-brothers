/**
 * JWT issuing + verification.
 *
 * The signed payload deliberately contains nothing sensitive — just the admin's
 * id, name and email — so a leaked token reveals no password material and can
 * be correlated with the `admins` row for revocation decisions.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import type { AdminUser, AuthenticatedAdmin } from '../types/domain.js';

interface TokenPayload {
  sub: number;
  name: string;
  email: string;
}

export function signAdminToken(admin: AdminUser): string {
  const payload: TokenPayload = { sub: admin.id, name: admin.name, email: admin.email };
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    issuer: 'rathod-brothers-api',
    audience: 'rathod-brothers-admin',
  });
}

export function verifyAdminToken(token: string): AuthenticatedAdmin {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      issuer: 'rathod-brothers-api',
      audience: 'rathod-brothers-admin',
    });

    if (typeof decoded === 'string' || !decoded.sub) {
      throw ApiError.unauthorized('Your session is not valid. Please sign in again.');
    }

    const payload = decoded as jwt.JwtPayload & TokenPayload;
    return {
      id: Number(payload.sub),
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }
    throw ApiError.unauthorized('Your session is not valid. Please sign in again.');
  }
}
