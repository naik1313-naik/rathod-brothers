/**
 * Zod validation schemas. These are the single source of truth for what the API
 * accepts; anything that fails validation never reaches a controller or MySQL.
 */
import { z } from 'zod';
import { ENQUIRY_STATUSES, SERVICES } from '../types/domain.js';

/**
 * Accepts Indian numbers in the shapes people actually type:
 *   9019333304, +919019333304, 090-19333-3304, 90193 33304
 * and stores them as a bare 10-digit local number prefixed for the country,
 * i.e. +919019333304, so tel: and wa.me links always work.
 */
const PHONE_PATTERN = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;

export const normalisePhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');

  if (digits.length > 10) {
    // Drop an international prefix first, then an Indian trunk prefix. Order
    // matters: slicing blindly would cut a leading 0 into the local number
    // ("090193333304" -> "0193333304").
    if (digits.startsWith('91')) digits = digits.slice(2);
    digits = digits.replace(/^0+/, '');
  }

  return `+91${digits.slice(-10)}`;
};

const phoneField = z
  .string({ required_error: 'Phone number is required.' })
  .trim()
  .min(10, 'Enter a valid phone number.')
  .max(20, 'Phone number is too long.')
  .regex(PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number.')
  .transform(normalisePhone);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isTodayOrLater = (value: string): boolean => {
  const chosen = new Date(`${value}T00:00:00Z`).getTime();
  if (Number.isNaN(chosen)) return false;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return chosen >= todayUtc;
};

/**
 * `YYYY-MM-DD`, and not a date in the past.
 *
 * An empty string is a normal, expected value: an untouched HTML date input
 * posts `""`. That must become `null` rather than a validation error, otherwise
 * leaving the date blank would reject an otherwise valid enquiry.
 */
const preferredDateField = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value === undefined || value === null || value === '' ? undefined : value))
  .superRefine((value, ctx) => {
    if (value === undefined) return;

    if (!ISO_DATE.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Use the date picker to select a valid date.' });
      return;
    }

    if (!isTodayOrLater(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Preferred date cannot be in the past.' });
    }
  })
  .transform((value) => value ?? null);

/** Body of `POST /api/enquiries` (public). */
export const createEnquirySchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120, 'Name is too long.'),
  phone: phoneField,
  service: z
    .string({ required_error: 'Please choose a service.' })
    .trim()
    .refine((value) => (SERVICES as readonly string[]).includes(value), {
      message: 'Please choose a service from the list.',
    }),
  pickup: z.string().trim().max(180, 'Pickup / site is too long.').optional().nullable(),
  destination: z.string().trim().max(180, 'Destination is too long.').optional().nullable(),
  preferredDate: preferredDateField,
  message: z.string().trim().max(2000, 'Message is too long.').optional().nullable(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

/** Body of `POST /api/auth/login`. */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.')
    .max(190),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Body of `PATCH /api/enquiries/:id` (admin). */
const updateShape = {
  status: z.enum(ENQUIRY_STATUSES).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  phone: phoneField.optional(),
  service: z
    .string()
    .trim()
    .refine((value) => (SERVICES as readonly string[]).includes(value))
    .optional(),
  pickup: z.string().trim().max(180).nullable().optional(),
  destination: z.string().trim().max(180).nullable().optional(),
  // An empty string clears the date. `undefined` must survive as `undefined` so
  // a status-only patch does not wipe the stored date — the service treats
  // `undefined` as "leave this column alone".
  preferredDate: z
    .string()
    .trim()
    .nullish()
    .transform((value) => (value === undefined || value === null ? undefined : value === '' ? null : value)),
  message: z.string().trim().max(2000).nullable().optional(),
};

/**
 * The "at least one field" rule is enforced against the *raw* body, before
 * parsing. Checking the parsed object would be wrong: Zod emits a key for every
 * field in the shape, so an absent optional field still shows up as `undefined`
 * and the object would never look empty.
 */
export const updateEnquirySchema = z.preprocess((input, ctx) => {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return input;

  if (Object.keys(input as Record<string, unknown>).length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Provide at least one field to update.' });
    return z.NEVER;
  }

  return input;
}, z.object(updateShape));

export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;

/** Query string of `GET /api/enquiries` (admin). */
export const enquiryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum([...ENQUIRY_STATUSES, 'ALL'] as [string, ...string[]]).default('ALL'),
  search: z.string().trim().max(120).default(''),
  sort: z.enum(['newest', 'oldest', 'name', 'status']).default('newest'),
});

export type EnquiryQueryInput = z.infer<typeof enquiryQuerySchema>;

/** Path param `:id` — a positive integer. */
export const idParamSchema = z.object({
  id: z.coerce
    .number()
    .int('Enquiry id must be a whole number.')
    .min(1, 'Enquiry id must be greater than zero.'),
});
