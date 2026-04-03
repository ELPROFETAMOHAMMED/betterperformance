---
trigger: always_on
---

# New Page Creation Rule

## Step 1 — Propose Before Creating

Before touching any file, answer these questions and wait for explicit confirmation:

1. What route do you propose in `src/app/`? Justify why.
2. Which `Main Sidebar` category fits this link best?
   If none fits, propose a new category with a clear name.
3. Does this page need data fetching with Supabase? Yes/No and why.
4. Does it need Skeleton Loading?
   Only include it if there is real asynchronous data.

Do not continue until the user explicitly confirms.

## Step 2 — File Structure

Follow this Screaming Architecture structure. One file, one responsibility.

For a page named `[page-name]`:

```text
src/
├── app/
│   └── [proposed-route]/
│       └── page.tsx
├── features/
│   └── [page-name]/
│       ├── components/
│       │   ├── [page-name]-page.tsx
│       │   ├── [page-name]-header.tsx
│       │   └── [page-name]-skeleton.tsx
│       ├── hooks/
│       ├── types/
│       └── services/
```

Rules:

- `page.tsx` is the server entry point.
- `[page-name]-page.tsx` is the main composition component.
- `[page-name]-header.tsx` exists only if the page needs a dedicated header.
- `[page-name]-skeleton.tsx` exists only if the page has real asynchronous data loading.
- `hooks/` exists only if there is client interactivity.
- `services/` exists only if server fetch or Supabase query logic is needed.

## Step 3 — Implementation Rules

### Server / Client Separation

- `page.tsx` must always be a Server Component.
- Never add `"use client"` to `page.tsx`.
- Use `"use client"` only in components that need React hooks or browser events.
- Server components fetch data.
- Client components handle interaction.
- Use SSR Supabase helpers from `@/shared/utils/supabase/` for server-side data access.

### Skeleton Loading

- Create `[page-name]-skeleton.tsx` only when the page fetches real asynchronous data.
- The skeleton must mirror the final page structure.
- Use `<Suspense fallback={<PageSkeleton />}>` only when async server rendering is involved.
- If the page is static, do not create a skeleton.

### Visual Style — Windows 11 Fluent Design

Every new page must follow this visual language:

- Backgrounds: `bg-background`, `bg-muted/30`, `bg-card`
- Borders: `border/20` or `border/40`
- Blur: `backdrop-blur-sm` or `backdrop-blur-md`
- Radii: `rounded-xl` or `rounded-2xl`
- Shadows: `shadow-sm`
- Titles: `text-foreground`
- Secondary text: `text-muted-foreground`
- Interaction: `transition-all duration-200`
- Hover: `hover:bg-muted/50`, `hover:border-primary/50`
- Spacing: `p-6`, `gap-4`, `gap-6`

### UI Components

- Always use shadcn/ui components for new UI when an equivalent exists.
- Import from `@/shared/components/ui/[component]`.
- Never create new native HTML primitives when shadcn already provides the component.
- Use `cn()` from `@/shared/lib/cn` for conditional classes only.

## Step 4 — Sidebar Integration

Add the new page link in:

`src/shared/components/layout/main-sidebar.tsx`

Rules:

- Place the link in the semantically correct category.
- If no category fits, propose a new one and justify it.
- Follow the exact visual and structural pattern already used by the sidebar.
- Use the same icon pattern used by existing sidebar entries.

## Step 5 — Imports And Conventions

- Always use absolute imports with `@/`.
- Never use relative imports for internal modules.
- Avoid comments unless strictly necessary.
- If a comment is necessary, use only English JSDoc.
- Keep all names, strings, and comments in English.
- Use strict TypeScript.
- Do not use `any`.
- Avoid unnecessary type assertions.
- Explicitly type props, payloads, and Supabase responses.

## Step 6 — Completion Checklist

Do not mark the task complete until all of the following are true:

- `pnpm lint` passes with zero errors
- `pnpm build` passes without errors
- `page.tsx` is a Server Component without `"use client"`
- Skeleton exists only if there is real async data
- Skeleton matches the final page structure
- Link added in `main-sidebar.tsx` in the correct category
- All imports use `@/`
- All new components use shadcn/ui
- Windows 11 Fluent Design is applied consistently
- No comments in Spanish
- No line comments using `//`
- No `any`
- No dead code
