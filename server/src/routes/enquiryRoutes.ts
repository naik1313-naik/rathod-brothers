/**
 * /api/enquiries routes
 *
 * The public POST is the only unauthenticated route in this router. Everything
 * else sits behind `requireAuth`, so no enquiry data is readable without a
 * valid admin token.
 */
import { Router } from 'express';
import * as enquiryController from '../controllers/enquiryController.js';
import { requireAuth } from '../middleware/auth.js';
import { enquirySubmitLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createEnquirySchema,
  enquiryQuerySchema,
  idParamSchema,
  updateEnquirySchema,
} from '../middleware/validators.js';
import { validate } from '../middleware/validate.js';

export const enquiryRouter = Router();

// --- Public -----------------------------------------------------------------
enquiryRouter.post(
  '/',
  enquirySubmitLimiter,
  validate(createEnquirySchema),
  asyncHandler(enquiryController.createEnquiry),
);

// --- Admin only -------------------------------------------------------------
enquiryRouter.get('/', requireAuth, validate(enquiryQuerySchema, 'query'), asyncHandler(enquiryController.listEnquiries));

// Must be registered before '/:id' so the literal path wins the match.
enquiryRouter.get('/stats', requireAuth, asyncHandler(enquiryController.getEnquiryStats));

enquiryRouter.get(
  '/:id',
  requireAuth,
  validate(idParamSchema, 'params'),
  asyncHandler(enquiryController.getEnquiry),
);

enquiryRouter.patch(
  '/:id',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(updateEnquirySchema),
  asyncHandler(enquiryController.updateEnquiry),
);

enquiryRouter.delete(
  '/:id',
  requireAuth,
  validate(idParamSchema, 'params'),
  asyncHandler(enquiryController.deleteEnquiry),
);
