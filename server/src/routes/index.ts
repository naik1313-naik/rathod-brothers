/**
 * API router — mounts every /api route.
 */
import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { enquiryRouter } from './enquiryRoutes.js';
import { pingDatabase } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { env } from '../config/env.js';

export const apiRouter = Router();

/**
 * GET /api/health — liveness + database reachability.
 * Returns 503 when the database is down so a load balancer can act on it.
 */
apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    let database: 'up' | 'down' = 'up';
    try {
      await pingDatabase();
    } catch {
      database = 'down';
    }

    const body = {
      status: database === 'up' ? ('ok' as const) : ('degraded' as const),
      environment: env.nodeEnv,
      database,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    if (database === 'down') {
      res.status(503);
      sendSuccess(res, body);
      return;
    }
    sendSuccess(res, body);
  }),
);

apiRouter.use('/auth', authRouter);
apiRouter.use('/enquiries', enquiryRouter);
