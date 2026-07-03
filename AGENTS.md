<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Project: diksyo (Tagalog Learning App)

This document serves as the primary source of truth for AI agents working on the `diksyo` codebase. It outlines the architecture, conventions, and workflows to ensure consistency and idiomatic implementation.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui, next-themes, lucide-react, tw-animate-css (Note: Tailwind v4 uses CSS-based configuration located in `app/globals.css` or `app/index.css`, not `tailwind.config.js`).
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Drizzle ORM
- **Authentication:** Supabase Auth (@supabase/ssr)
- **State Management:** Zustand
- **Form Validation:** Zod
- **Algorithm:** FSRS (Free Spaced Repetition Scheduler) via `ts-fsrs`

## Git Commit Convention

Format: `<type>(<scope>): <description>` (Scope is optional but recommended).

| Type | Purpose | Example |
| :--- | :--- | :--- |
| **feat** | A new feature for the user | `feat(quiz): add active recall typing mode` |
| **fix** | A bug fix | `fix(srs): resolve logic error in interval calculation` |
| **chore** | Maintenance, dependencies, or build tasks | `chore: init shadcn with base-ui primitives` |
| **docs** | Documentation changes only | `docs: add readme entry for linguistic logic` |
| **style** | UI/UX changes, CSS, or formatting (no logic) | `style(ui): apply neo-brutalist shadows to buttons` |
| **refactor** | Code changes (no fix/feature) | `refactor(db): move word schemas to separate file` |
| **perf** | Performance improvement | `perf(search): optimize fuzzy matching algorithm` |
| **test** | Adding or correcting tests | `test(auth): add unit tests for JWT validation` |

## Architecture & Conventions

### 1. File Organization & Naming
- **App Router:** Follow Next.js App Router conventions (nested folders for routes, `page.tsx`, `layout.tsx`).
- **Components:** UI components in `components/ui/`, feature components in `components/`.
- **Server Actions:** All data mutations and auth logic should use Server Actions (found in `app/actions/`).
- **Utilities:** Shared helpers in `lib/` or `utils/`.
- **Naming:** Use **kebab-case** for file names (e.g., `login-form.tsx`, `forgot-password/page.tsx`).

### 2. Coding Standards
- **TypeScript:** Strict mode is enabled. Use explicit types/interfaces. Avoid `any`.
- **React:** Use React 19 patterns. Prefer functional components and hooks.
- **Server-Side First:** Leverage Server Components by default. Fetch data using direct `async/await` in Server Components instead of `useEffect`. Use `'use client'` only when client-side interactivity is required.
- **Imports:** Use `@/` alias for all internal imports (e.g., `@/components/ui/button`).
- **Error Handling:** Handle errors gracefully in Server Actions using the `AuthState` pattern (error message + error title).
- **Environment Variables:** Only variables prefixed with `NEXT_PUBLIC_` are safe for client-side use. Never expose server secrets (like Supabase Service keys) to the client.
- **Cache Invalidation:** Always call `revalidatePath()` or `revalidateTag()` at the end of successful Server Actions to ensure the UI instantly reflects database mutations.

### 3. Database & ORM (Drizzle)
- **Schema:** Defined in `db/schema.ts`.
- **Migrations:** Use `drizzle-kit` for generating and pushing migrations.
- **Credentials:** Connection string is stored in `DIRECT_URL` in `.env.local`.
- **Database Resilience:** 
  - Connection strings must strictly enforce pooling limits (e.g., `?connection_limit=5&connect_timeout=10`).
  - Postgres client in `db/index.ts` must use `connect_timeout: 5` and `idle_timeout: 5` to fail fast and avoid Vercel 504 timeouts.
  - All DB queries and Supabase API calls in Server Actions must be wrapped in `withExponentialBackoff(async () => { ... })` imported from `@/lib/db-utils` to handle retry storms.
- **Egress Write Protection:** Do NOT use `.returning()` on `INSERT` or `UPDATE` operations unless absolutely necessary for the UI.

### 4. Authentication (Supabase)
- Client-side Supabase: `utils/supabase/client.ts`.
- Server-side Supabase: `utils/supabase/server.ts`.
- Middleware: Ensure auth state is handled correctly in `middleware.ts` (if present) or via Server Actions.

