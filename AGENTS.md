<!-- BEGIN:nextjs-agent-rules -->
# AwardCraft — Agent & Coding Rules

## Framework: Next.js 16 (App Router)

This project uses **Next.js 16** which has breaking changes from earlier versions.
Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

### Critical Breaking Changes in Next.js 16

| API | Rule |
|-----|------|
| `params` in `page.tsx`, `layout.tsx`, `route.ts` | **Must be awaited** — it is a `Promise` |
| `searchParams` in `page.tsx` | **Must be awaited** — it is a `Promise` |
| `cookies()` from `next/headers` | **Must be awaited** |
| `headers()` from `next/headers` | **Must be awaited** |
| `draftMode()` from `next/headers` | **Must be awaited** |
| `middleware.ts` | **Renamed to `proxy.ts`** — export `proxy` function, not `middleware` |
| `revalidateTag(tag)` | Now requires second argument: `revalidateTag('tag', 'max')` |
| `experimental.turbopack` | Moved to top-level `turbopack` in `next.config.ts` |
| `experimental.ppr` | Removed — use `cacheComponents: true` instead |
| AMP support | Fully removed |
| `next lint` command | Removed — use ESLint CLI directly |
| `serverRuntimeConfig` / `publicRuntimeConfig` | Removed — use `process.env` / `NEXT_PUBLIC_` |
| `next/legacy/image` | Removed — use `next/image` |

### Async Params Pattern (ALWAYS use this)

```tsx
// ✅ Correct — Next.js 16
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}

// Route Handlers
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Server Client Pattern (ALWAYS use this)

```ts
// ✅ Correct — cookies() must be awaited
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // note: async
```

### Proxy (not middleware)

```ts
// ✅ proxy.ts  (NOT middleware.ts)
export function proxy(request: Request) { ... }
```

---

## Project Conventions

- **Path aliases**: Use `@/` for all imports (maps to project root)
- **Supabase clients**: Never import `admin.ts` in client components or pages — only in API routes and webhook handlers
- **Stripe prices**: Always fetch prices server-side — never trust client-sent prices
- **Forms**: React Hook Form + Zod resolver for all forms
- **State**: Zustand for cart and UI state; no Redux
- **Styling**: Tailwind CSS v4 utility classes + CSS variables for design tokens
- **UI components**: Located in `components/ui/` — shadcn-compatible Radix primitives
- **Animations**: Framer Motion — use `motion.div` + `whileInView` for scroll animations
- **Role guard**: Admin pages check `profiles.role === 'admin'` server-side (in layout or page)

## File Structure Reference

```
app/               → Pages, layouts, API routes (App Router)
components/        → React components (ui/, layout/, products/, cart/, etc.)
lib/               → Utilities (supabase/, stripe/, types/, validations/, utils.ts)
store/             → Zustand stores (cart.ts, ui.ts)
hooks/             → Custom React hooks (use-toast.ts)
supabase/          → Database migrations
proxy.ts           → Session refresh proxy (Next.js 16 replacement for middleware)
```
<!-- END:nextjs-agent-rules -->

