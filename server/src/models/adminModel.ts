/**
 * Data access for the `admins` table. Password hashes are never selected into
 * any object that leaves the server except for the login comparison itself.
 */
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getPool } from '../db/pool.js';
import type { AdminUser } from '../types/domain.js';

interface AdminRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface AdminWithHash extends AdminUser {
  passwordHash: string;
}

export async function findAdminByEmail(email: string): Promise<AdminWithHash | null> {
  const [rows] = await getPool().execute<AdminRow[]>(
    'SELECT id, name, email, password_hash, created_at FROM admins WHERE email = ? LIMIT 1',
    [email],
  );

  const row = rows[0];
  if (!row) return null;

  return { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash };
}

export async function findAdminById(id: number): Promise<AdminUser | null> {
  const [rows] = await getPool().execute<AdminRow[]>(
    'SELECT id, name, email, created_at FROM admins WHERE id = ? LIMIT 1',
    [id],
  );

  const row = rows[0];
  if (!row) return null;

  return { id: row.id, name: row.name, email: row.email };
}

export async function createAdmin(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<AdminUser> {
  const [result] = await getPool().execute<ResultSetHeader>(
    'INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)',
    [input.name, input.email, input.passwordHash],
  );

  const created = await findAdminById(result.insertId);
  if (!created) throw new Error('Admin was inserted but could not be read back.');
  return created;
}

export async function adminEmailExists(email: string): Promise<boolean> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    'SELECT 1 AS found FROM admins WHERE email = ? LIMIT 1',
    [email],
  );
  return rows.length > 0;
}
