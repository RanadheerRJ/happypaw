# Happy Paw — fresh dog food (demo build)

> **Real food. Real happy paws.**
> Gently cooked, vet-formulated fresh dog meals, portioned for your dog and delivered weekly across Hyderabad.

An internal partner demo **and** a real architecture: React 18 + Vite + TypeScript on the front end, with a
swappable data layer so the same UI runs on in-browser demo fixtures today and Supabase tomorrow.

| | |
|---|---|
| **Market** | Hyderabad, Telangana, India · INR |
| **Current state** | Phase 1 (foundation) + Phase 2 (public marketing site) complete |
| **Runs on** | GitHub Pages, zero backend (mock data mode) |
| **Payments** | Simulated. No Razorpay SDK, no keys, no real money |

---

## 1. Quick start

```bash
npm install
cp .env.example .env      # mock mode + demo mode is the default
npm run dev               # http://localhost:5173
```

Quality gates (all green in CI):

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
```

Node 20+ recommended (developed on Node 22).

---

## 2. Environment variables

Only `VITE_*` variables reach the browser. **Never** put a Supabase service-role key in this project —
the anon key is the only database credential the client may hold.

| Variable | Values | Purpose |
|---|---|---|
| `VITE_DATA_MODE` | `mock` \| `supabase` | Which data adapter the UI talks to |
| `VITE_DEMO_MODE` | `true` \| `false` | Demo logins, dev role switcher, reset button, `noindex` |
| `VITE_SUPABASE_URL` | URL | Public Supabase project URL (Phase 6) |
| `VITE_SUPABASE_ANON_KEY` | key | Public anon key (Phase 6) |
| `VITE_BASE_PATH` | `/` or `/<repo>/` | Vite `base` for GitHub Pages |
| `VITE_ROUTER_MODE` | `hash` \| `browser` | `hash` is the GitHub Pages default |

Invalid combinations are logged to the console at boot via `assertEnv()`.

---

## 3. Data modes (the important architectural bit)

```
src/data/
  client.ts        ← the typed DataClient interface both adapters implement
  index.ts         ← `dataClient` export chosen by VITE_DATA_MODE (the only import the UI uses)
  mock/            ← in-browser fixtures + localStorage, simulated latency
  supabase/        ← real Supabase adapter (Phase 6)
  fixtures/        ← deterministic seed data shared by mock mode and the SQL seed
  types.ts         ← domain types mirroring the Postgres schema
