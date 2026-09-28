/**
 * Auth endpoints.
 *
 *  POST /api/auth/login    public   — exchange credentials for a JWT
 *  GET  /api/auth/me       admin    — who am I (used by the client on reload)
 *  POST /api/auth/logout   admin    — client-side token discard acknowledgement
 */
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import type { LoginInput } from '../middleware/validators.js';
import { currentAdmin } from '../middleware/auth.js';
import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

/** POST /api/auth/login */
export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body as LoginInput;
  const result = await authService.login(email, password, env.jwtExpiresIn);

  return sendSuccess(res, {
    token: result.token,
    admin: result.admin,
    expiresIn: result.expiresIn,
  });
}

/** GET /api/auth/me */
export async function me(req: Request, res: Response): Promise<Response> {
  const admin = currentAdmin(req);
  return sendSuccess(res, { id: admin.id, name: admin.name, email: admin.email });
}

/**
 * POST /api/auth/logout
 *
 * JWTs are stateless so there is no server-side session to destroy; the client
 * discards the token. The endpoint exists so the client has one consistent
 * "am I still allowed?" call, and so a future token-revocation list has an
 * obvious home.
 */
export async function logout(_req: Request, res: Response): Promise<Response> {
  return sendSuccess(res, { message: 'Signed out.' });
}
