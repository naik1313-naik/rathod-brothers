/**
 * Response helpers that guarantee a single, consistent JSON envelope:
 *   success -> { success: true,  data: ... }
 *   failure -> { success: false, error: { code, message, fields? } }
 */
import type { Response } from 'express';
import type { ApiFailure, ApiSuccess } from '../types/domain.js';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendFailure(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): Response {
  const error: ApiFailure['error'] = { code, message };
  if (fields && Object.keys(fields).length > 0) error.fields = fields;
  const body: ApiFailure = { success: false, error };
  return res.status(statusCode).json(body);
}