### 5. State Management & Form Validation
- **Zustand:** Prefer local React state when possible. Use Zustand (store files should be located in a `store/` directory) strictly for complex, globally shared client state.
- **Zod:** All `FormData` or JSON inputs to Server Actions must be strictly parsed and validated against Zod schemas before running any database queries to prevent malformed data injections.

### 6. Domain Logic (FSRS)
- Spaced repetition logic is encapsulated in `lib/fsrs-logic.ts`.
- Use the `calculateNextReview` helper to determine the next review date and card state.

## Workflows

### Adding a New Route
1. Create the folder in `app/`.
2. Add `page.tsx`.
3. If it requires data fetching, do it directly in the Server Component.
4. If it requires mutation, create a Server Action in `app/actions/`.

### Updating the Schema
1. Modify `db/schema.ts`.
2. Run `npx drizzle-kit generate` to create the migration.
3. Run `npx drizzle-kit push` (or `migrate`) to apply changes.

### UI Components
- Use `npx shadcn@latest add [component]` to add new shadcn/ui components.
- Do not modify `components/ui/` unless necessary for global styling consistency.

## Common Commands

| Command | Purpose | When to use it |
| :--- | :--- | :--- |
| `npm run dev` | Starts Local Development Server (HMR) | 90% of the time while coding features. |
| `npm run build` | Compiles & optimizes code for production | Before deployment to check for errors. |
| `npx shadcn@latest add [component]` | Adds UI component source to `components/ui/` | When you need a new building block. |
| `npx drizzle-kit push` | Syncs `schema.ts` with Supabase database | Every time you change tables/columns/relations. |
| `npx tsx db/seed.ts` | Bulk-uploads initial words/roots to DB | After a successful push or to reset test data. |

# Design System: diksyo

This document outlines the visual identity and UI/UX standards for the `diksyo` project. The design is heavily inspired by **Neobrutalism**, characterized by bold lines, high-contrast colors, and rigid, square shapes.

## Visual Identity

### Aesthetic: Neobrutalism
- **Borders:** Thick, black borders (usually `2px` or `4px`) on almost all interactive elements.
- **Shadows:** Hard, non-blurred shadows (e.g., `shadow-[4px_4px_0_0_#000]`).
- **Radius:** Zero to minimal border radius (`rounded-none` preferred).
- **Typography:** Bold, uppercase, and often italicized for emphasis. High tracking (e.g., `tracking-tighter`).

## Color Palette

The project uses OKLCH-based colors with a focus on high contrast.

- **Primary Background:** White (`oklch(1 0 0)`) / Dark Gray (`oklch(0.145 0 0)` in dark mode).
- **Accent (Yellow):** Used for primary actions, buttons, and highlights (e.g., `bg-yellow-400`).
- **Destructive (Red):** Used for errors and critical alerts (e.g., `bg-red-400`).
- **Foreground/Borders:** Deep Black (`oklch(0.145 0 0)`).

## Typography

- **Primary Sans:** `Geist Sans` & `Inter`.
- **Primary Mono:** `Geist Mono`.
- **Headings:** Should be `font-black`, `uppercase`, `italic`, and `tracking-tighter`.
- **Body/Labels:** Bold, uppercase, `text-xs` or `text-sm` for secondary information.

## UI Components

### 1. Buttons
- **Style:** `rounded-none`, `border-2`, `border-black`, `font-bold`.
- **Shadow:** Hard shadow that disappears on hover/active states to simulate "pressing".
- **Interaction:** `hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all`.

### 2. Inputs & Forms
- **Style:** `rounded-none`, `border-2`, `border-black`.
- **Focus State:** `focus-visible:ring-0 focus-visible:bg-yellow-100`.
- **Labels:** `font-bold`, `uppercase`, `text-xs`.

### 3. Cards & Alerts
- **Style:** `rounded-none`, `border-2`, `border-black`.
- **Alerts:** High-contrast backgrounds (e.g., red for errors) with bold icon placement.

## Layout Patterns

- **Root Layout:** `flex flex-col min-h-full`.
- **Containers:** Center-aligned with consistent gap spacing (`gap-4`, `gap-6`).
- **Spacing:** Generous use of white space to balance the "heavy" neobrutalist elements.

## Animations

- Powered by `tw-animate-css`.
- Use subtle transitions for hover states to maintain the "rigid" feel while providing tactile feedback.

<!-- END:nextjs-agent-rules -->