```

* **`mock`** — fully in-memory/localStorage database seeded from fixtures on first run, with fake auth and
  150–400 ms simulated latency so skeletons and pending states are real. Persisted under
  `happypaw:mockdb:v1`. Works on GitHub Pages with no backend.
* **`supabase`** — the real client. **Nothing outside `src/data/supabase/` may import
  `@supabase/supabase-js`.** Adapter implementation lands in Phase 6 (see roadmap).

Every feature is written against `DataClient`, so switching mode never changes a component.

### Demo data controls

* **Reset demo data** — footer link, admin settings (Phase 5), and the floating `Demo` pill.
* **Floating role switcher** — visible only when `VITE_DEMO_MODE=true` and a session exists; jumps between
  customer, vet and admin demo accounts.
* Seeded accounts (password `Demo@1234` for all):

| Role | Email | Where it lands |
|---|---|---|
| Customer | `priya@happypaw.in` | `/app` |
| Customer (alt) | `arjun@happypaw.in` | `/app` |
| Veterinarian | `meera@happypaw.in` | `/vet` |
| Owner / admin | `admin@happypaw.in` | `/admin` |

You can also one-click any of these from `/login` when demo mode is on.

---

## 4. What exists today

### Public site (complete)

| Route | Notes |
|---|---|
| `/` | Hero, why-fresh, how-it-works, weekly menu, plans, vet trust, demo testimonials + marquee, delivery checker, FAQ, CTA |
| `/menu` | This week's published menu, full ingredients/allergens, kitchen process, recipe library |
| `/how-it-works` | 4-step process, sourcing, food safety, transition guide, schedule |
| `/plans` | All 9 plans, per-day + per-week maths, comparison table, add-ons, cut-off explainer |
| `/plans/:slug` | Plan detail, portion guidance, allergen policy, sticky price card |
| `/vets` | Partner programme pitch, three-step onboarding, demo dashboard preview |
| `/about` | Story, kitchen transparency, what goes in / never goes in, demo disclosures |
| `/faq` | 11 questions, `FAQPage` JSON-LD |
| `/contact` | Validated contact form (demo — nothing is sent), contact details |
| `/delivery-areas` | Pincode checker across 10 seeded areas + waitlist capture |
| `/legal/terms` · `/privacy` · `/refunds` · `/food-safety` | Draft documents, clearly marked pending legal review |
| `/login` · `/signup` · `/forgot-password` | Full validation, mock auth, demo logins |
| `/403` · `*` | Forbidden and NotFound |
| `/app` | Customer portal (see below) — role-gated to `customer` |
| `/vet` · `/admin` | Guarded role entry points (portal screens land in Phases 4–5) |

### Customer portal (Phase 3, complete)

| Route | What it does |
|---|---|
| `/app` | Dashboard: next delivery, active plan, dogs, recent orders, open tickets |
| `/app/dogs` · `/app/dogs/new` · `/app/dogs/:id` · `/app/dogs/:id/edit` | Dog list, 4-step onboarding wizard, profile with weight chart + diet plan, edit |
| `/app/subscribe` | 4-step checkout: dog → plan → extras/address/coupon → review, then the simulated Razorpay modal |
| `/app/subscriptions` · `/app/subscriptions/:id` | Pause (with resume date), resume, skip next, change plan, edit add-ons, change address, cancel with reason |
| `/app/orders` · `/app/orders/:id` | Filterable order history and a print/PDF invoice with the simulated payment reference |
| `/app/deliveries` | Upcoming boxes with a kitchen → van → door timeline, plus past deliveries |
| `/app/support` · `/app/support/:id` | Raise a ticket (category + priority) and reply in the thread |
| `/app/settings` | Profile, saved addresses, notification toggles, password change, delete account |

Every mutation goes through `DataClient`, so the same UI works against the mock fixtures and (from Phase 6)
Supabase. Pause / skip / cancel and notification toggles update optimistically and roll back on failure.

**Demo coupons:** `FIRSTPAW` (15% off, min ₹749), `HYD100` (₹100 off, min ₹999), `VETLOVE` (10% off),
`SUNDAY50` (deliberately expired). The checkout never calls Razorpay: there is no SDK and no key. It creates
an order, order items and a payment row with `status: 'simulated'`.

### Auth & guards

Mock auth persists a session in localStorage. `RequireRole` redirects signed-out users to
`/login?next=…` and wrong-role users to `/403`. **Guards decide where to send someone — they are not the
security boundary.** Supabase RLS policies are the boundary (Phase 6).

### Pricing shown

| Plan | Price | Duration |
|---|---|---|
| Starter Trial Box | ₹299 | 3 days (one per household) |
| Weekly Fresh — Small (≤10 kg) | ₹749/week | 7 days, 2 meals/day |
| Weekly Fresh — Medium (10–25 kg) | ₹1,099/week | 7 days |
| Weekly Fresh — Large (25–40 kg) | ₹1,499/week | 7 days |
| Monthly Fresh (4 weeks prepaid, 10% off) | ₹2,696 / ₹3,956 / ₹5,396 | 28 days |
| Fresh Topper | ₹349/week | 7 days |
| Special Diet | from ₹1,299/week | requires vet consult |

Cut-off: **order by Thursday 11:59 PM for Sunday delivery, 7 AM – 12 PM.** Values live in
`src/config/pricing.ts` and are unit-tested.

---

## 5. Phase status & roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Foundation: scaffold, design system, config, mock data layer, routing, 403/404, README | ✅ done |
| 2 | Public marketing site, pricing, menu, delivery checker, animations, legal drafts, auth UI | ✅ done |
| 3 | Auth + customer portal (dog wizard, subscription checkout, orders, deliveries, support, settings) | ✅ done |
| 4 | Vet portal | ⏳ |
| 5 | Admin portal (kitchen prep list, delivery routes, CRUD, ⌘K) | ⏳ |
| 6 | Supabase migrations, RLS, seed SQL, adapter, parity tests | ⏳ |
| 7 | Accessibility audit, Lighthouse pass, state sweep, README finalisation | ⏳ |

The `/vet` and `/admin` routes still confirm role-based entry and list what each portal will contain. They
are replaced by real dashboards in Phases 4–5; `/app` is now the real customer portal.

---

## 6. GitHub Pages deployment

Already wired in `.github/workflows/deploy.yml`:

1. Push to `main`.
2. **Settings → Pages → Source: GitHub Actions.**
3. The workflow lints, typechecks, tests, builds with `VITE_BASE_PATH=/<repo>/`, then deploys `dist`.

Notes:

* **HashRouter is the default** (`VITE_ROUTER_MODE=hash`), so deep links work on Pages without server
  rewrites. URLs look like `https://<user>.github.io/<repo>/#/plans/weekly-fresh-small`.
