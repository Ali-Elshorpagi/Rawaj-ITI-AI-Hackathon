# GymDesk Frontend

Angular 18 SPA for the GymDesk gym management platform.

## Tech Stack

- **Framework:** Angular 18 (standalone components, no NgModules)
- **State:** Angular Signals (`signal`, `computed`, `effect`)
- **HTTP:** HttpClient with functional interceptors
- **UI:** Angular Material (custom GymDesk palette)
- **Charts:** Chart.js via ng2-charts
- **i18n:** ngx-translate (English + Arabic, RTL support)
- **Toasts:** ngx-toastr
- **Spinner:** ngx-spinner
- **Real-time:** Pusher JS client

## Quick Start

```bash
cd frontend
npm install
cp src/environments/environment.ts src/environments/environment.local.ts
# Edit environment.ts with your API URL and Pusher key
npm start
```

App runs at `http://localhost:4200`

### Demo Login

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@gymdesk.com | Gym@1234 |
| Manager | manager@gymdesk.com | Gym@1234 |
| Reception | reception@gymdesk.com | Gym@1234 |
| Trainer | trainer@gymdesk.com | Gym@1234 |
| Member | member@gymdesk.com | Gym@1234 |

The login page also has quick-fill buttons for each demo account.

### Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Dev server at localhost:4200 |
| `npm run build` | Production build to `dist/` |
| `npm run build:staging` | Staging build |
| `npm test` | Karma unit tests |
| `npm run lint` | ESLint |

## Project Structure

```
src/app/
├── core/              # AuthService, ThemeService (Signal-based singletons)
├── guards/            # authGuard, guestGuard, roleGuard
├── interceptors/      # auth (token + refresh), error (toastr), loading (spinner)
├── layouts/           # AuthLayout, DashboardLayout (sidebar + header)
├── models/            # enums.ts, interfaces.ts (mirror of backend types)
├── services/          # ApiService (base), feature services
└── features/
    ├── auth/          # login, register, forgot-password, reset-password, verify-email
    ├── dashboard/     # Role-based KPIs + Chart.js charts
    ├── members/       # list (paginated + search), form (create/edit), detail
    ├── subscriptions/ # Plans with pricing cards
    ├── attendance/    # Daily list + check-in (manual + QR)
    ├── payments/      # List with refund + Stripe success/cancel pages
    ├── trainers/      # Grid with inline create/edit dialog
    ├── classes/       # List + weekly schedule calendar
    ├── reports/       # Attendance, revenue, membership, trainer-performance + export
    ├── notifications/ # List with mark-read and delete
    ├── settings/      # Appearance (dark/light, language), security, notifications, about
    ├── profile/       # Edit profile + photo upload + activity stats
    └── not-found/     # 404 page
```

## Key Patterns

### Signals

Services and components use `signal()` for reactive state instead of RxJS subjects:

```typescript
// AuthService
private readonly _currentUser = signal<User | null>(null);
readonly currentUser = this._currentUser.asReadonly();
readonly isLoggedIn = computed(() => !!this._currentUser());
```

### HTTP Interceptors (functional style)

```typescript
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]))
```

The auth interceptor handles token injection and automatic refresh on 401.

### RBAC Guards

```typescript
// app.routes.ts
canActivate: [authGuard, roleGuard([UserRole.OWNER, UserRole.MANAGER])]
```

### Theme + RTL

`ThemeService` toggles `data-theme="dark"` on `<html>` and `dir="rtl"` + `.rtl` class on `<body>` for Arabic. Font changes to IBM Plex Sans Arabic in RTL mode.

## Environment Configuration

`src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1',
  pusherKey: 'YOUR_PUSHER_KEY',
  pusherCluster: 'eu',
  stripePublishableKey: 'pk_test_...',
};
```

## Docker

```bash
# From project root — builds Angular and serves via nginx
docker-compose up frontend
```

The nginx config handles SPA routing (all paths fall back to `index.html`) and sets aggressive caching for hashed static assets.
