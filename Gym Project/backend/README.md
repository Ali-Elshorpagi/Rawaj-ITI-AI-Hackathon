# ChaletBook Backend

Node.js / TypeScript REST API for **chalet listings, bookings, and payments**, with separate flows for **end users**, **providers**, and **admins**.

---

## Features

- **Users:** registration, email OTP verification, login, password reset, profile updates, optional provider role
- **Providers:** KYC requests (admin approval), chalet CRUD, publish, dashboard stats / home data
- **Bookings:** create booking with ID image upload, payment initiation, payment webhook, user/provider booking lists, saved guest data
- **Catalog:** locations, facilities, banners, public settings, composed main page (banners + chalets + hero video)
- **Engagement:** chalet-only **favorites** and **reviews**
- **Files:** Cloudinary-oriented upload pipeline, test endpoint, delete by file id
- **Notifications:** Pusher Beams–style user/provider token endpoints
- **Internationalization:** English / Arabic via `Accept-Language` and `locales/*.json`
- **API documentation:** **Swagger UI** (OpenAPI 3) with request/response examples, including common error shapes

---

## Tech stack

| Area       | Choice                                |
| ---------- | ------------------------------------- |
| Runtime    | Node.js                               |
| Language   | TypeScript (strict)                   |
| HTTP       | Express 4                             |
| Database   | MongoDB (Mongoose 8)                  |
| Validation | Zod                                   |
| Auth       | JWT (`Authorization: Bearer <token>`) |
| Jobs       | Agenda (e.g. scheduled cleanup)       |
| Docs       | `swagger-ui-express`                  |

---

## Project layout

```
src/
  app.ts                 # Express app: middleware, route mounts, Swagger
  server.ts              # HTTP server + startup logs (includes Swagger URL)
  modules/               # Feature modules (router, controller, service, models, logic)
    admins/
    bannars/
    booking/
    chalets/
    facilities/
    favorites/
    File/
    location/
    notifications/
    pages/
    payment/             # Payment service used by bookings (no extra HTTP routes)
    providers/
    reviews/
    settings/
    users/
  shared/
    config.ts            # Central env-backed configuration
    database/
    middlewares/         # auth, i18n, pagination, upload, errors, …
    scheduler/
    utils/
  swagger/               # OpenAPI spec (paths, components), Swagger UI setup, docs URL helper
locales/
  en.json, ar.json       # i18n strings
```

Compiled output: **`dist/`** (mirror of `src/`).

---

## Requirements

- Node.js 18+ recommended
- MongoDB (local or Atlas)
- Optional: Cloudinary, SMTP, Pusher, external **payment simulator** HTTP API

---

## Setup

1. **Clone / open the project** and install dependencies:

   ```bash
   npm install
   ```

2. **Environment variables** — copy from the list below into a `.env` file in the project root (see `src/shared/config.ts` for how they are read).

3. **Build** (required for `npm start`):

   ```bash
   npm run build
   ```

4. **Run**

   ```bash
   # development (TypeScript, auto-reload)
   npm run dev

   # production (compiled JS)
   npm start
   ```

On startup the server logs the listening **port** and the full **Swagger UI URL** (for `localhost`, the port matches `PORT` / `config.port` even if `API_URL` differs).

---

## Environment variables

| Variable                                                          | Purpose                                                                                                                                       |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                                            | HTTP port (default `3000`)                                                                                                                    |
| `MONGODB_URI`                                                     | MongoDB connection string (default DB name in URI; fallback in code uses `ChaletBook`)                                                        |
| `API_URL`                                                         | Public base URL of this API (webhooks, links); used in OpenAPI “server” and booking payment callback                                          |
| `JWT_SECRET`                                                      | JWT signing secret                                                                                                                            |
| `JWT_EXPIRES_IN`                                                  | JWT expiry (e.g. `7d`)                                                                                                                        |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | Email (OTP, notifications)                                                                                                                    |
| `UPLOAD_PATH` or `FILE_UPLOAD_PATH`                               | Upload directory (config uses `UPLOAD_PATH`)                                                                                                  |
| `PAYMENT_API_KEY`                                                 | Bearer token for the external payment charge API                                                                                              |
| `PAYMENT_SIMULATOR_URL`                                           | Full URL of the payment provider’s **charge** endpoint (POST). Required for successful checkout unless you replace the gateway implementation |
| `CLOUDINARY_*`                                                    | Cloudinary (if used by upload middleware)                                                                                                     |
| `PUSHER_INSTANCE_ID`, `PUSHER_SECRET_KEY`                         | Pusher Beams (notifications)                                                                                                                  |

