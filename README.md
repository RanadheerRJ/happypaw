# Happy Paw — fresh dog food

> **Real food. Real happy paws.**
> Gently cooked, vet-formulated fresh dog meals, portioned for your dog and delivered weekly across Hyderabad.

React 18 + Vite + TypeScript single-page app with a live **Supabase** backend — auth, catalog,
customer portal (dogs, subscriptions, orders, deliveries, support, settings) and a public
marketing site, all behind one typed `DataClient`.

| | |
|---|---|
| **Market** | Hyderabad, Telangana, India · INR |
| **Backend** | Supabase (`pghtjewnyogtbbigjanm`) — Postgres, RLS, auth, storage |
| **Runs on** | GitHub Pages (static SPA, hash routing) |
| **Payments** | Placeholder gateway. Checkout records a `pending` payment; no money moves until a provider is connected |

---

## 1. Quick start

```bash
npm install
cp .env.example .env      # set the Supabase URL + anon key
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
| `VITE_SUPABASE_URL` | URL | Public Supabase project URL (required) |
| `VITE_SUPABASE_ANON_KEY` | key | Public anon key (required) |
| `VITE_BASE_PATH` | `/` or `/<repo>/` | Vite `base` for GitHub Pages |
| `VITE_ROUTER_MODE` | `hash` \| `browser` | `hash` is the GitHub Pages default |

Missing required vars are reported to the console at boot via `assertEnv()`.

---

## 3. Data layer

```
src/data/
  client.ts        ← the typed DataClient interface (the contract every consumer codes against)
  index.ts         ← `dataClient` export — always the live Supabase adapter
  supabase/        ← the Supabase adapter (the only place @supabase/supabase-js is imported)
  types.ts         ← domain types mirroring the Postgres schema
src/test/
  fakeDataClient.ts ← in-memory DataClient double for UI tests (never shipped)
