# PrepplusHub — Marketplace

A full-stack marketplace connecting independent makers and small vendors with shoppers.
React/Vite frontend, Spring Boot + MongoDB backend, Paystack payments, and a Claude-powered
shopping assistant.

## Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, GSAP
- **Backend**: Spring Boot 3 (Java 17), Spring Security + JWT, MongoDB
- **Payments**: Paystack
- **AI chat**: Anthropic Claude (streaming), grounded in the live product catalog

## Project structure

```
src/                      React frontend
  pages/                  14 screens (auth, dashboards, checkout, product pages, admin, etc.)
  features/auth/          Registration, OTP verification, login, auth Redux slice
  store/slices/           catalogSlice (products/cart/orders/reviews), adminSlice
  components/             Navbar, Footer, ChatWidget, product cards, marketing sections
  lib/                    api.js (backend client), chat.js, paystack.js

backend/                  Spring Boot backend
  src/main/java/com/prepplushub/
    controller/           REST endpoints (auth, products, cart, orders, payments, reviews, chat)
    service/              Business logic
    model/                MongoDB documents
    repository/           Spring Data MongoDB repositories
    security/             JWT auth filter + helpers
    config/                Security, CORS, Paystack, Anthropic client config, data seeding
```

## Local setup

### Frontend

```bash
npm install
cp .env.example .env   # fill in VITE_PAYSTACK_PUBLIC_KEY
npm run dev            # http://localhost:5173, proxies /api to localhost:8080
```

### Backend

```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, PAYSTACK_SECRET_KEY, ANTHROPIC_API_KEY
./run-local.ps1         # loads .env and runs `mvn spring-boot:run` (Windows/PowerShell)
```

Set `APP_DEV_MODE=true` in `backend/.env` for local testing — this echoes OTP codes back in
the auth API responses (surfaced in the UI as a dev banner) instead of requiring real email
delivery, which isn't wired up yet.

## Route map

| Screen | Route |
|---|---|
| Landing | `/` |
| Auth entry / Login | `/auth`, `/login` |
| Registration | `/register` |
| OTP verification | `/verify-otp` |
| Role confirmation | `/role-confirmation` |
| Customer onboarding quiz | `/onboarding/quiz` |
| Vendor eligibility | `/onboarding/vendor` |
| Customer dashboard | `/customer/dashboard` |
| Vendor dashboard | `/vendor/dashboard` |
| Admin dashboard | `/admin` |
| Profile | `/profile` |
| Product detail / browse | `/products/:id`, `/products` |
| Checkout | `/checkout` |
| Terms & Privacy | `/terms` |

## Deployment

- **Backend → Render**: `render.yaml` at the repo root defines the web service (builds via
  the included Maven wrapper). Set `MONGODB_URI`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`,
  `ANTHROPIC_API_KEY`, and `ALLOWED_ORIGINS` (your Netlify URL) as environment variables in
  the Render dashboard — they're intentionally not stored in the blueprint.
- **Frontend → Netlify**: `netlify.toml` builds with `npm run build` and publishes `dist/`.
  It proxies `/api/*` to the Render backend (edit the placeholder URL in `netlify.toml` once
  the backend is deployed) so the frontend can keep calling same-origin `/api` in both dev
  and production, sidestepping CORS entirely.

## What's real vs. mocked

Wired to the backend and MongoDB: auth (register/OTP/login), product catalog, cart, orders,
Paystack checkout, product/vendor reviews (with live rating recalculation), and the AI chat
assistant.

Still frontend-only (Redux state, resets on refresh): wishlist, vendor eligibility
submissions, and admin curation (featured categories, vendor approval queue). These would
follow the same pattern as reviews — a MongoDB model + REST controller + a Redux thunk
swap — if/when they need to persist.
