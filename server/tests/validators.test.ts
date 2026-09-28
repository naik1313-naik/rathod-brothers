/**
 * Unit tests for the validation layer.
 *
 * These are the rules the public form depends on, so they are tested in
 * isolation — no database, no HTTP. The exact messages matter: the frontend
 * mirrors them, and they are what a visitor sees when something is wrong.
 */
import { describe, expect, it } from 'vitest';
import {
  createEnquirySchema,
  enquiryQuerySchema,
  idParamSchema,
  loginSchema,
  normalisePhone,
  updateEnquirySchema,
} from '../src/middleware/validators.js';
import { SERVICES } from '../src/types/domain.js';

const validEnquiry = {
  name: 'Ramesh Construction',
  phone: '9019333304',
  service: SERVICES[0],
};

describe('normalisePhone', () => {
  it('stores a bare 10-digit number with the country code', () => {
    expect(normalisePhone('9019333304')).toBe('+919019333304');
  });

  it('strips a leading 91 country code', () => {
    expect(normalisePhone('+919019333304')).toBe('+919019333304');
    expect(normalisePhone('91 90193 33304')).toBe('+919019333304');
  });

  it('strips the 0 trunk prefix', () => {
    expect(normalisePhone('09019333304')).toBe('+919019333304');
  });

  it('ignores spaces, dashes and brackets', () => {
    expect(normalisePhone('090-19333-304')).toBe('+919019333304');
    expect(normalisePhone('(90193) 33304')).toBe('+919019333304');
    expect(normalisePhone('90193-33304')).toBe('+919019333304');
  });
});

describe('createEnquirySchema', () => {
  it('accepts a minimal valid payload and defaults the optional fields', () => {
    const result = createEnquirySchema.parse(validEnquiry);
    expect(result.phone).toBe('+919019333304');
    expect(result.pickup).toBeUndefined();
  });

  it('rejects a name that is too short', () => {
    const result = createEnquirySchema.safeParse({ ...validEnquiry, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number that is too short', () => {
    const result = createEnquirySchema.safeParse({ ...validEnquiry, phone: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects a phone number that does not start 6-9', () => {
    const result = createEnquirySchema.safeParse({ ...validEnquiry, phone: '1234567890' });
    expect(result.success).toBe(false);
  });

  it('rejects a service that is not on the server-side list', () => {
    const result = createEnquirySchema.safeParse({ ...validEnquiry, service: 'Free Gold' });
    expect(result.success).toBe(false);
  });

  it('rejects a past preferred date', () => {
    const result = createEnquirySchema.safeParse({
      ...validEnquiry,
      preferredDate: '2000-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a preferred date that is not ISO formatted', () => {
    const result = createEnquirySchema.safeParse({
      ...validEnquiry,
      preferredDate: '27-09-2026',
    });
    expect(result.success).toBe(false);
  });

  it('turns an empty preferred date into null rather than rejecting it', () => {
    // An untouched HTML date input posts "", which must not fail validation.
    const result = createEnquirySchema.parse({ ...validEnquiry, preferredDate: '' });
    expect(result.preferredDate).toBeNull();
  });

  it('accepts a future preferred date', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const result = createEnquirySchema.parse({ ...validEnquiry, preferredDate: future });
    expect(result.preferredDate).toBe(future);
  });

  it('rejects a malformed preferred date with a date-picker message', () => {
    const result = createEnquirySchema.safeParse({ ...validEnquiry, preferredDate: '27-09-2026' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/date picker/i);
    }
  });

  it('rejects an over-long message', () => {
    const result = createEnquirySchema.safeParse({ ...validEnquiry, message: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('lowercases the email so lookup is case-insensitive', () => {
    const result = loginSchema.parse({ email: '  Admin@RathodBrothers.com ', password: 'password123' });
    expect(result.email).toBe('admin@rathodbrothers.com');
  });

  it('rejects a short password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false);
  });

  it('rejects a malformed email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'password123' }).success).toBe(false);
  });
});

describe('updateEnquirySchema', () => {
  it('accepts a single status change', () => {
    const result = updateEnquirySchema.parse({ status: 'CONTACTED' });
    expect(result.status).toBe('CONTACTED');
  });

  it('rejects an empty patch', () => {
    expect(updateEnquirySchema.safeParse({}).success).toBe(false);
  });

  it('rejects an unknown status', () => {
    expect(updateEnquirySchema.safeParse({ status: 'NOPE' }).success).toBe(false);
  });

  it('leaves an untouched preferred date undefined so a status change cannot wipe it', () => {
    const result = updateEnquirySchema.parse({ status: 'CONTACTED' });
    expect(result.preferredDate).toBeUndefined();
  });

  it('clears the preferred date when an empty string is sent explicitly', () => {
    const result = updateEnquirySchema.parse({ preferredDate: '' });
    expect(result.preferredDate).toBeNull();
  });

  it('keeps a supplied preferred date', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const result = updateEnquirySchema.parse({ preferredDate: future });
    expect(result.preferredDate).toBe(future);
  });
});

describe('enquiryQuerySchema', () => {
  it('coerces numeric strings from the query string', () => {
    const result = enquiryQuerySchema.parse({ page: '3', pageSize: '50' });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it('applies safe defaults', () => {
    const result = enquiryQuerySchema.parse({});
    expect(result).toMatchObject({ page: 1, pageSize: 20, status: 'ALL', sort: 'newest' });
  });

  it('caps pageSize at 100 so one request cannot pull the whole table', () => {
    expect(enquiryQuerySchema.safeParse({ pageSize: '5000' }).success).toBe(false);
  });

  it('rejects an unknown sort order', () => {
    expect(enquiryQuerySchema.safeParse({ sort: 'random' }).success).toBe(false);
  });
});

describe('idParamSchema', () => {
  it('coerces a numeric string', () => {
    expect(idParamSchema.parse({ id: '42' })).toEqual({ id: 42 });
  });

  it('rejects zero and negatives', () => {
    expect(idParamSchema.safeParse({ id: '0' }).success).toBe(false);
    expect(idParamSchema.safeParse({ id: '-3' }).success).toBe(false);
  });

  it('rejects a non-numeric id', () => {
    expect(idParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
  });
});
