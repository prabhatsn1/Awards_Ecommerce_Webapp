# AwardCraft — Production-Ready E-Commerce Platform

A fully production-ready, scalable e-commerce application for selling and customising bespoke awards and trophies, built with **Next.js 16 App Router**, **Supabase**, and **Stripe**.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | Custom shadcn-compatible + Radix UI primitives |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + cookie sessions) |
| File Storage | Supabase Storage |
| Payments | Stripe Checkout + Webhooks |
| State | Zustand (cart + UI) |
| Forms | React Hook Form + Zod validation |
| SEO | Next.js Metadata API + JSON-LD structured data |

---

## Project Structure

```
award_ecommerce/
├── app/
│   ├── page.tsx                          # Homepage
│   ├── layout.tsx                        # Root layout + metadata
│   ├── not-found.tsx                     # 404 page
│   ├── robots.ts                         # robots.txt generator
│   ├── sitemap.ts                        # Dynamic sitemap generator
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/
│   │   ├── page.tsx                      # Checkout form + Stripe redirect
│   │   └── success/page.tsx              # Post-payment confirmation
│   ├── products/
│   │   ├── page.tsx                      # Shop with filters/search
│   │   └── [slug]/page.tsx               # Product detail
│   ├── customise/[slug]/page.tsx         # Award customisation studio
│   ├── dashboard/
│   │   ├── page.tsx                      # User dashboard
│   │   ├── orders/page.tsx               # Order history
│   │   ├── orders/[id]/page.tsx          # Order detail
│   │   └── profile/page.tsx              # Profile settings
│   ├── admin/
│   │   ├── layout.tsx                    # Admin role guard
│   │   ├── page.tsx                      # Admin dashboard
│   │   ├── products/page.tsx             # Product list
│   │   ├── products/new/page.tsx         # Create product
│   │   ├── products/[id]/edit/page.tsx   # Edit product
│   │   ├── orders/page.tsx               # Order list
│   │   └── orders/[id]/page.tsx          # Manage order status
│   └── api/
│       ├── auth/callback/route.ts        # Supabase OAuth callback
│       ├── checkout/route.ts             # Create Stripe session
│       ├── webhooks/stripe/route.ts      # Stripe webhook handler
│       ├── products/route.ts             # Public products API
│       ├── products/[id]/route.ts
│       ├── orders/route.ts               # Authenticated orders API
│       ├── orders/[id]/route.ts
│       ├── admin/products/route.ts       # Admin product CRUD
│       ├── admin/products/[id]/route.ts
│       └── admin/orders/[id]/route.ts    # Admin order status update
│
├── components/
│   ├── ui/                               # Base components (Button, Input, Card…)
│   ├── layout/                           # Header, Footer, MobileNav, UserMenu, CartButton
│   ├── home/                             # Hero, FeaturedProducts, Categories, WhyUs
│   ├── products/                         # ProductCard, ProductGrid, ProductImages, ProductFilters
│   ├── cart/                             # CartDrawer, CartItemRow
│   ├── customisation/                    # CustomisationForm
│   ├── admin/                            # AdminProductForm
│   └── providers/                        # Client providers wrapper
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client (singleton)
│   │   ├── server.ts                     # Server client (async cookies)
│   │   └── admin.ts                      # Service-role client (webhook only)
│   ├── stripe/server.ts                  # Stripe server instance
│   ├── types/index.ts                    # Domain TypeScript types
│   ├── validations/index.ts              # Zod schemas
│   └── utils.ts                          # Shared utility functions
│
├── store/
│   ├── cart.ts                           # Zustand cart (localStorage persist)
│   └── ui.ts                             # Zustand UI (cart drawer, mobile nav)
│
├── hooks/use-toast.ts
├── supabase/migrations/001_initial_schema.sql
├── proxy.ts                              # Next.js 16 session-refresh proxy
├── next.config.ts
├── tsconfig.json
└── .env.example
```

---

## Step 1 — Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd award_ecommerce
npm install
```

---

## Step 2 — Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every variable (instructions in each section below).

---

## Step 3 — Supabase Setup (Database + Auth + Storage)

### 3.1 Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New project**, choose a name and a strong database password
3. Select the region closest to your users and click **Create new project**
4. Wait ~2 minutes for provisioning

### 3.2 Get your API keys

1. In your project, go to **Settings → API**
2. Copy the following into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-secret-key>   # ⚠️ Never expose this client-side
```

### 3.3 Run the database migration

1. In Supabase Dashboard, go to **SQL Editor → New query**
2. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

This creates the following tables with Row Level Security:

| Table | Description |
|-------|-------------|
| `profiles` | Extends `auth.users` — stores name, company, role |
| `addresses` | Shipping addresses per user |
| `categories` | Award categories (pre-seeded with 6 defaults) |
| `products` | Product catalogue with images, materials, sizes |
| `pricing_tiers` | Volume discount tiers per product |
| `orders` | Order records linked to Stripe sessions |
| `order_items` | Line items per order with customisation data |

### 3.4 Set up Storage

1. In Supabase Dashboard, go to **Storage → Create a new bucket**
2. Name it `product-images`, set to **Public**
3. Add these policies (Storage → Policies):