```

Every feature is written against `DataClient`, so the UI never knows the source. The production app
always talks to Supabase; the test double keeps UI tests hermetic without touching the network.

---

## 4. What exists today

### Public site

| Route | Notes |
|---|---|
| `/` | Hero, why-fresh, how-it-works, weekly menu, plans, vet trust, testimonials + marquee, delivery checker, FAQ, CTA |
| `/menu` | This week's published menu, full ingredients/allergens, kitchen process, recipe library |
| `/how-it-works` | 4-step process, sourcing, food safety, transition guide, schedule |
| `/plans` | All 9 plans, per-day + per-week maths, comparison table, add-ons, cut-off explainer |
| `/plans/:slug` | Plan detail, portion guidance, allergen policy, sticky price card |
| `/vets` | Partner programme pitch, three-step onboarding, portal preview |
| `/about` | Story, kitchen transparency, what goes in / never goes in |
| `/faq` | 11 questions, `FAQPage` JSON-LD |
| `/contact` | Validated contact form (creates a support lead server-side), contact details |
| `/delivery-areas` | Pincode checker across the seeded areas + waitlist capture |
| `/legal/terms` · `/privacy` · `/refunds` · `/food-safety` | Draft documents, clearly marked pending legal review |
| `/login` · `/signup` · `/forgot-password` · `/reset-password` | Full validation, real Supabase auth |
| `/403` · `*` | Forbidden and NotFound |
| `/app` | Customer portal (see below) — role-gated to `customer` |
| `/vet` · `/admin` | Guarded role entry points (portal screens land in later phases) |

### Customer portal

| Route | What it does |
|---|---|
| `/app` | Dashboard: next delivery, active plan, dogs, recent orders, open tickets |
| `/app/dogs` · `/app/dogs/new` · `/app/dogs/:id` · `/app/dogs/:id/edit` | Dog list, 4-step onboarding wizard, profile with weight chart + diet plan, edit |
| `/app/subscribe` | 4-step checkout: dog → plan → extras/address/coupon → review, then the online-payment dialog |
| `/app/subscriptions` · `/app/subscriptions/:id` | Pause (with resume date), resume, skip next, change plan, edit add-ons, change address, cancel with reason |
| `/app/orders` · `/app/orders/:id` | Filterable order history and a print/PDF invoice with the payment reference |
| `/app/deliveries` | Upcoming boxes with a kitchen → van → door timeline, plus past deliveries |
| `/app/support` · `/app/support/:id` | Raise a ticket (category + priority) and reply in the thread |
| `/app/settings` | Profile, saved addresses, notification toggles, password change, delete account |

Every mutation goes through `DataClient`. Pause / skip / cancel and notification toggles update
optimistically and roll back on failure.

**Coupons:** `FIRSTBOX` (20% off, min ₹500), `HYDERABAD150` (₹150 off, min ₹999). Checkout creates an
order, order items and a payment row with `status: 'pending'` — the placeholder gateway records the
payment but no money is captured until a provider is connected.

### Auth & guards

Supabase auth with auto-confirmed sign-ups. `RequireRole` redirects signed-out users to
`/login?next=…` and wrong-role users to `/403`. **Guards decide where to send someone — they are not the
security boundary.** Supabase RLS policies are the boundary.

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

## 5. Supabase setup

The database lives in `supabase/migrations/` (schema, catalog seed, helper RPCs) with RLS on **every**
table. Apply them with the CLI:

```bash
supabase link --project-ref pghtjewnyogtbbigjanm
supabase db push
```

Rules the schema enforces:

* Roles (`customer` / `vet` / `admin`) live in `profiles.role` and are set by a `security definer`
  trigger — never by the client.
* Customers can read/write only their own rows; vets see only referred dogs; admins get full access via
  an `EXISTS` policy.
* Public read on `plans`, `addons`, `recipes`, published `weekly_menus`, active `delivery_zones`.
* Storage buckets `dog-photos` and `recipe-photos` are owner-scoped for writes.

Checkout is a single `SECURITY DEFINER` RPC (`create_subscription_checkout`) that validates sign-in,
dog ownership, plan and address zone, locks the coupon, computes the next Sunday delivery and inserts
the subscription + order + payment in one transaction.

---

## 6. GitHub Pages deployment

Wired in `.github/workflows/deploy.yml`:

1. Push to `main`.
2. **Settings → Pages → Source: GitHub Actions.**
3. The workflow applies Supabase migrations (if the DB secrets are set), lints, typechecks, tests,
   builds with `VITE_BASE_PATH=/<repo>/`, then deploys `dist`.

Required repository configuration:

* **Settings → Variables:** `VITE_SUPABASE_ANON_KEY` (the publishable key).
* **Settings → Secrets:** `SUPABASE_ACCESS_TOKEN` + `SUPABASE_DB_PASSWORD` (a personal access token —
  the integration token cannot read Actions secrets). If these are absent the migration job skips; the
  schema is already applied and the build still deploys.

Notes:

* **HashRouter is the default** (`VITE_ROUTER_MODE=hash`), so deep links work on Pages without server
  rewrites. URLs look like `https://<user>.github.io/<repo>/#/plans/weekly-fresh-small`.
* `dist/.nojekyll` is added to the build so folders starting with `_` are served.
* For a `<user>.github.io` repository set `VITE_BASE_PATH=/`.

### Troubleshooting: the Pages URL loads but shows nothing

**Symptom:** `https://<user>.github.io/<repo>/` returns 200 but the page is blank, and the page source is
the repository's raw `index.html` (it contains `<script type="module" src="/src/main.tsx">`).

**Cause:** Pages is using the **legacy branch build** (`build_type: legacy`, source `main` `/`) instead of
the Actions artifact. The workflow still goes green — build, upload and `deploy-pages` all succeed — but
its artifact is never served.

**Fix (once, requires repo admin):** **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Then re-run the workflow or push to `main`.

