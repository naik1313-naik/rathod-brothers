/**
 * Client-side types mirroring the API's responses.
 */

export const ENQUIRY_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  service: string;
  pickup: string | null;
  destination: string | null;
  preferred_date: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface EnquiryStats {
  total: number;
  new: number;
  contacted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface EnquiryListResult {
  items: Enquiry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EnquiryQuery {
  page?: number;
  pageSize?: number;
  status?: EnquiryStatus | 'ALL';
  search?: string;
  sort?: 'newest' | 'oldest' | 'name' | 'status';
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginResult {
  token: string;
  admin: AdminUser;
  expiresIn: string;
}

/** Shape of the payload the quote form POSTs. */
export interface CreateEnquiryPayload {
  name: string;
  phone: string;
  service: string;
  pickup?: string;
  destination?: string;
  preferredDate?: string;
  message?: string;
}

/** Normalised error thrown by every apiFetch call. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /** True when the failure was a network problem rather than an HTTP response. */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}
