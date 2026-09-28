/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * pipeline instead of hanging the request. Without this, one `throw` inside an
 * async controller would time the request out rather than return a 500.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}