* `public/.nojekyll` is copied into the build so folders starting with `_` are served.
* For a `<user>.github.io` repository set `VITE_BASE_PATH=/`.
* Demo builds are `noindex` (via `VITE_DEMO_MODE`) and `robots.txt` disallows crawling.

### Troubleshooting: the Pages URL loads but shows nothing

**Symptom:** `https://<user>.github.io/<repo>/` returns 200 but the page is blank, and the page source is the
repository's raw `index.html` (it contains `<script type="module" src="/src/main.tsx">`).

**Cause:** Pages is using the **legacy branch build** (`build_type: legacy`, source `main` `/`) instead of the
Actions artifact. The "Deploy to GitHub Pages" workflow still goes green — build, upload and `deploy-pages`
all succeed — but its artifact is never served, so the raw repo root is published instead.

**Fix (once, requires repo admin):** **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Then re-run the latest *Deploy to GitHub Pages* workflow (Actions → the run → *Re-run all jobs*) or push to
`main`.

Verify:

```bash
gh api repos/<owner>/<repo>/pages --jq '{build_type, source, status}'   # expect build_type "workflow"
```

The deploy workflow now checks this before building and fails with these same instructions if Pages is
misconfigured, so a blank deploy cannot pass silently again.

### Switching to BrowserRouter later

1. Set `VITE_ROUTER_MODE=browser` (the app picks `BrowserRouter` instead of `HashRouter`).
2. Add `public/404.html` that stores the path and redirects to `index.html` (the standard
   `spa-github-pages` technique), or host on a platform with SPA rewrites (Vercel/Netlify/Cloudflare).
3. Update `robots.txt` and remove the `Disallow` line once the site is public.

---

## 7. Supabase setup (Phase 6 — schema is designed, adapter pending)

The planned database lives in `supabase/migrations/` with RLS on **every** table, plus `supabase/seed.sql`.
Until Phase 6 ships, `VITE_DATA_MODE=supabase` fails fast with a clear error rather than silently using mock
data.

When implemented:

```bash
supabase link --project-ref <ref>
supabase db push                    # applies migrations
psql "$DATABASE_URL" -f supabase/seed.sql
```

Rules the schema enforces:

* Roles (`customer` / `vet` / `admin`) live in `profiles.role` and are set by a `security definer` trigger —
  never by the client.
* Customers can read/write only their own rows; vets see only referred dogs; admins get full access via an
  `EXISTS` policy.
* Public read on `plans`, `addons`, `recipes`, published `weekly_menus`, active `delivery_zones`.
* Storage buckets `dog-photos` and `recipe-photos` are owner-scoped for writes.

### SQLite note (local development only)

The brief allows a SQLite adapter as a *local convenience* (e.g. via Drizzle) for faster iteration without a
Supabase project. **SQLite must never ship in the deployed build** — GitHub Pages is static, and the deployed
database is Postgres/Supabase. If a SQLite dev adapter is added, it belongs in `src/data/sqlite/`, behind the
same `DataClient` interface, and must be excluded from the production bundle.

---

## 8. Project structure

```
src/
  config/         brand.ts, pricing.ts, assets.ts, nav.ts, env.ts, legal.ts, faqs.ts
  data/           index.ts, client.ts, types.ts, mock/, supabase/, fixtures/
  components/
    ui/           button, input, label, badge, card, accordion, dialog, checkbox,
                  select, tabs, progress, skeleton (shadcn-style, Radix primitives)
    marketing/    Header, Footer, Hero, sections, PlanCard, RecipeCard, PincodeChecker…
    shared/       SEO, Reveal, SectionHeading, StatCounter, EmptyState, Logo,
                  DemoBanner, DemoSwitcher, RouteFallback
    app/          PortalLayout, PortalHeader/status badges, ConfirmDialog,
                  SimulatedCheckoutDialog, AddressFormDialog, WeightChart
    layout/       PublicLayout
  features/auth/  AuthProvider, RequireRole, AuthShell
  features/portal/DogWizard
  hooks/          useCatalog, usePortal (TanStack Query queries + mutations)
  lib/            validators, format, dates, portal helpers, motion helpers, utils
  pages/          public/, portal/, app/
  styles/         globals.css (design tokens, grain, print, reduced motion)
  test/           Vitest setup
supabase/         migrations/, seed.sql, policies.sql     (Phase 6)
.github/workflows/deploy.yml
```

