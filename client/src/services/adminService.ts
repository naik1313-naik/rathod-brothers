/**
 * Admin-only API calls. Every request here is sent with the bearer token.
 */
import { apiFetch, toQueryString } from '@/lib/api';
import type {
  AdminUser,
  Enquiry,
  EnquiryListResult,
  EnquiryQuery,
  EnquiryStats,
  EnquiryStatus,
  LoginResult,
} from '@/types/api';

export function login(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function me(): Promise<AdminUser> {
  return apiFetch<AdminUser>('/api/auth/me', { auth: true });
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/api/auth/logout', { method: 'POST', auth: true });
}

export function fetchStats(): Promise<EnquiryStats> {
  return apiFetch<EnquiryStats>('/api/enquiries/stats', { auth: true });
}

export function fetchEnquiries(query: EnquiryQuery = {}, signal?: AbortSignal): Promise<EnquiryListResult> {
  return apiFetch<EnquiryListResult>(`/api/enquiries${toQueryString({ ...query })}`, {
    auth: true,
    signal,
  });
}

export function fetchEnquiry(id: number): Promise<Enquiry> {
  return apiFetch<Enquiry>(`/api/enquiries/${id}`, { auth: true });
}

export function updateEnquiry(
  id: number,
  changes: Partial<Pick<Enquiry, 'status' | 'name' | 'phone' | 'service' | 'pickup' | 'destination' | 'preferred_date' | 'message'>>,
): Promise<Enquiry> {
  return apiFetch<Enquiry>(`/api/enquiries/${id}`, { method: 'PATCH', body: changes, auth: true });
}

export function updateEnquiryStatus(id: number, status: EnquiryStatus): Promise<Enquiry> {
  return updateEnquiry(id, { status });
}

export function deleteEnquiry(id: number): Promise<{ id: number }> {
  return apiFetch<{ id: number }>(`/api/enquiries/${id}`, { method: 'DELETE', auth: true });
}
