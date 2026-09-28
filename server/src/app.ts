/**
 * Express application assembly.
 *
 * Exported separately from the HTTP listener so tests can mount the app with
 * supertest without binding a port.
 */
import path from 'node:path';
import fs from 'node:fs';
import express, { type Application, type Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, REPO_ROOT } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import type { CorsOptions } from 'cors';
import { ApiError } from './utils/ApiError.js';

export function createApp(): Application {
  const app = express();

  // Required for correct client IPs (and therefore rate limiting) behind a
  // reverse proxy / load balancer.
  if (env.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  /**
   * Two different header sets, because the API and the HTML app have opposite
   * needs:
   *
   *  - The API only ever returns JSON, so it gets the strictest possible CSP.
   *  - The built React app must be allowed to load its own scripts, styles and
   *    webfonts, so it gets a document-appropriate policy instead.
   *
   * Applying the API policy to the HTML would block the app from booting in
   * single-origin production mode, so they must not be shared.
   */
  const apiHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        // Not part of an API response's own policy, and it must not be forced
        // on clients that are still on plain HTTP.
        upgradeInsecureRequests: null,
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
  });

  /**
   * The HTML app's policy. `secure` controls two directives that must only be
   * sent over HTTPS:
   *
   *  - `upgrade-insecure-requests` rewrites every subresource URL to https://.
   *    On a plain-HTTP origin (local testing, an internal network, a host with
   *    no TLS) that silently blocks the app's own JS and CSS from loading and
   *    the page renders as a blank shell.
   *  - HSTS is ignored by browsers on plain HTTP anyway, so sending it is only
   *    meaningful when TLS is actually in play.
   */
  const buildWebHelmet = (secure: boolean) =>
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          // React sets styles through the CSSOM, and the fonts CSS is external,
          // but 'unsafe-inline' is kept for any inline style the bundler emits.
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          // Helmet merges its own defaults (which include
          // upgrade-insecure-requests), so the insecure case has to null the
          // directive out rather than simply omit it.
          upgradeInsecureRequests: secure ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: secure,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });

  const secureWebHelmet = buildWebHelmet(true);
  const plainWebHelmet = buildWebHelmet(false);

  const CORS_ALLOW: CorsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  };

  /**
   * True when the client reached us over TLS. Express's `req.protocol` already
   * accounts for both a direct TLS socket and `X-Forwarded-Proto` from a
   * trusted proxy (the latter only when `trust proxy` is enabled).
   */
  const isSecureRequest = (req: Request): boolean => req.protocol === 'https';

  // Mounted before the routers so every /api response carries the strict policy.
  app.use('/api', apiHelmet);

  app.use(
    cors((req, callback) => {
      const origin = req.headers.origin;
      const host = req.headers.host;

      // Same-origin / curl requests have no Origin header.
      if (!origin) return callback(null, CORS_ALLOW);

      const configured = env.clientOrigins.includes(origin);
      const selfOrigin = host !== undefined && origin === `${req.protocol}://${host}`;

      // `selfOrigin` keeps single-origin deployments working: the bundler marks
      // its script and stylesheet tags `crossorigin`, so the browser sends an
      // Origin header for the app's OWN hashed assets. Those are same-origin by
      // definition and must never be rejected, whatever CLIENT_ORIGIN says.
      if (configured || selfOrigin) return callback(null, CORS_ALLOW);

      return callback(new ApiError(403, `Origin "${origin}" is not allowed.`));
    }),
  );

  if (!env.isTest) {
    app.use(
      morgan(env.isProduction ? 'combined' : 'dev', {
        // Health checks would otherwise dominate the log.
        skip: (req) => req.path === '/api/health',
      }),
    );
  }

  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: false, limit: '64kb' }));

  app.use('/api', apiRouter);

  app.use('/api', notFoundHandler);

  // --- Optional single-origin production mode --------------------------------
  // When SERVE_CLIENT=true the API also serves the built React app, so the whole
  // site can run on one origin with no CORS involved.
  if (env.serveClient) {
    const clientDist = path.join(REPO_ROOT, 'client', 'dist');

    if (fs.existsSync(clientDist)) {
      // Document-appropriate security headers for the HTML app and its assets,
      // with the HTTPS-only directives applied only on a secure connection.
      app.use((req, res, next) => {
        (isSecureRequest(req) ? secureWebHelmet : plainWebHelmet)(req, res, next);
      });

      app.use(
        express.static(clientDist, {
          maxAge: '1y',
          index: false,
          setHeaders(res, filePath) {
            // Hashed asset filenames are safe to cache forever; HTML must not be.
            if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
          },
        }),
      );

      // SPA fallback so deep links like /admin/enquiries resolve client-side.
      app.get('*', (req, res, next) => {
        if (req.method !== 'GET') return next();
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(path.join(clientDist, 'index.html'), (error) => {
          if (error) next(error);
        });
      });
    } else {
       
      console.warn(
        `[config] SERVE_CLIENT is on but ${clientDist} does not exist. Run "npm run build" first.`,
      );
    }
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  // Last-resort guard: an unhandled async rejection must not kill the process.
  process.on('unhandledRejection', (reason) => {
     
    console.error('Unhandled promise rejection:', reason);
  });

  return app;
}
