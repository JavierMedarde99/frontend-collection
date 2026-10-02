# AGENTS.md

React 18 + Vite 5 + Tailwind 3 + React Router 6 frontend for a book-collection app. Backend is a separate Spring Boot repo.

## Commands
- `npm run dev` — dev server on port 5173. `/api` is proxied to `http://localhost:8080`, so always call backend via **relative** `/api/...` URLs (never hardcode `localhost:8080`).
- `npm run build` — the only verification step (no lint, typecheck, or tests are configured).
- `npm run preview` — serve the production build.

`package.json` sets `"type": "module"`, so config files (`postcss.config.js`, `tailwind.config.js`) must use `export default`, not `module.exports` (a `.cjs` rename is the fallback).

### Verification
`npm run build` is the gate. There is also `npm test` (vitest, ~36 files): `BookCard > muestra el título y el autor` and `GenreMultiselect > dos géneros recargan con array genre` fail on `main` already, so they are not a regression signal. `npx tsc --noEmit` reports ~44 pre-existing errors on `main`; only new ones matter.

# Backend contract — READ THIS, the wiki lies
The frontend is built against the **real backend at localhost:8080**, whose OpenAPI differs from both the GitHub issues and `wiki-collection` docs. The wiki's "rich" Book model is NOT what the API returns. The actual API:

Endpoints (already wrapped in `src/api/booksApi.ts`; add calls there):
- `GET /api/books` — query params `page`, `size`, `sort`, **`state`** (NOT `status`). Returns a Spring `PageBookResponse` (`content`, `totalPages`, `totalElements`, `number`, …).
- `GET /api/books/{id}`, `POST /api/books`, `PUT /api/books/{id}`, `DELETE /api/books/{id}` (204 on success).
- `GET /api/books/search?name={q}` — param is **`name`** (NOT `q`). Returns normalized results with fields `id, title, authors[], isbn, coverImage, description, pageCount, publisher, publishedDate, language, categories`.

Games:
- `GET /api/v1/games/platforms` → `[{ id, name, slug }]`. **Platform is free text**, not an enum: the backend forwards whatever the external catalog says (`'PlayStation 5'`, `'Web browser'`, `'PC (Windows)'`). `src/api/gamesApi.ts:listGamePlatforms` + `src/hooks/usePlatformOptions` load it; the three selects (`GameForm`, `GameListPage`, `GameSearch`) read from there. There is no `GamePlatform` type anymore.
- `GameRequest.platform` is `minLength: 1`, so the form must always have a non-empty value.
- Legacy data: games saved before the change still hold the old enum names (`PS2`, `PS3`, `WII_U`, `SWITCH`), which the catalog does not list and the backend's exact-match filter will not match. Every select therefore always includes its current value as an option; never drop that, or editing an old game silently changes its platform.

Book model (not the wiki model): `id, externalId, title, author` (**single string**, not a list), `descripcion`, `pages`, `type`, `state`, `comment`, `start` (0–5 rating), `startDate`, `endDate`, `frontpage`.
- `type` enum: `MANGA | NOVEL | GRAPHIC_NOVEL` (mapped in `src/constants/books.ts`).
- `state` enum: `TO_READ | READING | COMPLETED` (NOT wishlist/reading/completed/abandoned).
- `DELETE` and 204 responses return nothing; the `request()` helper in `booksApi.ts` handles this.

## Structure
- `src/pages/` — wired in `src/App.tsx`: `/` HomePage, `/coleccion` List, `/nuevo` Create/Añadir, `/editar/:id` Edit, plus `/juegos*` routes for the video-game collection. There is no `/buscar` route: the `/nuevo` page offers a toggle between search (Google Books) and manual add. The search UI lives in `src/components/BookSearch.tsx`.
- `src/components/` — shared UI. Reusable Tailwind classes (`.btn-primary`, `.btn-ghost`, `.input`, `.label`, `.card`) are defined in `src/index.css`.
- `src/constants/books.ts` — the single source for `BOOK_TYPES`/`BOOK_STATES` labels and badge colors.
- `src/pages/HomePage.tsx` **is routed at `/`** (rendered by `src/App.tsx`); it shows the hero banner and per-state book stats. Not orphaned.

## Design system
`DESIGN.md` is the design source of truth; the tokens (colors, Inter typography sizes, radius, shadow) are in `tailwind.config.js`. Match existing component classes and DESIGN tokens rather than inventing new styles.

## Branch / PR workflow
Work is tracked as one GitHub issue per page/feature. Convention: one feature branch (`feature/<nombre>`) per issue → one PR per issue targeting `main`, kept **unmerged** until reviewed. Every page adds a route to `src/App.tsx`, so `App.tsx` is the recurring merge-conflict point when `main` advances: resolve by merging `main` into the feature branch and keeping all existing routes plus the new one.
