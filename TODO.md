# BetterPerformance — Pending Work Audit

## 1. Changes already made (audit what exists now)
- AGENTS.md — modified; condensed agent guidance; status: working.
- .agents/rules/new-page-creation-rule.md — modified; status: working (non-code rule file).
- src/app/(main)/layout.tsx — modified (providers/layout wiring); status: working.
- src/app/(main)/tweaks/[view]/page.tsx — modified (added wallpapers data and view handling); status: incomplete (wallpaper tab integration issues).
- src/app/(main)/wallpapers/page.tsx — created/modified (redirect to tweaks/wallpapers); status: working.
- src/app/api/auth/callback/route.ts — modified (auth handling); status: working (not part of current tasks).
- src/app/layout.tsx — modified (root layout tweaks); status: working.
- src/app/api/favorites/route.ts — created (favorites fetch API); status: incomplete/broken until favorites table + wiring are fixed.
- src/app/api/favorites/toggle/route.ts — created (favorites toggle API); status: incomplete/broken until DB + UI wiring are fixed.
- src/app/api/wallpapers/route.ts — created (wallpaper CRUD/list); status: working.
- src/app/api/wallpapers/download/route.ts — created (wallpaper download script); status: working.
- src/app/api/wallpapers/[id]/route.ts — created (wallpaper by id); status: working.
- src/features/favorites/hooks/use-favorites.ts — created (React Query favorites hook); status: incomplete (multiple callers per item; relies on new table not yet live).
- src/features/favorites/services/favorites-client.ts — created (client fetch/toggle); status: incomplete (same as above).
- src/features/favorites/types/favorite.types.ts — created (favorites types); status: working.
- src/features/tweaks/components/favorites-panel.tsx — created (favorites view UI); status: incomplete (depends on favorites hook/new table).
- src/features/tweaks/components/selection-action-bar.tsx — modified (selection bar includes wallpapers); status: lint warning (unused XMarkIcon) => broken for lint.
- src/features/tweaks/components/selection-sheet.tsx — modified (selection sheet includes wallpapers); status: lint warning (unused XMarkIcon) => broken for lint.
- src/features/tweaks/components/tweak-item.tsx — modified (favorite toggle via new hook); status: incomplete (favorites flow inconsistent/new hook per item).
- src/features/tweaks/components/tweaks-content.tsx — modified (wallpapers tab + favorites panel); status: incomplete (favorites and wallpapers integration issues).
- src/features/tweaks/components/tweaks-page-client.tsx — modified (passes wallpapers data); status: incomplete (depends on wallpapers/favorites fixes).
- src/features/tweaks/components/visual-tree/index.tsx — modified (added wallpapers tab handling); status: incomplete (wallpapers tab not rendering itPaems; favorites view mismatch).
- src/features/tweaks/components/visual-tree/library-tree.tsx — modified (wallpapers row stub); status: incomplete (no wallpaper list/preview).
- src/features/tweaks/components/visual-tree/category-row.tsx — modified (supports selection counters/optional button); status: working but used by incomplete wallpaper row.
- src/features/tweaks/context/selection-context.tsx — modified (wallpaper selection in global store); status: working.
- src/shared/auth/build-user-profile.ts — modified; status: working (not in current scope).
- src/shared/auth/normalize-role.ts — modified; status: working (not in current scope).
- src/shared/components/layout/animated-background.tsx — deleted; status: removed.
- src/shared/components/layout/breadcrumb-navigator.tsx — modified (breadcrumbs incl. wallpapers redirect); status: working.
- src/shared/components/layout/main-header.tsx — modified (selection sheet badge, etc.); status: working.
- src/shared/components/layout/main-sidebar.tsx — modified (wallpapers nav now /tweaks/wallpapers); status: working.
- src/features/wallpapers/components/wallpaper-card.tsx — modified (selection + favorite toggle); status: incomplete (favorites rely on new table/hook).
- src/features/wallpapers/components/wallpapers-grid.tsx — modified (selection wiring); status: working.
- src/shared/types/selection.types.ts — modified (selected items include wallpapers); status: working.
- src/shared/utils/supabase/migrations/favorites_migration.sql — created (favorites table/RLS); status: not applied yet.
- src/shared/utils/supabase/migrations/wallpapers_migration.sql — created (wallpapers table/RLS); status: not applied yet.

## 2. Broken things to fix (in priority order)