### Design system

* Palette: cream `#FBF7F0`, forest `#1F3D2B`, terracotta `#D96C3F`, sage `#A8C3A0`, charcoal `#2B2B2B` —
  defined once in `tailwind.config.ts`.
* Type: **Manrope** (display), **Inter** (body), **Fraunces** italic (editorial accents), self-hosted via
  Fontsource (no Google Fonts request).
* Cards 20–24 px radius, soft shadows, subtle SVG grain, 4 px hover lift, 1.03 image zoom.
* Motion: 200–600 ms, fade + 16 px rise on scroll with 60 ms stagger, word-by-word hero reveal, animated
  counters, pausable marquee. **Everything non-essential is disabled under `prefers-reduced-motion`.**

### Imagery

All images live in `public/images/` as compressed WebP and are referenced only from
`src/config/assets.ts` (with intrinsic `width`/`height` to avoid layout shift). They are AI-generated demo
photographs. To swap in Unsplash, replace `src` with the Unsplash URL and update the alt text — no other file
needs to change.

---

## 9. Tests

```bash
npm run test          # 88 tests
npm run test:watch
```

Coverage today:

* Zod validators — phone normalisation (`+91[6-9]\d{9}`), pincode, password, signup consent/mismatch, dog
  weight and DOB bounds, image type/size, portion and weight-band helpers.
* Pricing — published prices, 10% monthly maths, per-day rounding, savings badge, seeded areas.
* Mock adapter CRUD — catalog ordering/active flags, weekly menu composition, pincode checks, waitlist
  de-duplication, auth (sign-in, wrong password, signup, signout), reset.
* Customer adapter — dog create/update/weigh-in (with the pending diet plan), addresses and default flag,
  coupon validation (percent, flat, minimum order, inactive, unknown), simulated checkout (order + items +
  `simulated` payment), pause/resume/skip/change-plan/add-ons/address/cancel state machine, support ticket
  create + reply, notification prefs, password change, soft-deleted account cannot sign in.
* Role guards — signed-out redirect, correct-role access, cross-role `403`.
* Page smoke tests — every public page, all three portal previews and all eight customer portal pages render
  with the right heading.

---

## 10. Accessibility & quality

* Semantic landmarks, one `h1` per page, visible focus rings, skip-to-content link, labelled icon buttons,
  `aria-live` result regions, labelled form fields with field-level errors.
* Keyboard-navigable Radix primitives (accordion, dialog, checkbox, tabs).
* Contrast tuned to WCAG AA for body and small text; colour is never the only signal.
* Loading uses shimmer skeletons (never spinners for content); empty and error states exist for every data
  view (empty state component + retry pattern).
* Route-level code splitting, lazy images, self-hosted fonts, no console errors in mock mode.

## 11. Compliance guardrails

* No real payments, no Razorpay SDK, no API keys, no secrets committed — `.env.example` only.
* No medical claims: every health-adjacent page carries the vet-advice disclaimer.
* Legal pages are marked **Draft — pending legal review**.
* Demo testimonials and figures are explicitly labelled as illustrative.

---

## 12. Scripts reference

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on `0.0.0.0:5173` |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | `tsc --noEmit`, strict mode |
| `npm run test` | Vitest (jsdom + Testing Library) |
| `npm run format` | Prettier |

---

_Built as an internal partner demo. Happy Paw is a working brand name; prices, testimonials, credentials and
policies are illustrative._

---

## 13. Checking in (Phase 3 review)

This build is the Phase 1–3 checkpoint:

* Every public route renders, is responsive, and is reachable by hash deep link.
* The customer portal works end to end in mock mode: add a dog → checkout with a coupon → simulated
  payment → pause/skip/change/cancel → invoice → support thread → settings, with no network calls.
* All data comes through `DataClient`; role guards, demo logins and the floating role switcher still work.
* `lint`, `typecheck`, `test` (88 tests) and `build` all pass.
* `/vet` and `/admin` remain role-gated placeholders that list the Phase 4–5 scope.

Next up: Phase 4 (vet portal) against the same mock fixtures.
