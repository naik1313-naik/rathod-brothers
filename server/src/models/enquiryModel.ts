/**
 * Data access for the `enquiries` table.
 *
 * Every statement uses `pool.execute()` with bound parameters or a fixed,
 * allow-listed fragment. No user-supplied value is ever interpolated into SQL
 * text; the only dynamic SQL here is the ORDER BY direction, which is chosen
 * from a fixed map rather than passed through.
 */
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getPool } from '../db/pool.js';
import type { Enquiry, EnquiryStats } from '../types/domain.js';
import type { EnquiryQueryInput } from '../middleware/validators.js';

interface EnquiryRow extends RowDataPacket, Enquiry {}

interface StatsRow extends RowDataPacket {
  total: number | string;
  new_count: number | string;
  contacted_count: number | string;
  in_progress_count: number | string;
  completed_count: number | string;
  cancelled_count: number | string;
}

/** Values mysql2 will bind as prepared-statement parameters. */
type BindValue = string | number | null | Buffer;

const COLUMNS = `
  id, name, phone, service, pickup, destination,
  preferred_date, message, status, created_at, updated_at
` as const;

/** Whitelisted ORDER BY clauses — never built from raw user input. */
const SORT_SQL: Record<EnquiryQueryInput['sort'], string> = {
  newest: 'created_at DESC, id DESC',
  oldest: 'created_at ASC, id ASC',
  name: 'name ASC, id ASC',
  status: "FIELD(status,'NEW','CONTACTED','IN_PROGRESS','COMPLETED','CANCELLED'), created_at DESC",
};

export interface CreateEnquiryRecord {
  name: string;
  phone: string;
  service: string;
  pickup: string | null;
  destination: string | null;
  preferred_date: string | null;
  message: string | null;
}

export async function insertEnquiry(record: CreateEnquiryRecord): Promise<Enquiry> {
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO enquiries (name, phone, service, pickup, destination, preferred_date, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW')`,
    [
      record.name,
      record.phone,
      record.service,
      record.pickup,
      record.destination,
      record.preferred_date,
      record.message,
    ],
  );

  const created = await findEnquiryById(result.insertId);
  if (!created) throw new Error('Enquiry was inserted but could not be read back.');
  return created;
}

export async function findEnquiryById(id: number): Promise<Enquiry | null> {
  const [rows] = await getPool().execute<EnquiryRow[]>(
    `SELECT ${COLUMNS} FROM enquiries WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export interface ListResult {
  items: Enquiry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listEnquiries(query: EnquiryQueryInput): Promise<ListResult> {
  const conditions: string[] = [];
  const params: BindValue[] = [];

  if (query.status !== 'ALL') {
    conditions.push('status = ?');
    params.push(query.status);
  }

  if (query.search) {
    // LIKE '%term%' cannot use an index, which is acceptable for an enquiry
    // table of this size. `%` and `_` are escaped so a user typing them does
    // not accidentally turn into a wildcard.
    const term = `%${query.search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(
      `(name LIKE ? ESCAPE '\\\\'
        OR phone LIKE ? ESCAPE '\\\\'
        OR service LIKE ? ESCAPE '\\\\'
        OR pickup LIKE ? ESCAPE '\\\\'
        OR destination LIKE ? ESCAPE '\\\\'
        OR message LIKE ? ESCAPE '\\\\')`,
    );
    params.push(term, term, term, term, term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = SORT_SQL[query.sort];

  const countSql = `SELECT COUNT(*) AS total FROM enquiries ${where}`;
  const [countRows] = await getPool().execute<RowDataPacket[]>(countSql, params);
  const total = Number(countRows[0]?.['total'] ?? 0);

  const offset = (query.page - 1) * query.pageSize;
  const listSql = `SELECT ${COLUMNS} FROM enquiries ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  const [rows] = await getPool().execute<EnquiryRow[]>(listSql, [...params, query.pageSize, offset]);

  return {
    items: rows,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function deleteEnquiry(id: number): Promise<boolean> {
  const [result] = await getPool().execute<ResultSetHeader>('DELETE FROM enquiries WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

/** Real aggregate counts for the admin dashboard — never fabricated. */
export async function getEnquiryStats(): Promise<EnquiryStats> {
  const [rows] = await getPool().execute<StatsRow[]>(
    `SELECT
        COUNT(*)                                                  AS total,
        COALESCE(SUM(status = 'NEW'), 0)                         AS new_count,
        COALESCE(SUM(status = 'CONTACTED'), 0)                   AS contacted_count,
        COALESCE(SUM(status = 'IN_PROGRESS'), 0)                 AS in_progress_count,
        COALESCE(SUM(status = 'COMPLETED'), 0)                   AS completed_count,
        COALESCE(SUM(status = 'CANCELLED'), 0)                   AS cancelled_count
     FROM enquiries`,
  );

  const row = rows[0];
  return {
    total: Number(row?.total ?? 0),
    new: Number(row?.new_count ?? 0),
    contacted: Number(row?.contacted_count ?? 0),
    inProgress: Number(row?.in_progress_count ?? 0),
    completed: Number(row?.completed_count ?? 0),
    cancelled: Number(row?.cancelled_count ?? 0),
  };
}
