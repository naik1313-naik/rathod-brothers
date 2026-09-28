/**
 * Enquiry business logic.
 *
 * Controllers stay thin; the rules about what a valid enquiry is and how it is
 * stored live here.
 */
import { ApiError } from '../utils/ApiError.js';
import { getPool } from '../db/pool.js';
import {
  deleteEnquiry,
  findEnquiryById,
  getEnquiryStats,
  insertEnquiry,
  listEnquiries,
  type CreateEnquiryRecord,
  type ListResult,
} from '../models/enquiryModel.js';
import type {
  CreateEnquiryInput,
  EnquiryQueryInput,
  UpdateEnquiryInput,
} from '../middleware/validators.js';
import type { Enquiry, EnquiryStats } from '../types/domain.js';

/** Empty strings become NULL so the admin table and filters stay clean. */
const orNull = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
  const record: CreateEnquiryRecord = {
    name: input.name,
    phone: input.phone,
    service: input.service,
    pickup: orNull(input.pickup),
    destination: orNull(input.destination),
    preferred_date: input.preferredDate ?? null,
    message: orNull(input.message),
  };

  return insertEnquiry(record);
}

export async function getEnquiry(id: number): Promise<Enquiry> {
  const enquiry = await findEnquiryById(id);
  if (!enquiry) throw ApiError.notFound(`No enquiry found with id ${id}.`);
  return enquiry;
}

export function getEnquiries(query: EnquiryQueryInput): Promise<ListResult> {
  return listEnquiries(query);
}

export async function getStats(): Promise<EnquiryStats> {
  return getEnquiryStats();
}

export async function removeEnquiry(id: number): Promise<{ id: number }> {
  const deleted = await deleteEnquiry(id);
  if (!deleted) throw ApiError.notFound(`No enquiry found with id ${id}.`);
  return { id };
}

/**
 * Applies a partial update. Built as a fixed column->value mapping so the
 * column names can never come from the request body.
 */
export async function updateEnquiry(id: number, input: UpdateEnquiryInput): Promise<Enquiry> {
  const existing = await findEnquiryById(id);
  if (!existing) throw ApiError.notFound(`No enquiry found with id ${id}.`);

  const assignments: string[] = [];
  const params: Array<string | number | null> = [];

  const set = (column: string, value: string | number | null): void => {
    assignments.push(`${column} = ?`);
    params.push(value);
  };

  if (input.status !== undefined) set('status', input.status);
  if (input.name !== undefined) set('name', input.name);
  if (input.phone !== undefined) set('phone', input.phone);
  if (input.service !== undefined) set('service', input.service);
  if (input.pickup !== undefined) set('pickup', orNull(input.pickup));
  if (input.destination !== undefined) set('destination', orNull(input.destination));
  if (input.preferredDate !== undefined) set('preferred_date', orNull(input.preferredDate));
  if (input.message !== undefined) set('message', orNull(input.message));

  if (assignments.length === 0) {
    throw ApiError.badRequest('Provide at least one field to update.');
  }

  // Column names come only from the fixed `set()` calls above, never from the
  // request body — the values are all bound parameters.
  await getPool().execute(`UPDATE enquiries SET ${assignments.join(', ')} WHERE id = ?`, [
    ...params,
    id,
  ]);

  const updated = await findEnquiryById(id);
  if (!updated) throw ApiError.internal('The enquiry was updated but could not be read back.');
  return updated;
}
