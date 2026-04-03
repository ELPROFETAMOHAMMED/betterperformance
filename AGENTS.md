# AGENTS.md

Operational guide for coding agents working in `betterperformance`.

## 1) Project Snapshot

- Stack: Next.js 15 App Router + React 19 + TypeScript strict.
- Package manager preference: `pnpm` (repo also contains `package-lock.json`).
- Styling: Tailwind CSS v4 + shadcn/Radix components.
- Backend/data: Supabase (`@supabase/supabase-js`, SSR helpers).
- Main path alias: `@/*` maps to `src/*` (from `tsconfig.json`).
- Lint baseline: `next/core-web-vitals` + `next/typescript`.

## 2) Setup And Environment

- Node: use an active LTS compatible with Next 15 (Node 18+ minimum, 20+ preferred).
- Install deps: `pnpm install`.
- Required env vars in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` (recommended for metadata/canonical URLs)

## 3) Build / Lint / Test Commands

Use `pnpm` commands unless a maintainer asks otherwise.

- Dev server: `pnpm dev`
- Production build: `pnpm build`
- Start production server: `pnpm start`
- Lint all code: `pnpm lint`

### Test Status

- There is currently no `test` script in `package.json`.
- No Jest/Vitest/Playwright config files were found.
- No `*.test.*` or `*.spec.*` files were found.

### Single Test Execution (Important)

- Not currently available because no test runner is configured.
- If tests are added later, update this file with exact commands, e.g.:
  - Vitest single file: `pnpm vitest run src/path/file.test.ts`
  - Vitest single test name: `pnpm vitest run src/path/file.test.ts -t "test name"`
  - Jest single file: `pnpm jest src/path/file.test.ts`
  - Playwright single spec: `pnpm playwright test tests/example.spec.ts`

## 4) High-Confidence Workflow For Agents

When making code changes:

1. Read nearby feature code first; preserve existing conventions.
2. Implement smallest safe change that solves the issue.
3. Run `pnpm lint` and fix violations.
4. If behavior changes materially, run `pnpm build` for integration confidence.
5. Report exactly what changed and any follow-up risks.

## 5) Architecture And File Organization

- Primary structure is feature-oriented under `src/features/*`.
- App routes and API endpoints live in `src/app/**`.
- Shared UI/hooks/providers/utils live under `src/shared/**`.
- Keep server-only logic in server contexts (`route.ts`, server utilities).
- Use `"use client"` only where browser APIs/hooks are required.

## 6) Import And Module Conventions

- Prefer absolute alias imports using `@/` for internal modules.
- Keep import groups clean and readable:
  1) framework/external packages,
  2) internal `@/` modules,
  3) relative imports when needed.
- Use type-only imports where applicable: `import type { X } from "..."`.
- Avoid deep relative chains like `../../../../`; use alias instead.

## 7) TypeScript And Typing Rules

- `strict: true` is enabled; keep all new code strictly typed.
- Do not introduce `any` unless there is a hard blocker.
- Prefer `unknown` + narrowing over unsafe assertions.
- Type API payloads and responses explicitly.
- Export reusable domain types from `src/features/*/types/*`.
- Preserve existing domain naming (e.g., `Tweak`, `TweakCategory`, `EditorSettings`).

## 8) Naming Conventions

- Files and folders: kebab-case (`setting-card.tsx`, `auth-guard.ts`).
- React components: PascalCase symbol names (`SettingCard`, `ThemeProvider`).
- Hooks: `use-` prefix (`use-editor-settings`, `use-user`).
- Route handlers: `GET`, `POST`, `PATCH`, `DELETE` function exports in `route.ts`.
- Constants: `UPPER_SNAKE_CASE` for module-level constants.

## 9) Formatting And Style

- Follow existing formatting in repo (2 spaces, semicolons, double quotes).
- Keep functions focused; split logic when blocks become multi-purpose.
- Avoid dead/commented-out code.
- Add comments only when intent is non-obvious.
- Prefer small pure helper functions for repeat logic.

## 10) Error Handling Patterns

- API routes should:
  - validate input early,
  - return `NextResponse.json(..., { status })` with clear messages,
  - catch unexpected failures and return safe 500 responses.
- Use `try/catch` around Supabase/network operations.
- Log operational errors with context (existing code uses `console.error`).
- Never leak secrets/tokens in logs or responses.
- In client hooks, fail gracefully and keep UI state coherent.

## 11) UI And Styling Guidance

- Reuse existing shadcn/ui components from `src/shared/components/ui/*`.
- Use `cn()` from `src/shared/lib/utils.ts` for class composition.
- Prefer design tokens/semantic classes (`bg-background`, `text-foreground`, etc.).
- Maintain accessibility expectations from Radix/shadcn primitives.

## 12) Supabase And Security Notes

- Use shared helpers in `src/shared/utils/supabase/*`.
- For protected actions, verify auth user and role before mutations.
- Keep rate limiting where present (`src/shared/utils/rate-limit.ts`).
- Do not move privileged logic to client components.

## 13) Settings-Specific Note

- Settings are persisted to `localStorage` via `use-editor-settings`.
- Any setting that must apply immediately should be consumed reactively from hook state,
  not re-read ad hoc from storage.

## 14) Rule Files Found In Repository

No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` files were found.

Additional repository guidance exists in:

- `.agents/rules/bp-rule.md`
- `.agents/rules/Sql-RULE.md`

Key directives from those files to respect:

- Keep strict client/server separation.
- Favor feature/business intent in structure.
- Keep single responsibility per file.
- Stay strict with TypeScript and lint cleanliness.
- For tweak SQL generation workflows, include category existence/create logic.

## 15) Definition Of Done For Agent Changes

- Change is scoped and minimal.
- Lint passes (`pnpm lint`).
- Build checked when relevant (`pnpm build`).
- No unintended architectural drift.
- Documentation updated if behavior/commands changed.
