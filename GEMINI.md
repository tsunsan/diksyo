# Project: diksyo (Tagalog Learning App)

This document serves as the primary source of truth for AI agents working on the `diksyo` codebase. It outlines the architecture, conventions, and workflows to ensure consistency and idiomatic implementation.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui, next-themes, lucide-react, tw-animate-css
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
- **Server-Side First:** Leverage Server Components by default. Use `'use client'` only when client-side interactivity is required (state, effects, events).
- **Imports:** Use `@/` alias for all internal imports (e.g., `@/components/ui/button`).
- **Error Handling:** Handle errors gracefully in Server Actions using the `AuthState` pattern (error message + error title).

### 3. Database & ORM (Drizzle)
- **Schema:** Defined in `db/schema.ts`.
- **Migrations:** Use `drizzle-kit` for generating and pushing migrations.
- **Credentials:** Connection string is stored in `DIRECT_URL` in `.env.local`.

### 4. Authentication (Supabase)
- Client-side Supabase: `utils/supabase/client.ts`.
- Server-side Supabase: `utils/supabase/server.ts`.
- Middleware: Ensure auth state is handled correctly in `middleware.ts` (if present) or via Server Actions.

### 5. Domain Logic (FSRS)
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
