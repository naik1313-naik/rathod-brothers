/**
 * Domain types shared by the API layer, mirroring the MySQL schema exactly.
 * Keeping these in one place stops the controller/model/service triple from
 * drifting apart.
 */

export const ENQUIRY_STATUSES = [
  'NEW',
  'CONTACTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** The services offered, mirrored by the website's quote form dropdown. */
export const SERVICES = [
  'Tipper Transport',
  'Excavator Sale & Service',
  'JCB Earthmoving',
  'Site Clearance',
  'Other',
] as const;

export type ServiceName = (typeof SERVICES)[number];

/** A row from the `enquiries` table, as returned to API clients. */
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

/** Aggregated counts for the admin dashboard. Always real numbers from MySQL. */
export interface EnquiryStats {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
  contacted: number;
  cancelled: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthenticatedAdmin extends AdminUser {
  iat?: number;
  exp?: number;
}

/** Uniform success envelope. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Uniform error envelope — never leaks stack traces to clients. */
export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    /** Field-level validation messages, keyed by field name. */
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Query parameters accepted by `GET /api/enquiries` (admin only). */
export interface EnquiryQuery {
  page?: number;
  pageSize?: number;
  status?: EnquiryStatus | 'ALL';
  search?: string;
  sort?: 'newest' | 'oldest' | 'name' | 'status';
}
