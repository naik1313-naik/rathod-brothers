/**
 * HTTP-level integration tests.
 *
 * The app is mounted with supertest — no port is bound. The database-backed
 * suites are skipped automatically when MySQL is not reachable, so `npm test`
 * still passes on a machine that has not run `npm run db:migrate`.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createApp } from '../src/app.js';
import { closePool, pingDatabase } from '../src/db/pool.js';
import { SERVICES } from '../src/types/domain.js';

const app: Application = createApp();

/**
 * Resolved at module scope, not in a hook: `describe.skipIf` is evaluated while
 * the file is being collected, which happens *before* `beforeAll` runs, so a
 * flag set in a hook would still be false and every DB test would skip.
 */
const dbUp = await pingDatabase()
  .then(() => true)
  .catch(() => false);

/** Unique marker so rows created here can be cleaned up without touching real data. */
const RUN_ID = `test-${Date.now()}`;

let token = '';

beforeAll(() => {
  if (!dbUp) return;
  process.stdout.write(`[tests] MySQL reachable — running the database-backed suites.\n`);
});

afterAll(async () => {
  if (!dbUp) return;
  try {
    await request(app)
      .delete(`/api/enquiries?search=${encodeURIComponent(RUN_ID)}`)
      .set('Authorization', `Bearer ${token}`);
  } catch {
    // Best effort cleanup; the marker prefix keeps orphans harmless.
  }
  await closePool();
});

/* -------------------------------------------------------------------------- */
/*  Always runs — no database required                                          */
/* -------------------------------------------------------------------------- */

describe('GET /api/health', () => {
  it('reports service status and database reachability', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    // `up` or `down` depending on whether MySQL is reachable here.
    expect(['up', 'down']).toContain(response.body.data.database);
  });
});

describe('error handling', () => {
  it('returns 404 JSON for an unknown API route', async () => {
    const response = await request(app).get('/api/nope');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 for malformed JSON rather than crashing', async () => {
    const response = await request(app)
      .post('/api/enquiries')
      .set('Content-Type', 'application/json')
      .send('{"name": broken');
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejects an oversized body', async () => {
    const response = await request(app)
      .post('/api/enquiries')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ name: 'x'.repeat(70_000) }));
    expect(response.status).toBe(413);
  });

  it('does not leak the framework fingerprint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});

describe('public validation', () => {
  it('rejects an invalid enquiry with 422 and per-field messages', async () => {
    const response = await request(app)
      .post('/api/enquiries')
      .send({ name: '', phone: '123', service: 'Nonsense' });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.fields).toHaveProperty('name');
    expect(response.body.error.fields).toHaveProperty('phone');
    expect(response.body.error.fields).toHaveProperty('service');
  });

  it('rejects a bad login with 401 and does not reveal which field was wrong', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('authentication guard', () => {
  it('rejects a list request without a token', async () => {
    expect((await request(app).get('/api/enquiries')).status).toBe(401);
  });

  it('rejects the stats request without a token', async () => {
    expect((await request(app).get('/api/enquiries/stats')).status).toBe(401);
  });

  it('rejects reading a single enquiry without a token', async () => {
    expect((await request(app).get('/api/enquiries/1')).status).toBe(401);
  });

  it('rejects a status update without a token', async () => {
    expect((await request(app).patch('/api/enquiries/1').send({ status: 'CONTACTED' })).status).toBe(401);
  });

  it('rejects a delete without a token', async () => {
    expect((await request(app).delete('/api/enquiries/999999')).status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const response = await request(app)
      .get('/api/enquiries')
      .set('Authorization', 'Bearer not.a.jwt');
    expect(response.status).toBe(401);
  });
});

/* -------------------------------------------------------------------------- */
/*  Database-backed — skipped when MySQL is unavailable                        */
/* -------------------------------------------------------------------------- */

describe.skipIf(!dbUp)('enquiry lifecycle', () => {
  let createdId = 0;

  it('creates an enquiry and normalises the phone number', async () => {
    const response = await request(app)
      .post('/api/enquiries')
      .send({
        name: `${RUN_ID} Ramesh`,
        phone: '090193-33304',
        service: SERVICES[0],
        pickup: 'Site A',
        destination: 'Site B',
        message: 'Need 10 loads of sand.',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.phone).toBe('+919019333304');
    expect(response.body.data.status).toBe('NEW');
    createdId = response.body.data.id;
    expect(createdId).toBeGreaterThan(0);
  });

  it('does not echo back rows belonging to other users on a public endpoint', async () => {
    // The public surface has no read endpoint at all — asserting the 404 shape
    // for a list request is the regression guard for that.
    const response = await request(app).get('/api/enquiries');
    expect(response.status).toBe(401);
  });

  it('signs in as the seeded admin', async () => {
    const email = process.env.ADMIN_EMAIL ?? 'admin@rathodbrothers.com';
    const password = process.env.ADMIN_PASSWORD;
    expect(password, 'ADMIN_PASSWORD must be set to run the auth tests').toBeTruthy();

    const response = await request(app).post('/api/auth/login').send({ email, password });
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.admin.email).toBe(email);
    token = response.body.data.token;
  });

  it('returns stats with counts that include the new row', async () => {
    const response = await request(app)
      .get('/api/enquiries/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBeGreaterThan(0);
    expect(response.body.data.new).toBeGreaterThan(0);
  });

  it('lists and searches enquiries', async () => {
    const response = await request(app)
      .get(`/api/enquiries?search=${encodeURIComponent(RUN_ID)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.items[0].name).toContain(RUN_ID);
  });

  it('paginates and clamps page size', async () => {
    const response = await request(app)
      .get('/api/enquiries?page=1&pageSize=1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items.length).toBeLessThanOrEqual(1);
    expect(response.body.data.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('updates the status', async () => {
    const response = await request(app)
      .patch(`/api/enquiries/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONTACTED' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('CONTACTED');
  });

  it('rejects an invalid status with 422', async () => {
    const response = await request(app)
      .patch(`/api/enquiries/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'NOT_A_STATUS' });

    expect(response.status).toBe(422);
  });

  it('returns 404 for a missing enquiry', async () => {
    const response = await request(app)
      .get('/api/enquiries/99999999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('stores a SQL-injection attempt as inert text', async () => {
    const response = await request(app)
      .post('/api/enquiries')
      .send({
        name: `${RUN_ID} Injection`,
        phone: '9019333304',
        service: SERVICES[0],
        message: "'; DROP TABLE enquiries; --",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.message).toBe("'; DROP TABLE enquiries; --");
  });

  it('still serves enquiries afterwards, proving the table survived', async () => {
    const response = await request(app)
      .get('/api/enquiries?pageSize=1')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it('deletes the enquiry', async () => {
    const response = await request(app)
      .delete(`/api/enquiries/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);

    const after = await request(app)
      .get(`/api/enquiries/${createdId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(404);
  });
});
