/**
 * Public (unauthenticated) API calls — used by the website quote form.
 */
import { apiFetch } from '@/lib/api';
import type { CreateEnquiryPayload, Enquiry } from '@/types/api';

export function submitEnquiry(payload: CreateEnquiryPayload): Promise<Enquiry> {
  return apiFetch<Enquiry>('/api/enquiries', { method: 'POST', body: payload });
}