Verify:

```bash
gh api repos/<owner>/<repo>/pages --jq '{build_type, source, status}'   # expect build_type "workflow"
```

The deploy workflow checks this before building and fails with these same instructions if Pages is
misconfigured, so a blank deploy cannot pass silently again.

### Switching to BrowserRouter later

1. Set `VITE_ROUTER_MODE=browser` (the app picks `BrowserRouter` instead of `HashRouter`).
2. Add `public/404.html` that stores the path and redirects to `index.html` (the standard
   `spa-github-pages` technique), or host on a platform with SPA rewrites (Vercel/Netlify/Cloudflare).
3. Update `robots.txt` and the sitemap domain.

---

## 7. Project structure

```
src/
  config/         brand.ts, pricing.ts, assets.ts, nav.ts, env.ts, legal.ts, faqs.ts
  data/           index.ts, client.ts, types.ts, supabase/
  components/
    ui/           button, input, label, badge, card, accordion, dialog, checkbox,
                  select, tabs, skeleton (shadcn-style, Radix primitives)
    marketing/    Header, Footer, Hero, sections, PlanCard, RecipeCard, PincodeChecker…
    shared/       SEO, Reveal, SectionHeading, StatCounter, EmptyState, Logo,
                  ErrorBoundary, RouteFallback
    app/          PortalLayout, PortalHeader/status badges, ConfirmDialog,
                  OnlineCheckoutDialog, AddressFormDialog, WeightChart
    layout/       PublicLayout
  features/auth/  AuthProvider, RequireRole, AuthShell
  features/portal/DogWizard
  hooks/          useCatalog, usePortal (TanStack Query queries + mutations)
  lib/            validators, format, dates, portal helpers, motion helpers, utils
  pages/          public/, portal/, app/
  styles/         globals.css (design tokens, grain, print, reduced motion)
  test/           Vitest setup + in-memory DataClient fake
supabase/         migrations/, config.toml
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
`src/config/assets.ts` (with intrinsic `width`/`height` to avoid layout shift). They are AI-generated
photographs. To swap in Unsplash, replace `src` with the Unsplash URL and update the alt text — no other
file needs to change.

---

## 8. Tests

```bash
npm run test          # 57 tests
npm run test:watch
```

Coverage today:

* Zod validators — phone normalisation (`+91[6-9]\d{9}`), pincode, password, signup consent/mismatch, dog
  weight and DOB bounds, image type/size, portion and weight-band helpers.
* Pricing — published prices, 10% monthly maths, per-day rounding, savings badge, seeded areas.
* Role guards — signed-out redirect, correct-role access, cross-role `403`.
* Page smoke tests — every public page, all three portal previews and all eight customer portal pages
  render with the right heading.
* Checkout flow — dog → plan → coupon → review → payment end to end against the in-memory fake, asserting
  the order and its `pending` payment.

UI tests run against an in-memory `DataClient` fake (`src/test/fakeDataClient.ts`) — no network or
database required.

---

## 9. Accessibility & quality

* Semantic landmarks, one `h1` per page, visible focus rings, skip-to-content link, labelled icon buttons,
  `aria-live` result regions, labelled form fields with field-level errors.
* Keyboard-navigable Radix primitives (accordion, dialog, checkbox, tabs).
* Contrast tuned to WCAG AA for body and small text; colour is never the only signal.
* Loading uses shimmer skeletons (never spinners for content); empty and error states exist for every data
  view (empty state component + retry pattern).
* Route-level code splitting, lazy images, self-hosted fonts.

## 10. Compliance guardrails

* No real payments, no Razorpay SDK, no API keys, no secrets committed — `.env.example` only.
* No medical claims: every health-adjacent page carries the vet-advice disclaimer.
* Legal pages are marked **Draft — pending legal review**.

---

## 11. Scripts reference

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

_Happy Paw is a working brand name; prices, testimonials and policies are illustrative._
