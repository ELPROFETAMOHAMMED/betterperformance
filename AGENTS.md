# AGENTS.md

Only the pitfalls and must-know rules for this repo.

## Stack & Setup
- Next.js 15 (App Router) + React 19 + TS strict.
- Package manager: `pnpm` (lockfile present). Use Node 18+ (20+ preferred).
- Env needed in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`.

## Commands that matter
- Dev: `pnpm dev`
- Lint: `pnpm lint` (warnings fail CI/build; fix unused imports, etc.)
- Build: `pnpm build` (runs typecheck + ESLint). No tests configured.

## Imports, styling, typing (easy to get wrong)
- Internal imports must use `@/…` alias (tsconfig). Avoid relative ladders.
- UI: prefer shadcn/ui components under `src/shared/components/ui`; avoid raw elements with ad-hoc Tailwind when a shadcn piece exists.
- TypeScript is strict; avoid `any` and unchecked assertions. Use type-only imports.

## App structure you need to know
- Feature-first layout: `src/features/*`; routes in `src/app/**`; shared UI/hooks/utils in `src/shared/**`.
- Client components should keep `"use client"` minimal; server logic stays in `route.ts`/server utils.
- Supabase helpers live in `src/shared/utils/supabase/*`; migrations belong in `src/shared/utils/supabase/migrations/`.

## Supabase & data
- Use `createClient` helpers; respect existing RLS/rate limit helpers (`src/shared/utils/rate-limit.ts`).
- For SQL changes, add a migration file; check `.agents/rules/Sql-RULE.md` for constraints.

## Additional rule sources
- Read `.agents/rules/bp-rule.md` and `.agents/rules/Sql-RULE.md` before significant work.

## Definition of done
- Keep changes scoped; preserve existing conventions.
- Run `pnpm lint` (no warnings) and, when behavior changes, `pnpm build`.