### BUG 1 — Favorites completely broken in tweaks/favorites
- Files: src/features/tweaks/components/tweaks-content.tsx, src/features/tweaks/components/favorites-panel.tsx, src/features/tweaks/components/tweak-item.tsx, src/features/favorites/hooks/use-favorites.ts, src/app/api/favorites/*, src/features/tweaks/hooks/use-favorite-dialog.ts (still writes to tweak_history), src/features/history-tweaks/utils/tweak-history-client.ts, migrations/favorites_migration.sql (not applied).
- Root cause: Favorites flow was partially migrated to a new `favorites` table/API while the UI still saves favorites via `tweak_history` (useFavoriteDialog). Favorites panel now reads from the new API, so toggles via dialogs never appear, and wallpapers favorites rely on a table that is not yet migrated/RLS-enabled. Additionally, useFavorites is invoked per item (tweak/wallpaper), causing redundant queries.
- Proposed fix: Fully switch favorites to the new `favorites` table—apply the migration, update useFavoriteDialog/save flows to use the new toggle, ensure only one favorites query source (shared provider), and remove dependence on `tweak_history` for favorites. Wire wallpapers favorites through the same API.

### BUG 2 — Wallpapers not rendering in visual-tree
- Files: src/features/tweaks/components/visual-tree/index.tsx, src/features/tweaks/components/visual-tree/library-tree.tsx, src/features/tweaks/components/tweaks-content.tsx.
- What is wrong: The wallpapers “row” in the explorer is a stub with no list or previews; VisualTree receives no wallpapers data, so expanding renders nothing. Right panel shows grid only when wallpapersPageData is passed, but the explorer does not mirror or drive wallpaper selection.
- Proposed fix: Pass wallpapers data into VisualTree/LibraryTree and render an actual wallpaper list (with preview/thumb + selection) similar to tweak items. Ensure onTabChange/onToggleSelected hooks into selection-context and that wallpapersPageData is loaded for the explorer state.

### BUG 3 — Bottom sheet still exists
- Files referencing wallpaper-specific bottom sheet: none found (search under src/features/wallpapers for sheet/bottom-sheet returned no matches). Only the global selection sheet (tweaks SelectionSheet) remains.
- Proposed fix: Verify there is no hidden wallpaper-specific sheet. If any leftover reference surfaces, delete the component/import; otherwise document that only the unified SelectionSheet is used.

## 3. Incomplete tasks from previous session
- Favorites refactor goal: unify favorites for tweaks + wallpapers. Done: added /api/favorites, toggle API, favorites hook/types, favorites panel, favorites migration, toggles in TweakItem and WallpaperCard. Missing: apply migration; route UI and dialog flows still save to tweak_history; consolidate favorites fetching to avoid per-item queries; integrate favorites data in explorer/favorites tab; ensure lint passes.
- Wallpapers integration goal: move wallpapers into tweaks explorer. Done: wallpapers route redirects to /tweaks/wallpapers; tweaks view fetches wallpapersPageData; added wallpapers row in VisualTree and wallpapers grid on right; selection-context supports wallpapers. Missing: explorer actually renders wallpaper list/previews; selection sync from explorer; ensure wallpapers fetch is available when needed.
- Lint cleanup: Unused `XMarkIcon` in selection-action-bar.tsx and selection-sheet.tsx still causes lint warnings; needs removal.
- Migrations: favorites_migration.sql and wallpapers_migration.sql are present but not applied.
## 4. Execution plan
1) Remove unused `XMarkIcon` imports in `src/features/tweaks/components/selection-action-bar.tsx` and `src/features/tweaks/components/selection-sheet.tsx`; run `pnpm lint` to clear warnings.
2) Apply `favorites_migration.sql` (and confirm `wallpapers_migration.sql` if not already applied) to Supabase; verify table, columns, and RLS exist.
3) Rework favorites save flow: update `use-favorite-dialog.ts` (and any selection save entry points) to call the new favorites toggle/API instead of `tweak_history`; drop tweak_history favorite usage for favorites functionality.
4) Centralize favorites data: provide a single favorites fetch (e.g., context/provider using `useFavorites`) and reuse across TweakItem/WallpaperCard/FavoritesPanel to avoid per-item queries; ensure toggles refetch shared data.
5) Align favorites UI: ensure `/tweaks/favorites` uses the new favorites data for both explorer (VisualTree) and right panel; remove dependency on `userFavoriteSelections` from history for favorites tab filtering.
6) Implement wallpapers explorer rendering: pass wallpapers list into VisualTree/LibraryTree, render wallpaper entries with preview/thumb and selection toggle, and ensure onTabChange/onToggleSelected uses selection-context; verify wallpapersPageData available when opening the tab.
7) Confirm wallpaper grid selection/favorites still work after explorer changes; run `pnpm lint`.
8) Run `pnpm build` to validate types/lint; fix any remaining issues.
