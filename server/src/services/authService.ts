/**
 * Authentication business logic.
 *
 * Note the uniform failure: a wrong email and a wrong password both produce the
 * same message and take a comparable amount of time, so the endpoint cannot be
 * used to discover which admin accounts exist.
 */
import { ApiError } from '../utils/ApiError.js';
import { findAdminByEmail } from '../models/adminModel.js';
import { signAdminToken } from './jwtService.js';
import { verifyPassword } from './passwordService.js';
import type { AdminUser } from '../types/domain.js';

const INVALID_CREDENTIALS = 'Incorrect email or password.';

export interface LoginResult {
  token: string;
  admin: AdminUser;
  expiresIn: string;
}

export async function login(email: string, password: string, expiresIn: string): Promise<LoginResult> {
  const record = await findAdminByEmail(email);

  if (!record) {
    // Spend comparable time on a miss so response timing does not leak whether
    // the account exists.
    await verifyPassword(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  const ok = await verifyPassword(password, record.passwordHash);
  if (!ok) throw ApiError.unauthorized(INVALID_CREDENTIALS);

  const admin: AdminUser = { id: record.id, name: record.name, email: record.email };

  return { token: signAdminToken(admin), admin, expiresIn };
}
