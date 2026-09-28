# Rathod Brothers

Full-stack website for **Rathod Brothers — Earthmovers & Heavy Machinery Services**
(Karnataka, India).

A marketing site for visitors, a working quote/enquiry pipeline backed by MySQL,
and a password-protected admin panel for working through those enquiries.

- **Client** — React 18 + TypeScript + Vite + Tailwind CSS + Motion + Lucide
- **Server** — Express + TypeScript + MySQL (`mysql2`) + JWT + Zod
- **Shared** — npm workspaces monorepo

---

## Quick start

```bash
# 1. install everything (root + both workspaces)
npm install

# 2. create your local env file
cp .env.example .env
# then edit .env — at minimum DB_* and SEED_ADMIN_*

# 3. create the database and tables
npm run db:migrate

# 4. create the first admin login
npm run db:seed

# 5. run both apps
npm run dev
```

- Site: <http://localhost:5173>
- API: <http://localhost:4000>
- Admin: <http://localhost:5173/admin/login>

The Vite dev server proxies `/api` to `localhost:4000`, so no CORS configuration
is needed in development.

---

## Scripts

Run from the repository root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Client and server together |
| `npm run dev:client` | Vite dev server only (port 5173) |
| `npm run dev:server` | API only, with reload (port 4000) |
| `npm run build` | Type-check and build both workspaces |
| `npm start` | Run the built server (see [Production](#production)) |
| `npm run typecheck` | `tsc` across both workspaces |
| `npm run lint` | ESLint across both workspaces |
| `npm test` | Server test suite (Vitest + supertest) |
| `npm run db:migrate` | Apply `database/schema.sql` |
| `npm run db:seed` | Create/update the admin login from `.env` |
| `npm run db:reset` | Drop, re-migrate and re-seed — **destroys all enquiries** |
| `npm run verify` | `typecheck` → `lint` → `test` → `build` |

---

## Environment

Everything is configured through `.env` (never committed; `.env.example` is the
template). The server validates the whole environment at boot with Zod and exits
with a readable message if something is missing.

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | yes | `development` \| `production` \| `test` |
| `PORT` | no | API port, default `4000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | yes | MySQL connection |
| `DB_CONNECTION_LIMIT` | no | Pool size, default `10` |
| `JWT_SECRET` | **in production** | Startup fails in production if this is missing or too short |
| `JWT_EXPIRES_IN` | no | Default `8h` |
| `BCRYPT_ROUNDS` | no | Password hash cost, `10`–`14`, default `12` |
| `CLIENT_ORIGIN` | yes | Comma-separated CORS allow-list |
| `SERVE_CLIENT` | no | `true` serves the built React app from the API — see [Production](#production) |
| `TRUST_PROXY` | no | `true` when running behind nginx/Cloudflare so rate limiting sees real IPs |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | for `db:seed` | Used only by the seed script |

`SERVE_CLIENT=true` and `TRUST_PROXY=true` are mutually exclusive; setting both is
rejected at boot.

---

## API

Base path `/api`. Every response uses the same envelope:

```jsonc
{ "success": true,  "data": { } }
{ "success": false, "error": { "code": "...", "message": "...", "fields": { } } }
```

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | – | Service + database status |
| `POST` | `/api/enquiries` | – | Public quote request |
| `POST` | `/api/auth/login` | – | Exchange credentials for a JWT |
| `GET` | `/api/auth/me` | Bearer | Current admin |
| `POST` | `/api/auth/logout` | Bearer | Client-side token discard |
| `GET` | `/api/enquiries` | Bearer | List — `page`, `pageSize`, `status`, `search`, `sort` |
| `GET` | `/api/enquiries/stats` | Bearer | Counts by status |
| `GET` | `/api/enquiries/:id` | Bearer | Single enquiry |
| `PATCH` | `/api/enquiries/:id` | Bearer | Update status or details |
| `DELETE` | `/api/enquiries/:id` | Bearer | Delete permanently |

Status flow: `NEW` → `CONTACTED` → `IN_PROGRESS` → `COMPLETED`, or `CANCELLED`.

`pageSize` is capped at 100. Enquiry text is always bound as a SQL parameter and
all queries are parameterised.

### Rate limits

- Public enquiry submission: **12 per 10 minutes** per IP.
- Login attempts: **12 per 10 minutes** per IP.

Both return `429` with `Retry-After`. Set `TRUST_PROXY=true` behind a reverse
proxy, otherwise every visitor shares one limit.

---

## Database

`database/schema.sql` creates the `admins` and `enquiries` tables, including the
status enum, length constraints matching the Zod schemas, and indexes for the
list/search queries.

Phone numbers are stored normalised as `+91XXXXXXXXXX` so `tel:` and `wa.me` links
always work. `preferred_date` accepts the blank value an untouched date input
posts and stores it as `NULL`.

---

## Project layout

```
client/
  index.html            static, crawlable SEO metadata + LocalBusiness JSON-LD
  public/               favicon, og-image, robots.txt, sitemap.xml, manifest
  src/
    App.tsx             routes, chrome, intro loader
    components/         Navbar, Footer, QuoteForm, FloatingActions, motion, …
    components/admin/   AdminLayout, EnquiryTable, EnquiryDetails, RequireAuth
    sections/           Hero, About, Services, EquipmentGallery, Coverage, Owners, Contact
    pages/              HomePage, NotFoundPage
    pages/admin/        AdminLoginPage, AdminDashboardPage, AdminEnquiriesPage
    lib/                business.ts (single source of truth), api, links, seo
    services/           enquiryService, adminService, AuthContext
    assets/             owner photos, equipment illustrations
server/
  src/
    app.ts              middleware + routes
    routes/             index, authRoutes, enquiryRoutes
    controllers/        thin HTTP handlers
    services/           enquiry + auth business logic
    models/             parameterised SQL
    middleware/         auth, validate, validators, rateLimit, errorHandler
    scripts/            migrate, seedAdmin, reset
  tests/                validators.test.ts, api.test.ts
database/schema.sql
```

### Changing business details

Phone numbers, email, social handles, owners and service copy all come from
**one file**: `client/src/lib/business.ts`. Edit it and every button, `tel:` href,
`wa.me` link, footer entry and JSON-LD block updates. No other file hard-codes a
contact detail.

### Swapping the placeholder images

`client/src/assets/equipment/*.svg` are technical **illustrations**, not
photographs of real company machines — the site labels them as such. To use real
photography, drop the files in and update the three imports at the top of
`client/src/lib/business.ts`; aspect ratios and consumers stay unchanged.

---

## Testing

```bash
npm test
```

56 tests: validation rules and phone normalisation as unit tests, plus HTTP-level
integration tests through supertest (auth guards, error shapes, 422/404/413
handling, and the full enquiry lifecycle).

The database-backed tests run against your `.env` MySQL and **skip themselves
automatically** when it is unreachable, so the suite still passes on a fresh
machine. The admin tests use the credentials from `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` and create rows tagged `test-<timestamp>`, which are
cleaned up afterwards.

---

## Deploying to Railway

`railway.json` deploys both workspaces as **one** service in single-origin mode
(`SERVE_CLIENT=true`), with the Railway MySQL plugin alongside it.

```bash
railway init --name rathod-brothers
railway add --database mysql          # creates the "MySQL" service
railway add --service app             # the app service

# DB_* point at the plugin over Railway's private network
railway variable set --service app \
  'DB_HOST=${{MySQL.MYSQLHOST}}' \
  'DB_PORT=${{MySQL.MYSQLPORT}}' \
  'DB_USER=${{MySQL.MYSQLUSER}}' \
  'DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}' \
  'DB_NAME=rathod_brothers' \
  'NODE_ENV=production' 'SERVE_CLIENT=true' 'TRUST_PROXY=true' \
  'CLIENT_ORIGIN=https://<your-domain>' \
  'SEED_ADMIN_NAME=…' 'SEED_ADMIN_EMAIL=…' 'SEED_ADMIN_PASSWORD=…'

railway domain --service app           # generates a *.up.railway.app URL
railway up --service app --detach
```

`JWT_SECRET` is **not** set above on purpose — generate one and set it
separately, or the boot-time production check refuses to start:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`.railwayignore` keeps `.env`, `node_modules` and the local `database/mysql-data`
out of the upload.

### Migrations

`db:migrate` and `db:seed` cannot run on your laptop: the plugin is only
reachable as `mysql.railway.internal` from inside Railway. Tunnel it and run
them locally instead:

```bash
railway connect mysql --ssh --tunnel-only -P 13307   # needs a registered SSH key
DB_HOST=127.0.0.1 DB_PORT=13307 DB_NAME=rathod_brothers \
  DB_USER=root DB_PASSWORD='…' npm run db:migrate
```

`railway connect` tunnels over SSH, so the database is never exposed publicly.
The migration itself is idempotent — every statement in the schema is
`IF NOT EXISTS` — so re-running it after each schema change is safe. Re-run
`railway up` after changing the schema.

---

## Production

```bash
npm run build          # builds client/dist and server/dist
SERVE_CLIENT=true npm start
```

With `SERVE_CLIENT=true` the Express server also serves `client/dist`, so the
whole site runs on a single origin with no CORS involved. It applies a
document-appropriate CSP to the HTML and assets while `/api` keeps a strict
`default-src 'none'` policy. Put a TLS-terminating reverse proxy (nginx, Caddy,
Cloudflare) in front and set `TRUST_PROXY=true`.

Checklist before going live:

- [ ] `NODE_ENV=production` and a long random `JWT_SECRET`
- [ ] `CLIENT_ORIGIN` lists only your real domain
- [ ] `TRUST_PROXY=true` behind a proxy
- [ ] MySQL user has only the privileges it needs on this one schema
- [ ] `db:seed` run once; the seeded password changed or removed
- [ ] Test data deleted from `enquiries` (`npm run db:reset` clears everything)
- [ ] `client/src/lib/seo.ts` analytics IDs filled in if you want them
- [ ] Operating hours added to `business.ts` **once confirmed** — none are
      published now, because an unverified schedule is worse than none

---

## Security notes

- Passwords are bcrypt-hashed (cost `BCRYPT_ROUNDS`, default 12) and verified with `bcrypt.compare`.
- JWTs expire after `JWT_EXPIRES_IN` (default `8h`) and are validated on every protected request.
- The admin token lives in `localStorage`. This is a deliberate trade-off: it
  keeps the API usable from any origin with no cookie/`SameSite` pitfalls, at the
  cost of the token being readable by script. It is mitigated by a strict CSP, a
  short expiry, and the entire admin area being a separate lazily-loaded bundle
  that public visitors never download. Moving to an `httpOnly` cookie is the
  natural next step if you want to remove the trade-off.
- All SQL is parameterised; all input is validated with Zod before it reaches a
  controller. The test suite asserts that injection attempts are stored as inert
  text and that the table survives.
- The public API has no read endpoints — enquiries are only ever visible to a
  signed-in admin.

## Accessibility

Skip-to-content target, labelled form fields with inline errors, focus management
for the mobile drawer, admin drawer and loader, visible focus rings, `aria-live`
regions for form and list updates, keyboard-dismissible dialogs, and a full
`prefers-reduced-motion` path that disables the intro loader, marquee, custom
cursor, tilt and SVG animation.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari 16.4+). Uses CSS
`color-mix`, `backdrop-filter` and container-free fluid `clamp()` typography.