Never commit real secrets; keep `.env` out of version control.

---

## API overview

All JSON APIs are under the **`/api`** prefix unless noted.

### Health

| Method | Path          | Auth |
| ------ | ------------- | ---- |
| POST   | `/api/health` | No   |

### Users (`/api/users`)

| Method | Path                                                                       | Auth                               |
| ------ | -------------------------------------------------------------------------- | ---------------------------------- |
| POST   | `/register`, `/verify`, `/resend-otp`, `/login`                            | No                                 |
| POST   | `/update-password`                                                         | User                               |
| POST   | `/request-password-reset`, `/verify-reset-password-otp`, `/reset-password` | No                                 |
| PUT    | `/be-provider`                                                             | User                               |
| PUT    | `/`                                                                        | User (multipart: optional `photo`) |
| DELETE | `/`                                                                        | User                               |

### Admins (`/api/admins`)

| Method | Path      | Auth  |
| ------ | --------- | ----- |
| POST   | `/create` | Admin |
| POST   | `/login`  | No    |

### Providers (`/api/providers`)

| Method | Path                                  | Auth                                        |
| ------ | ------------------------------------- | ------------------------------------------- |
| POST   | `/requests`                           | User with **provider** role (multipart KYC) |
| GET    | `/requests`                           | Admin (paginated)                           |
| GET    | `/requests/:providerRequestId`        | Admin                                       |
| POST   | `/requests/:providerRequestId/accept` | Admin                                       |
| DELETE | `/requests/:providerRequestId/reject` | Admin                                       |
| GET    | `/stats`, `/home-page`                | Provider (complete profile)                 |

### Chalets (`/api/chalets`)

| Method           | Path                    | Auth                                    |
| ---------------- | ----------------------- | --------------------------------------- |
| POST, GET        | `/provider`             | Provider                                |
| GET, PUT, DELETE | `/provider/:id`         | Provider                                |
| PATCH            | `/provider/:id/publish` | Provider                                |
| GET              | `/`                     | Optional user (token enriches response) |
| GET              | `/:id`                  | Optional user                           |

### Locations (`/api/locations`)

| Method                 | Path                   | Auth   |
| ---------------------- | ---------------------- | ------ |
| POST, PUT, GET, DELETE | `/admin`, `/admin/:id` | Admin  |
| GET                    | `/`                    | Public |

### Facilities (`/api/facilities`)

| Method                 | Path                   | Auth                               |
| ---------------------- | ---------------------- | ---------------------------------- |
| POST, PUT, GET, DELETE | `/admin`, `/admin/:id` | Admin (multipart where applicable) |
| GET                    | `/`                    | Public (paginated)                 |

### Banners (`/api/bannars`)

| Method                 | Path                   | Auth  |
| ---------------------- | ---------------------- | ----- |
| POST, PUT, DELETE, GET | `/admin`, `/admin/:id` | Admin |

### Reviews (`/api/reviews`)

| Method | Path     | Auth               |
| ------ | -------- | ------------------ |
| GET    | `/`      | Public (paginated) |
| POST   | `/`      | User               |
| GET    | `/stats` | Public             |

### Favorites (`/api/favorites`)

| Method      | Path | Auth                                      |
| ----------- | ---- | ----------------------------------------- |
| GET         | `/`  | User (paginated)                          |
| PUT, DELETE | `/`  | User (body: `item`, `itemType: "chalet"`) |

### Pages (`/api/pages`)

| Method | Path         | Auth                          |
| ------ | ------------ | ----------------------------- |
| GET    | `/main-page` | Optional user                 |
| PUT    | `/main-page` | Admin (multipart `heroVideo`) |

