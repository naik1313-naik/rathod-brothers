/**
 * Enquiry endpoints.
 *
 *  POST   /api/enquiries        public   — the website quote form
 *  GET    /api/enquiries        admin    — list, search, filter, sort, paginate
 *  GET    /api/enquiries/:id    admin    — single enquiry
 *  PATCH  /api/enquiries/:id    admin    — update status / details
 *  DELETE /api/enquiries/:id    admin    — remove
 *  GET    /api/enquiries/stats  admin    — dashboard counts
 */
import type { Request, Response } from 'express';
import type {
  CreateEnquiryInput,
  EnquiryQueryInput,
  UpdateEnquiryInput,
} from '../middleware/validators.js';
import * as enquiryService from '../services/enquiryService.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

/** POST /api/enquiries */
export async function createEnquiry(req: Request, res: Response): Promise<Response> {
  const input = req.body as CreateEnquiryInput;
  const enquiry = await enquiryService.createEnquiry(input);
  return sendCreated(res, enquiry);
}

/** GET /api/enquiries */
export async function listEnquiries(req: Request, res: Response): Promise<Response> {
  const query = req.query as unknown as EnquiryQueryInput;
  const result = await enquiryService.getEnquiries(query);
  return sendSuccess(res, result);
}

/** GET /api/enquiries/stats — declared before /:id so "stats" is not read as an id. */
export async function getEnquiryStats(_req: Request, res: Response): Promise<Response> {
  const stats = await enquiryService.getStats();
  return sendSuccess(res, stats);
}

/** GET /api/enquiries/:id */
export async function getEnquiry(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as unknown as { id: number };
  const enquiry = await enquiryService.getEnquiry(id);
  return sendSuccess(res, enquiry);
}

/** PATCH /api/enquiries/:id */
export async function updateEnquiry(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as unknown as { id: number };
  const input = req.body as UpdateEnquiryInput;
  const enquiry = await enquiryService.updateEnquiry(id, input);
  return sendSuccess(res, enquiry);
}

/** DELETE /api/enquiries/:id */
export async function deleteEnquiry(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as unknown as { id: number };
  const result = await enquiryService.removeEnquiry(id);
  return sendSuccess(res, result);
}