```sql
-- Allow public read on product-images
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow admins to delete
CREATE POLICY "Admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

4. Add the bucket name to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=product-images
```

### 3.5 Configure Auth

1. In Supabase Dashboard, go to **Authentication → URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (change to your prod URL for deployment)
3. Under **Redirect URLs**, add: `http://localhost:3000/api/auth/callback`
4. *(Optional)* Enable OAuth providers under **Authentication → Providers**

### 3.6 Make yourself an admin

After signing up through the app, run this in **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## Step 4 — Stripe Setup (Payments + Webhooks)

### 4.1 Create a Stripe account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. You start in **Test mode** — keep this for development

### 4.2 Get your API keys

1. In Stripe Dashboard, go to **Developers → API keys**
2. Copy into `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

> ⚠️ The secret key is server-only. The publishable key is safe for the browser.

### 4.3 Set up Stripe webhooks for local development

Install the Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# or via npm
npm install -g stripe
```

Login and start listening:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a **webhook signing secret** starting with `whsec_`. Copy it:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Keep this terminal running while you test payments.

### 4.4 Test a payment

1. Start the dev server: `npm run dev`
2. Add items to cart, go to checkout
3. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
4. After payment, the Stripe CLI will forward the `checkout.session.completed` event → your webhook creates the order in Supabase

### 4.5 Stripe test cards reference

| Card number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Card declined |

### 4.6 How the payment flow works

```
User fills checkout form
  → POST /api/checkout (validates items server-side, fetches real prices from DB)
    → Stripe creates a Checkout Session
      → User redirected to Stripe hosted page
        → Payment succeeds
          → Stripe sends webhook: checkout.session.completed
            → POST /api/webhooks/stripe (verified with STRIPE_WEBHOOK_SECRET)
              → Order created in Supabase with status "confirmed"
                → User redirected to /checkout/success
```

> **Security**: Client prices are never trusted. The `/api/checkout` route always fetches current prices from the database before creating the Stripe session.

---

## Step 5 — Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Turbopack is the default bundler in Next.js 16 — no `--turbopack` flag needed.

---

## Step 6 — Deployment to Vercel

### 6.1 Deploy

Option A — Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```

Option B — Connect GitHub:
1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js

### 6.2 Set production environment variables

In Vercel Dashboard → Project → **Settings → Environment Variables**, add every variable from `.env.local` with production values:

| Variable | Production value |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as dev |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as dev (mark as secret) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` for production |
| `STRIPE_SECRET_KEY` | `sk_live_...` for production |
| `STRIPE_WEBHOOK_SECRET` | New secret from step 6.3 below |

### 6.3 Configure Stripe production webhook

1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
3. **Events to listen for**:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Click **Add endpoint**
5. Click **Reveal** on the **Signing secret** → copy it
6. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel

### 6.4 Update Supabase for production

1. In Supabase Dashboard → **Authentication → URL Configuration**
2. **Site URL**: `https://your-domain.com`
3. **Redirect URLs**: Add `https://your-domain.com/api/auth/callback`

### 6.5 Redeploy

After setting all env vars, trigger a new deployment:
```bash
vercel --prod
# or push a new commit to trigger auto-deploy
```

---

## Features

### Authentication & Authorisation
- Supabase Auth with email/password
- HTTP-only cookie sessions via `@supabase/ssr`
- Role-based access: `customer` and `admin`
- Server-side route guards (admin layout redirect)
- OAuth callback handler at `/api/auth/callback`

### Product Catalogue
- Full-text search, category filter, price range, sort options
- Product detail with image gallery (animated carousel)
- Volume pricing tiers
- Featured product badges

### Award Customisation
- Engraving text, material selection, size selection, notes
- Live price calculation with quantity and volume discounts
- Customisation data stored per order item in JSONB

### Cart
- Zustand store persisted to localStorage
- Supports multiple customisation variants of the same product
- Real-time totals including VAT (20%) and shipping

### Payments
- Stripe Checkout (hosted, PCI-compliant)
- Server-side price validation — client prices never trusted
- Webhook creates order in DB after successful payment
- Payment failure handling

### Admin Panel
- Product CRUD with image upload to Supabase Storage
- Order management with status updates
- Revenue overview dashboard

### SEO
- Next.js Metadata API on every page
- OpenGraph and Twitter card tags
- JSON-LD structured data (Organization + Product schemas)
- Dynamic sitemap at `/sitemap.xml`
- `robots.txt` blocking admin/dashboard/api routes

---

## Next.js 16 Specifics Applied

| Change | How it's handled |
|--------|-----------------|
| `params` is a Promise | Every page/route awaits params: `const { slug } = await params` |
| `searchParams` is a Promise | Products page: `const params = await searchParams` |
| `cookies()` is async | `lib/supabase/server.ts` awaits `cookies()` |
| `headers()` is async | Webhook route awaits `headers()` |
| `middleware` → `proxy` | Root `proxy.ts` exports `proxy` function |
| Turbopack default | No `--turbopack` flag; `experimental.turbopackFileSystemCacheForDev` enabled |
| `revalidateTag` signature | Not used directly; tagged cache not needed for this app |
