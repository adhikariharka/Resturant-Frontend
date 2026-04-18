# Harke — Restaurant Frontend

Next.js 16 customer, admin, and kitchen app for **The British Kitchen**. Built with React 19, TypeScript, RTK Query, NextAuth v5, Tailwind 4, Radix UI, Socket.io, and Stripe.

Pairs with the NestJS API in [`../Resturant-Backend`](../Resturant-Backend).

---

## Contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Features](#features)
4. [Test credentials](#test-credentials)
5. [Prerequisites](#prerequisites)
6. [Quick start](#quick-start)
7. [Environment variables](#environment-variables)
8. [Commands reference](#commands-reference)
9. [Project structure](#project-structure)
10. [Routing](#routing)
11. [State, data, and auth](#state-data-and-auth)
12. [Design system](#design-system)
13. [Deployment](#deployment)

---

## Overview

The app has three audiences served from a single codebase:

- **Customers** — browse the menu, add to cart, check out with Stripe, track orders in real time, leave reviews.
- **Admins** — run the restaurant: menu, categories, orders, opening hours, holidays, contact info, staff, settings.
- **Kitchen & delivery staff** — a real-time console where tickets flow through `placed → confirmed → cooking → on_the_way → delivered`.

Everyone signs in from the same **unified login page** (`/login`). The form tries the staff endpoint first and falls back to the customer credentials provider, then routes each person to the right dashboard based on their role.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI runtime | React 19 |
| Language | TypeScript 5 |
| Server data | RTK Query (`@reduxjs/toolkit/query/react`) |
| Global state | Redux Toolkit + Zustand (cart / auth hints) |
| Auth | NextAuth v5 (credentials + Google) · custom staff token in `localStorage` |
| Realtime | `socket.io-client` |
| Payments | Stripe Checkout (redirect) |
| Styling | Tailwind CSS 4 + `tailwind-merge` + `class-variance-authority` |
| Components | Radix UI primitives + `shadcn/ui`-style wrappers |
| Forms | `react-hook-form` + `zod` |
| Charts | Recharts |
| Toasts | Sonner |
| Icons | Lucide |

---

## Features

### Shared

- **Unified login** — one form for all users, routes by role
- **Forgot / reset password** email flow
- **Google sign-in** (customer/admin side)
- **Light/dark theme-ready** (tokens in `globals.css`)
- **Toast notifications** via Sonner
- **Responsive layout** (mobile-first)

### Customer

- **Home** — hero slider, category nav, popular items, a bento grid with live open-status & today's deal, a vertical-story strip of dishes, and feature cards
- **Menu**
  - All items grid with search & category filters
  - Category-based filtering from the URL (`/menu?category=classics`)
  - Food detail page (`/menu/[slug]`) with options (size, extras, spice, doneness), allergens, calories, add-to-cart
- **Cart** — quantity editing, subtotals, delivery threshold notice
- **Checkout** — address selector, payment method (card / cash), Stripe redirect
- **Order success / failure** — verifies Stripe session, retries failed payments
- **Orders** — list + details page with invoice view
- **Account** — profile, phone/avatar, address book, active sessions, log-out-everywhere
- **About / contact / allergens / terms / privacy / cancellation policy** static pages

### Admin (`/admin`)

- **Dashboard** — live stats (revenue, orders, popular items) via RTK Query
- **Orders** — searchable / status-filterable, per-order logs dialog
- **Menu items** — card grid with status filters; rich editor sheet with
  - auto-slug, discount price (validated lower than base), stock, prep time, calories
  - tag chips (type-to-add)
  - 14-allergen chip toggles
  - spice level picker
  - availability & popular flags
- **Categories** — card grid + sheet editor with description, display order, visibility toggle
- **Opening hours** — per-weekday open/close + closed days
- **Holidays** — year-aware admin-only CRUD
- **Contact info** — restaurant name, tagline, description, logo, email/phone/address, socials
- **Staff** — list + create staff (name / email / phone / password / permissions)
- **Settings** — tax, service charge, delivery fee, free-delivery threshold, min order, currency

### Kitchen / delivery (`/staff`)

- **Auth** — same `/login`; staff-admin lands in `/admin`, kitchen/delivery in `/staff`
- **Kanban board** — columns for `New`, `Confirmed`, `Cooking`, `On the way`
- **List view** — flat grid with search + status chips
- **Live updates** — Socket.io subscription; polling fallback every 45 s
- **Sound alert + toast** on new tickets (toggleable)
- **Stats bar** — active, new, urgent (>5 min), revenue today
- **Per-order drawer** — progress timeline, customer card with email/call buttons, delivery address with Google Maps link, itemised bill with snapshot names/images, cancel (admin only)
- **Permission-aware buttons** — kitchen can only progress `confirmed → cooking → on_the_way`; delivery can only mark `delivered`; admin can do anything
- **Connection pill & signed-in badge** in the header

---

## Test credentials

These match the seed in the backend — run `npm run db:seed` there first.

### Customer login (`/login`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@thebritishkitchen.co.uk` | `admin123` |
| Customer | `james@example.com` | `password123` |
| Customer | `emily@example.com` | `password123` |
| Customer | `oliver@example.com` | `password123` |
| Customer | `sophie@example.com` | `password123` |
| Customer | `rajesh@example.com` | `password123` |
| Customer | `mia@example.com` | `password123` |

### Staff login (same `/login`)

| Role | Email | Password | Permissions |
|---|---|---|---|
| Head Chef | `kitchen@thebritishkitchen.co.uk` | `kitchen123` | `kitchen` |
| Sous Chef | `priya@thebritishkitchen.co.uk` | `kitchen123` | `kitchen` |
| Rider | `marcus@thebritishkitchen.co.uk` | `delivery123` | `delivery` |
| Rider | `sofia@thebritishkitchen.co.uk` | `delivery123` | `delivery` |
| Floor Manager (admin) | `manager@thebritishkitchen.co.uk` | `manager123` | `kitchen`, `delivery`, `admin` |

> James (`james@example.com`) has a pre-loaded cart with three items so you can jump straight to checkout.

---

## Prerequisites

- Node.js 20 or 22
- The backend running on `http://localhost:8000` (or a hosted URL) with the seed applied
- A Google OAuth Client ID (must match the backend's `GOOGLE_CLIENT_ID`)

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# edit .env and point NEXT_PUBLIC_API_URL at the backend

# 3. Run
npm run dev
# -> http://localhost:3000
```

---

## Environment variables

`NEXT_PUBLIC_*` values are exposed to the browser; others stay server-side.

```env
# Backend API (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth
NEXTAUTH_SECRET=change-me-to-a-random-string       # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000                  # public URL of this app

# Google OAuth — must match the backend's GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

**Watch out for:**
- `NEXT_PUBLIC_API_URL` **must include the protocol** (`https://…`). Without it, relative URLs get resolved against the current page and every API call 404s.
- No trailing slash on either `NEXT_PUBLIC_API_URL` or `NEXTAUTH_URL`. The backend also reads `FRONTEND_URL` — keep it consistent.
- `NEXT_PUBLIC_*` values are **baked into the client bundle at build time**. If you change them on Vercel, you must redeploy for them to take effect.

---

## Commands reference

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

---

## Project structure

```
app/
├── (auth)/                 # login, signup, forgot/reset password
├── (customer)/             # public storefront
│   ├── page.tsx            # home (hero + bento + popular + vertical strip)
│   ├── menu/
│   │   ├── page.tsx        # menu grid
│   │   └── [slug]/page.tsx # food detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── [id]/invoice/page.tsx
│   ├── account/page.tsx
│   ├── order-success/page.tsx
│   ├── about/contact/terms/privacy/allergens/cancellation-policy/
├── admin/
│   ├── layout.tsx
│   ├── page.tsx            # dashboard
│   ├── orders/ categories/ menu/ hours/ contact-info/ staff/ settings/ reviews/
├── staff/
│   ├── layout.tsx
│   ├── page.tsx            # kitchen console
│   └── login/page.tsx      # redirects to /login
├── api/auth/[...nextauth]/ # NextAuth route handler
├── layout.tsx
└── globals.css
components/
├── account/                # profile, sessions, addresses
├── address/                # address selectors
├── admin/                  # admin dashboard widgets & content
├── auth/                   # login/signup forms, login dialog
├── cart/                   # cart view
├── checkout/               # checkout flow
├── food/                   # food cards & option selectors
├── home/                   # hero, bento grid, vertical strip, featured
├── layout/                 # site header + footer
├── menu/                   # menu grid + filters
├── orders/                 # order list/detail/invoice components
├── providers/              # store / session / google providers
├── skeletons/              # loading placeholders
├── staff/                  # staff dashboard + order card + drawer
└── ui/                     # shadcn-style Radix wrappers
lib/
├── staff-auth.ts           # localStorage staff session helper
├── store/
│   ├── api.ts              # RTK Query endpoints (single source of truth)
│   ├── auth-store.ts       # Zustand (user hints)
│   └── store.ts            # configureStore
├── types.ts                # shared types
├── use-staff-socket.ts     # Socket.io hook for the kitchen console
└── utils.ts                # cn()
auth.ts, auth.config.ts     # NextAuth wiring (credentials provider + Google)
middleware.ts               # host redirect + NextAuth authorise callback
```

---

## Routing

### Customer

| Path | Purpose |
|---|---|
| `/` | Home |
| `/menu` | Full menu (accepts `?category=` and `?filter=popular`) |
| `/menu/[slug]` | Food detail |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/order-success` | Post-checkout verification |
| `/orders` | Order list |
| `/orders/[id]` | Order detail |
| `/orders/[id]/invoice` | Printable invoice |
| `/account` | Profile, addresses, sessions |
| `/about` / `/contact` / `/terms` / `/privacy` / `/allergens` / `/cancellation-policy` | Static |

### Auth

| Path | Purpose |
|---|---|
| `/login` | Unified sign-in (customer + staff) |
| `/signup` | Customer registration |
| `/forgot-password` | Request reset email |
| `/reset-password` | Complete reset with token |

### Admin (gated)

| Path | Purpose |
|---|---|
| `/admin` | Dashboard |
| `/admin/orders` | Orders table + logs |
| `/admin/menu` | Menu items editor |
| `/admin/categories` | Category editor |
| `/admin/hours` | Opening hours |
| `/admin/contact-info` | Contact info editor |
| `/admin/staff` | Staff management |
| `/admin/reviews` | (currently mock) |

### Kitchen (gated)

| Path | Purpose |
|---|---|
| `/staff` | Live kitchen console |
| `/staff/login` | 301 → `/login` (kept for old bookmarks) |

---

## State, data, and auth

### Two parallel auth sources, one API

- **Customers / user-admins** sign in via NextAuth (`signIn("credentials")`), which hits `POST /auth/login` and stores a JWT inside the NextAuth session.
- **Staff / staff-admins** sign in directly against `POST /staff/auth/login` and the token is written to `localStorage` (`harke_staff_session`).

`lib/store/api.ts` reconciles them — `prepareHeaders` **tries the staff token first**, then falls back to the NextAuth session. That's what lets a staff-admin see `/admin` pages with their staff credentials.

### Why the login page tries staff first

The `/login` form calls the staff endpoint, and if that 401s, falls back to NextAuth. An admin in the `staff` table wins over a coincidental customer entry with the same email. The admin header shows which source the user signed in with (`staff token` badge vs NextAuth).

### RTK Query tags

Every endpoint has `providesTags` / `invalidatesTags` wired so edits across the dashboard refresh lists automatically (e.g. deleting a food item refreshes the menu grid).

### Cart

Server-side only — the cart lives on the backend (`cart_items` table). The frontend treats it as another RTK Query resource.

### Socket.io

`lib/use-staff-socket.ts` connects to the backend on mount when a staff session is present, joins the `staff_updates` room, and surfaces `new_order` / `order_updated` / connect/disconnect events. Audio alerts + toast notifications are wired in the staff dashboard.

### Middleware

`middleware.ts` does two things:

1. Redirects the legacy Vercel hostname to your production domain (`prajwolghimire.com.np`).
2. Runs the NextAuth `authorized` callback, which gates `/admin` and `/account` routes for the customer path.

(Staff gating lives inside the staff dashboard itself because staff sessions aren't NextAuth-managed.)

---

## Design system

- **Tailwind CSS 4** with CSS variables in `app/globals.css` (light + dark values)
- **`cn` helper** in `lib/utils.ts` (Tailwind + `class-variance-authority`)
- **Radix UI** primitives wrapped with shadcn-style variants under `components/ui/`
- **Serif accent** — `Playfair Display` (headings) via `next/font/google`
- **Body font** — `DM Sans`
- **Sonner toasts** (theme-aware)

Accent colours used across the app:

| Token | Role |
|---|---|
| `--primary` | Brand red |
| `--accent` | Warm highlight for popular items |
| `--muted` | Soft surfaces |
| `--card` | Panels & sheets |

---

## Deployment

The app is designed to be deployed on **Vercel**, with the backend on any Node host that can serve the WebSocket + REST API (Docker image included in the backend repo).

On Vercel, set the following environment variables **for the production environment**:

```
NEXT_PUBLIC_API_URL=https://<your-api-host>         # MUST include https://
NEXTAUTH_URL=https://<your-frontend-host>
NEXTAUTH_SECRET=<a long random string>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google oauth client id>
```

Then redeploy — `NEXT_PUBLIC_*` values are baked into the build, so re-saving env variables alone is not enough.

CORS is open on the backend (`origin: true`), so you don't need to allow-list the Vercel domain explicitly.

---

## License

Private project for educational use. No license granted.