### Settings (`/api/settings`)

| Method | Path     | Auth                             |
| ------ | -------- | -------------------------------- |
| GET    | `/admin` | Admin                            |
| GET    | `/`      | Public                           |
| PUT    | `/`      | Admin (multipart logos + fields) |

### Files (`/api/files`)

| Method | Path                    | Auth             |
| ------ | ----------------------- | ---------------- |
| POST   | `/test-cloudinary`      | User (multipart) |
| DELETE | `/delete-image/:fileId` | User             |

### Bookings (`/api/bookings`)

| Method | Path                        | Auth                                                         |
| ------ | --------------------------- | ------------------------------------------------------------ |
| POST   | `/`                         | User (multipart: `idImage` + booking fields)                 |
| POST   | `/webhooks/payment`         | **Public** (payment provider callback; secure in production) |
| GET    | `/user`, `/user/saved-data` | User                                                         |
| GET    | `/provider`                 | Provider                                                     |

### Notifications (`/api/notifications`)

| Method | Path              | Auth     |
| ------ | ----------------- | -------- |
| GET    | `/user/token`     | User     |
| GET    | `/provider/token` | Provider |

### Payment (`/api/payment`)

The router is mounted for consistency, but **there are no additional HTTP routes** here. Payment is started from **POST `/api/bookings`** and completed via **POST `/api/bookings/webhooks/payment`**.

---

## Payment flow (summary)

1. Client calls **POST `/api/bookings`** with valid chalet dates, guest info, and `idImage`.
2. Server creates a pending booking and calls the configured **payment simulator** (`PAYMENT_SIMULATOR_URL`) with a webhook URL derived from **`API_URL`**:  
   `{API_URL}/api/bookings/webhooks/payment`
3. Provider redirects the user to the returned payment URL; on completion it POSTs JSON such as `{ "payment_id": "...", "status": "success" | "failed" }` to the webhook.
4. Transactions are stored with gateway identifier **`payment`**.

---

## Swagger / OpenAPI

- **Interactive UI:** `{origin}/api/docs`  
  On startup, the exact URL is printed (e.g. `http://localhost:5585/api/docs` when using that port).
- **Raw spec:** `{origin}/api/docs/openapi.json`

The spec documents routes, auth, `Accept-Language`, multipart bodies where used, and example **success** and **error** responses aligned with `successMiddleware` and `errorHandler` (including 401, 404, 409, 422, 504, 500).

Source: `src/swagger/` (`openapi.ts`, `paths/`, `components.ts`, `setupSwagger.ts`, `swaggerUrl.ts`).

---

## Response conventions

- **Success:** `{ "success": true, "message": "<i18n or key>", "data": ..., "statusCode": <n> }`
- **Handled app errors:** `{ "success": false, "message": "...", "statusCode": <n> }`
- **Zod validation:** HTTP **422**, same envelope with `message` from `validation.*`
- **Some multer errors:** HTTP **400** with `error` instead of `message`
- **Unhandled:** HTTP **500**, `message: "Something went wrong"`

---

## Scripts

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `npm run dev`   | Run `src/server.ts` with `ts-node-dev` |
| `npm run build` | Compile TypeScript to `dist/`          |
| `npm start`     | Run `dist/server.js`                   |
| `npm test`      | Jest (configure as needed)             |

---

## Package name

The npm package name in `package.json` is **ChaletBook -backend** (there is a space before `backend`). You can rename it if you publish to a registry.

---

## Implementation notes

- **Database:** default MongoDB database name in the fallback connection string is **`ChaletBook`**; production uses whatever name is in `MONGODB_URI`.
- **Branding:** app name, descriptions, logos, and contact fields live in the settings model and can be changed via the admin API or seed data.
- **Payment:** configure **`PAYMENT_API_KEY`** and **`PAYMENT_SIMULATOR_URL`**; gateway integration lives under `src/modules/payment` (simulator gateway + webhook handling for bookings).

For request/response behavior, follow controllers and `*/logic.ts` under each module.
