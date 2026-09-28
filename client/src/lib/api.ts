/**
 * Thin fetch wrapper around the REST API.
 *
 * Responsibilities kept here so no component ever repeats them:
 *   - base URL resolution (dev proxy, split origins, single-origin production)
 *   - attaching the admin bearer token
 *   - normalising the { success, data | error } envelope into a value or ApiError
 *   - turning network failures into a user-friendly ApiError
 *   - request timeouts, so a hanging API cannot leave a form in "sending" forever
 */
import { ApiError } from '@/types/api';

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Empty in production when the API is same-origin (SERVE_CLIENT=true), which
 * makes requests relative. In dev the Vite proxy forwards /api to the server.
 */
const BASE_URL = (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, '') ?? '';

/** Exported so the auth guard can check for a stale token without duplicating the key. */
export const TOKEN_KEY = 'rb_admin_token';

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* Storage unavailable (private mode) — the session simply won't persist. */
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function hasToken(): boolean {
  return getToken() !== null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attach the admin bearer token. */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Compose the caller's signal with our own timeout.
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = (): void => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new ApiError(0, 'TIMEOUT', 'The request took too long. Please check your connection and try again.');
    }
    if (signal?.aborted) throw error;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach our server. Please check your internet connection, or call us directly.',
    );
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onExternalAbort);
  }

  // A 204 has no body to parse.
  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(response.status, 'BAD_RESPONSE', 'The server sent an unexpected response.');
  }

  const envelope = payload as
    | { success: true; data: T }
    | { success: false; error?: { code?: string; message?: string; fields?: Record<string, string> } };

  if (!response.ok || !envelope || envelope.success !== true) {
    const error = (envelope as { error?: { code?: string; message?: string; fields?: Record<string, string> } })?.error;
    throw new ApiError(
      response.status,
      error?.code ?? 'ERROR',
      error?.message ?? 'Something went wrong. Please try again.',
      error?.fields ?? {},
    );
  }

  return envelope.data;
}

/** Convenience wrapper that turns query objects into a search string. */
export function toQueryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
