/**
 * Password hashing.
 *
 * bcryptjs (pure JavaScript) is used so the project installs and builds without
 * a native toolchain. The cost comes from `BCRYPT_ROUNDS` (default 12) — strong
 * enough for an admin login while keeping the seed script and tests fast.
 */
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const SALT_ROUNDS = env.bcryptRounds;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Rough strength check for the seed script's password. */
export function isStrongEnough(plain: string): boolean {
  return plain.length >= 12 && /[a-z]/i.test(plain) && /\d/.test(plain);
}
