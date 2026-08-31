# AGENTS.md

React 18 + Vite 5 + Tailwind 3 + React Router 6 frontend for a book-collection app. Backend is a separate Spring Boot repo.

## Commands
- `npm run dev` — dev server on port 5173. `/api` is proxied to `http://localhost:8080`, so always call backend via **relative** `/api/...` URLs (never hardcode `localhost:8080`).
- `npm run build` — the only verification step (no lint, typecheck, or tests are configured).
- `npm run preview` — serve the production build.

`package.json` sets `"type": "module"`, so config files (`postcss.config.js`, `tailwind.config.js`) must use `export default`, not `module.exports` (a `.cjs` rename is the fallback).

## Backend contract — READ THIS, the wiki lies
The frontend is built against the **real backend at localhost:8080**, whose OpenAPI differs from both the GitHub issues and `wiki-collection` docs. The wiki's "rich" Book model is NOT what the API returns. The actual API:

Endpoints (already wrapped in `src/api/booksApi.js`; add calls there):
- `GET /api/books` — query params `page`, `size`, `sort`, **`state`** (NOT `status`). Returns a Spring `PageBookResponse` (`content`, `totalPages`, `totalElements`, `number`, …).
- `GET /api/books/{id}`, `POST /api/books`, `PUT /api/books/{id}`, `DELETE /api/books/{id}` (204 on success).
- `GET /api/books/search?name={q}` — param is **`name`** (NOT `q`). Returns normalized results with fields `id, title, authors[], isbn, coverImage, description, pageCount, publisher, publishedDate, language, categories`.

Book model (not the wiki model): `id, externalId, title, author` (**single string**, not a list), `descripcion`, `pages`, `type`, `state`, `comment`, `start` (0–5 rating), `startDate`, `endDate`, `frontpage`.
- `type` enum: `MANGA | NOVEL | GRAPHIC_NOVEL` (mapped in `src/constants/books.js`).
- `state` enum: `TO_READ | READING | COMPLETED` (NOT wishlist/reading/completed/abandoned).
- `DELETE` and 204 responses return nothing; the `request()` helper in `booksApi.js` handles this.

## Structure
- `src/pages/` — one page per route, wired in `src/App.jsx`: `/` List, `/nuevo` Create, `/buscar` Search, `/editar/:id` Edit.
- `src/components/` — shared UI. Reusable Tailwind classes (`.btn-primary`, `.btn-ghost`, `.input`, `.label`, `.card`) are defined in `src/index.css`.
- `src/constants/books.js` — the single source for `BOOK_TYPES`/`BOOK_STATES` labels and badge colors.
- `src/pages/HomePage.jsx` is **orphaned** (not routed); don't assume it's used.

## Design system
`DESIGN.md` is the design source of truth; the tokens (colors, Inter typography sizes, radius, shadow) are in `tailwind.config.js`. Match existing component classes and DESIGN tokens rather than inventing new styles.

## Branch / PR workflow
Work is tracked as one GitHub issue per page/feature. Convention: one feature branch (`feature/<nombre>`) per issue → one PR per issue targeting `main`, kept **unmerged** until reviewed. Every page adds a route to `src/App.jsx`, so `App.jsx` is the recurring merge-conflict point when `main` advances: resolve by merging `main` into the feature branch and keeping all existing routes plus the new one.
