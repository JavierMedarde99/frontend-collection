# Plan — Familia visual Gabinete en navegación, listas, detalles, altas/edición y perfil

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender la familia visual «Gabinete» (papel, Fraunces/Literata, `.rule-double`, acento por colección vía `--sc`/`--c`) desde la Home ya mergeada a toda la app: navbar, 6 listas, 6 detalles, altas/edición de las 6 colecciones y perfil/preferencias — cambiando solo el envoltorio visual, nunca lógica ni flujos.

**Architecture:** Todo se compone de pocas piezas compartidas nuevas (`CollectionMeta` ampliado en `collections.ts`, `PageHeader`, `MetaList`, clases CSS en `@layer components`, navegación con `--sc` por colección) y reenvuelve las páginas existentes sin tocar sus datos, hooks, tarjetas, modales ni acciones. El acento siempre se inyecta inline en el contenedor raíz de la página (patrón ya usado por `HomePage`); ningún token nuevo en Tailwind.

**Tech Stack:** React 18 · Vite 5 · Tailwind 3 (clases existentes) · React Router 6 · Vitest (@testing-library/react para tests de componentes) · CSS vars `--sc`/`--c`/`--rule` con modo oscuro por clase `.dark`.

**Spec:** `docs/superpowers/specs/2026-10-03-pages-gabinete-design.md` (fuente visual: mockups aprobados en `.superpowers/brainstorm/80845-1791022646/content/`).

## Global Constraints

- Rama: `feature/gabinete-app` creada desde `origin/main` (`ec6f463`). Los cambios se commitean en esta rama, sin tocar `main`.
- `App.tsx` (rutas) intacta: todas las páginas implicadas ya están cableadas. Sin rutas nuevas ni movidas.
- Sin tokens de color nuevos en `tailwind.config.js`: el acento por colección solo viaja en CSS vars inline (`--sc` = spine, `--c` = niche). La paleta Tailwind actual (brand `#ea580c`, brand-deep `#c2410c`, accent `#f59e0b`, accent-deep `#b45309`, silver `#e6e0d6`, paper `#faf7f2`, cream `#fffdf8`, stone `#98907f`, slate `#6b6259`, graphite `#3d3428`, ink `#1a150f`) y tipografías (`font-display`=Fraunces, `font-sans`=Literata) se reutilizan tal cual; no existe token `font-body`.
- Toda clase CSS nueva en `@layer components` (o el bloque dark de `index.css`) debe incluir su variante **dark** (tonos papel → `#241b12`/`#3a2413`/`#1c150e`, borde `--rule` dark `#4c3a24`, texto `#f3ede3`).
- **Funcionalidad conservada, cero cambios de comportamiento:** botones, ciclos de estado, menús `⋯` (`CardMenu`), «Ver logros» (solo `steamAppId && isPcPlatform(platform)`), «adquirir/En propiedad» solo en deseados, búsquedas exteriores, modales, dialogs, toasts, validación, scroll infinito, `useUnsavedGuard`. Las tarjetas (`BookCard`, `GameCard`, `MagicCard`, `BoardGameCard`, `MovieShowCard`, artículos inline de mazos) **no se re-dibujan**; solo puede cambiar el contenedor/cabecera/pie de página.
- Etiquetas brotón que no se renombran salvo donde la spec lo fija: `OwnerTabs` → «Mi colección»/«Todas» (renombra «Otras colecciones»). Colofones → formato spec («— fin del catálogo · N … —» / «— aún no hay catálogo —») sin cambiar el estado ni la condición (`!hasMore`, o lista vacía). Los textos de `NavbarActiveCollections.test.tsx` («Libros», «Magic», «Mazos») permanecen visibles y el filtrado por `activeCollections` no cambia.
- Plataformas: texto libre (`platformLabel` para legados `PS2`→«PlayStation 2», `WII_U`→«Wii U», `SWITCH`→«Switch»). El patrón `options.concat(valorActual && !options.includes(valorActual) ? [valorActual] : [])` del select **se conserva** en `GameForm`, `GameSearch` y el filtro de `GameListPage` (ya existe en las tres).
- Nombres de archivos en este plan con `espectativas`: rutas exactas relativas a `/home/javi/orca/workspaces/frontend-collection/batfish/` (`src/...`).
- Identidad por colección (fuente única `src/constants/collections.ts`, valores exactos de la spec §3):

| key | label | nick | to | spine `--sc` | niche `--c` | catalogNo |
|---|---|---|---|---|---|---|
| `books` | Libros | Libros | `/coleccion` | `#c2410c` | `#e8633a` | 02 |
| `games` | Videojuegos | Videojuegos | `/juegos` | `#b45309` | `#ee9b2e` | 03 |
| `magic` | Magic | Magic | `/magic` | `#8f3a1e` | `#c96a3e` | 04 |
| `decks` | Mazos | Mazos | `/magic/mazos` | `#92600a` | `#b8862f` | 04-B |
| `boardgames` | Juegos de mesa | Mesa | `/boardgames` | `#6d4a2a` | `#a5783f` | 05 |
| `movieshows` | Películas y series | Cine | `/movieshows` | `#77613a` | `#a08b52` | 06 |

- **Baseline verificado en `feature/gabinete-app` (2026-10-04):** `npm run build` ✅ (solo warning de chunk). `npm test` → **2 fallos preexistentes** (`GameCard.test.tsx`, `GameDetailPrice.test.tsx`, ambos por el eliminado `GamePlatform.PC`) y **316 verdes** (`NavbarActiveCollections`, `BookCard`, `GenreMultiselect` están verdes). `npx tsc --noEmit` → **~44 errores preexistentes**; el gate es que ningún archivo nuevo o tocado introduzca errores nuevos.

**Verificaciones estándar (referidas como V-B, V-T, V-N en cada tarea):**
- **V-B:** `npm run build` → esperado: build ok (warning de chunk >500 kB permitido).
- **V-T:** `npx tsc --noEmit` → esperado: ningún `error TS` haga referencia a los archivos tocados por la tarea (los ~44 preexistentes de otros archivos quedan igual).
- **V-N [archivo/test]:** `npx vitest run <archivo|patrón>` → esperado: PASS salvo los 2 fallos preexistentes (no tocados por este plan). Al final de cada tarea se ejecuta al menos V-B + V-T; V-N solo cuando la tarea toca un componente con test existente o nuevo.

## Review Focus

1. **Modo oscuro:** toda clase nueva tiene variante `.dark`; las páginas reenvueltas no rompen el contraste en oscuro.
2. **Lista vacía vs fin de catálogo:** el colofón muestra «— aún no hay catálogo —» solo con lista vacía y «— fin del catálogo · N … —» solo con ítems y `!hasMore`; ambas conviven con cabecera+pestañas visibles, y no se muestran durante carga ni error.
3. **`--sc`/`--c` fuera de rango:** si una página deja de fijar el var en su raíz, los acentos (filetes, pill, barrita, lomo) caen al fallback de CSS (`#c2410c` para `--sc`, ninguno para `--c`) — incoherente con la colección; cada página reenvuelta fija los dos vars.
4. **Datos/etiquetas que no pueden cambiar en el reenvuelto:** etiquetas de los `<dl>` de detalles (iguales en `MetaList`), textos de botones («← Volver al listado» en Magic, «← Volver a mazos» en Mazos), metas de las tarjetas de resultado de búsqueda (misma concatenación `result.platform · genre · publisher · developer`, etc.).
5. **Tabs/búsqueda del formulario:** el tab por defecto de cada `CreatePage` no cambia (Libros/Videojuegos `'manual'`; Mesa y Cine `'search'`; Libros conserva la tercera pestaña `'barcode'`), y el modal de búsqueda mantiene `role="dialog"` y su pisado con `modal-sheet`.

---

## Task 1: Identidad de colecciones en `collections.ts` + migración de `HomePage`

**Files:**
- Modify: `src/constants/collections.ts`
- Modify: `src/pages/HomePage.tsx` (solo `WARM`/`NICKS` → COLLECTIONS; `ENTITIES` y `NICHE_ICONS` intactos)
- Test: `src/__tests__/collections.test.ts` (nuevo)

**Interfaces:**
- Consumes: nada (parte de la base).
- Produces:
  - `export type CollectionKey = 'books' | 'games' | 'magic' | 'decks' | 'boardgames' | 'movieshows'`
  - `CollectionMeta` ampliado: `{ key: CollectionKey; label: string; nick: string; to: string; accent: { spine: string; niche: string }; catalogNo: string }`
  - `COLLECTIONS: CollectionMeta[]` (mismos 6, ahora con los campos nuevos de la tabla de Global Constraints).
  - `export const COLLECTIONS_BY_KEY: Record<CollectionKey, CollectionMeta>`
  - `toBackendCollectionKey`/`fromBackendCollectionKey` se conservan tal cual (los usa `Navbar` y `HomePage`).

- [ ] **Step 1: Escribir el test fallido** en `src/__tests__/collections.test.ts`

Assertions (valores exactos de la tabla de Global Constraints): `COLLECTIONS` tiene longitud 6 y `COLLECTIONS_BY_KEY['books'].accent.spine === '#c2410c'`, `.niche === '#e8633a'`, `.catalogNo === '02'`, `.nick === 'Libros'`, `.to === '/coleccion'`; comprobar los 6, incluido `decks` (`to === '/magic/mazos'`, `catalogNo === '04-B'`) y `boardgames`/`movieshows` (nombres de key en minúscula). `toBackendCollectionKey('decks') === 'DECKS'` y `fromBackendCollectionKey('DECKS') === 'decks'`.

- [ ] **Step 2: Ejecutar el test y ver que falla**

Run: `npx vitest run src/__tests__/collections.test.ts` → FAIL (campos inexistentes).

- [ ] **Step 3: Ampliar `collections.ts`**

Añadir `CollectionKey`, los campos `nick`/`accent`/`catalogNo` a `CollectionMeta`, rellenar `COLLECTIONS` con los valores de la tabla, y exportar `COLLECTIONS_BY_KEY` construido desde `COLLECTIONS`.

- [ ] **Step 4: Migrar `HomePage.tsx`**

Eliminar `WARM` (26-33) y `NICKS` (36-43) locales. Sustituir su uso por `COLLECTIONS_BY_KEY` con un mapeo local explícito `const KEY: Record<keyof EntityTotals, CollectionKey> = { books:'books', games:'games', magic:'magic', decks:'decks', boardGames:'boardgames', movieShows:'movieshows' }`:
- `WARM[entity.key].spine` → `COLLECTIONS_BY_KEY[KEY[entity.key]].accent.spine` (L279) y `.niche` → `.accent.niche` (L232).
- `NICKS[entity.key]` → `COLLECTIONS_BY_KEY[KEY[entity.key]].nick`.
`ENTITIES`, `NICHE_ICONS`, `ZERO_TOTALS`, `fetchEntityTotals`, `useCountUp`, `AnimatedCount` y todo el JSX se quedan idénticos.

- [ ] **Step 5: V-T + test verde**

Run: `npx vitest run src/__tests__/collections.test.ts` → PASS; `npx tsc --noEmit` → sin errores en `collections.ts`/`HomePage.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/constants/collections.ts src/pages/HomePage.tsx src/__tests__/collections.test.ts
git commit -m "feat: identidad por colección centralizada en COLLECTIONS (nick, accent, catalogNo)"
```

## Task 2: CSS Gabinete — layout (`.nb-rule`, `.page-head`, `.meta-list`, `.filterbar`, `.statusline`, `.cover-frame`, acentos)

**Files:**
- Modify: `src/index.css` (bloque «Gabinete — navegación, listas y detalle» dentro de `@layer components`, al final del bloque L448)

**Interfaces:**
- Consumes: `--rule` light/dark (L204-210), `.rule-double` (L364-366), `.eyebrow` (L224-227).
- Produces (clases usadas por Tasks 4-14; nombres exactos): `.nb-rule`, `.nb-lk.on::after`, `.page-head`, `.rule-double .accent-bar`, `.meta-list`, `.meta-list dt`, `.meta-list dd`, `.filterbar`, `.statusline`, `.cover-frame`, `.cover-frame img`, `.deck-aside` (opcional, envoltura del aside de mazos).

- [ ] **Step 1: Añadir el bloque CSS con sus variantes dark**

Valores guía (adaptables al vocabulario de `index.css`; los tonos papel son los de `--rule` y del css de Home):
- `.nb-rule`: `height: 3px; background: repeating-linear-gradient(90deg, var(--rule) 0 6px, transparent 6px 8px, var(--rule) 8px 14px, transparent 14px 16px);`
- `.nb-lk.on::after`: filete inferior `height: 3px; border-radius: 2px; background: var(--sc);` (el enlace activo lleva el `--sc` inline de su colección; ver Task 6).
- `.page-head`: margenes + kicker/h1/subtipografía (Fraunces vía `font-display`, cursiva `font-sans`); se renderiza con `PageHeader` (Task 4).
- `.rule-double .accent-bar`: `position: absolute; top: -3px; left: 0; width: 44px; height: 3px; background: var(--sc);` junto a `.rule-double { position: relative; }`.
- `.meta-list`: `display: grid; grid-template-columns: 1fr; gap: 12px 24px;` + `@media (min-width: 768px) { .meta-list { grid-template-columns: repeat(2, 1fr); } }` y `@media (min-width: 1024px) { .meta-list.cols-3 { grid-template-columns: repeat(3, 1fr); } }` (variante `.cols-2` para el detalle de mesa). `dt` en versalitas estilo `.eyebrow` (gris `#98907f`, ~11px, letter-spacing 1.2px), `dd` `font-display` semibold ≈14px.
- `.filterbar`: `border: 1px solid var(--rule); border-radius: 4px 12px 12px 4px; background: linear-gradient(180deg, #fffdf8, #faf3e8); padding: 14px 16px;` + `::before` filete lateral `width: 3px; background: var(--sc); border-radius: 4px 0 0 4px;` (sustituye a los paneles `#filtros`/`#filtros-magic`).
- `.statusline`: centrado, versalitas Fraunces ~11px, letter-spacing 0.8px, color `#98907f`, `margin-top: 18px;`.
- `.cover-frame`: `position: relative; width: fit-content;` con lomo: `::before { content:''; position: absolute; left: 0; top: 0; bottom: 0; width: 9px; background: var(--sc, #c2410c); box-shadow: inset -3px 0 4px rgba(0,0,0,.22); border-radius: 3px 0 0 3px; }` y `img { border: 1px solid var(--rule); border-radius: 4px 10px 10px 4px; box-shadow: 0 18px 40px -24px rgba(58,36,14,.55); }`.
- **Dark:** cada clase lleva su bloque `.dark .clase { … }` con los tonos del css home (`#241b12`/`#1c150e` superficies, `#4a4036` bordes, `#b8ad9c`/`#98907f` grises).

- [ ] **Step 2: V-B + V-T**

Run: `npm run build` → ok; `npx tsc --noEmit` → sin archivos nuevos. (CSS no tiene unit test; verificación visual en Tasks 4-14.)

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: clases Gabinete de layout (nb-rule, page-head, meta-list, filterbar, statusline, cover-frame)"
```

## Task 3: CSS Gabinete — formularios y perfil (`.form-panel`, `.fsec`, `.modal-paper`, `.scan-frame`, `.prof-card`, `.chip-niche`, `.prow`, `.avatar`)

**Files:**
- Modify: `src/index.css` (mismo bloque)

**Interfaces:**
- Consumes: nada nuevo.
- Produces (usadas por Tasks 15-23): `.form-panel`, `.fsec`, `.fsec-cap`, `.form-actions`, `.dropzone`, `.scan-frame`, `.modal-paper`, `.result-card`, `.prof-card`, `.chip-niche`, `.prow`, `.dot`, `.avatar`, `.method-tabs`, `.method-tab`, `.picked-commander`, `.ident-dot`.

- [ ] **Step 1: Añadir el bloque CSS con variantes dark**

Valores guía:
- `.form-panel`: el mismo papel que `.filterbar` pero con padding mayor (`20px 22px`) y `display: flex; flex-direction: column; gap: 18px;` (filete lateral `--sc` igual).
- `.fsec`: `border-top: 1px solid var(--rule); padding-top: 16px; margin-top: 18px;` + `:first-child { border-top: 0; margin-top: 0; }`; `.fsec-cap`: versalitas Fraunces ~10px con barrita `12-16px × 2px var(--sc)` antes del texto.
- `.form-actions`: `display: flex; justify-content: flex-end; gap: 9px; border-top: 1px solid var(--rule); padding-top: 16px; margin-top: 4px;`
- `.dropzone`: `border: 1.5px dashed var(--rule); border-radius: 10px; background: #fffdf8; padding: 18px; display: flex; gap: 14px; align-items: center;`
- `.scan-frame`: marco del escáner de ISBN: `border: 1.5px dashed var(--rule); border-radius: 12px; padding: 26px 18px; text-align: center;`
- `.modal-paper`: para los diálogos de búsqueda/impresiones: `background: linear-gradient(180deg,#fffdf8,#faf3e8); border: 1px solid var(--rule); border-radius: 14px; box-shadow: 0 26px 60px -24px rgba(58,36,14,.5);` + `.modal-paper .modal-head { border-bottom: 3px double var(--rule); position: relative; }` (el `PageHeader` interior no se usa aquí; se reemplaza la cabecera `rule-double` del mockup por esta).
- `.result-card`: tarjetas de resultados de búsqueda en papel: `background: linear-gradient(180deg,#fff,#fff8f0); border: 1px solid var(--rule); border-radius: 12px; padding: 11px; display: flex; gap: 12px;` con portada `44×62` (lomo opcional `--sc`).
- `.prof-card`: `background: linear-gradient(180deg,#fffdf8,#faf3e8); border: 1px solid var(--rule); border-radius: 12px; padding: 18px 20px;`
- `.chip-niche`: `display: inline-flex; align-items: center; gap: 7px; background: #fffdf8; border: 1px solid var(--rule); border-left: 3px solid var(--ac, #c2410c); border-radius: 4px 9999px 9999px 4px; padding: 5px 12px 5px 10px;` (el `--ac` se fija inline por colección).
- `.prow`: `display: flex; align-items: center; gap: 12px; padding: 11px 2px; border-top: 1px solid var(--rule);` + `.prow:first-of-type { border-top: 0; }`; `.dot`: `width: 9px; height: 9px; border-radius: 3px; background: var(--ac, #c2410c);`
- `.avatar`: `border-radius: 9999px; background: linear-gradient(135deg,#ea580c,#f59e0b); display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Fraunces'; font-weight: 700;`
- `.method-tabs`: `display: flex; gap: 18px; border-bottom: 1px solid var(--rule);` + `.method-tab { … }` + `.method-tab.on { color: var(--sc); border-bottom: 3px solid var(--sc); }` (sustituye al tablist pill actual de los CreatePage; conserva `role=tablist/tab` en el JSX).
- `.picked-commander` / `.ident-dot`: panel de papel del comandante elegido en Mazos + puntos de identidad de color (`13px` círculos con los colores `W/U/B/R/G`).
- **Dark:** variantes para cada clase (mismos tonos papel dark de la Task 2).

- [ ] **Step 2: V-B + V-T** (mismo criterio).
- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: clases Gabinete de formularios y perfil (form-panel, fsec, modal-paper, prof-card, chip-niche)"
```

## Task 4: `PageHeader` y `MetaList` (nuevos)

**Files:**
- Create: `src/components/PageHeader.tsx`
- Create: `src/components/MetaList.tsx`
- Test: `src/__tests__/PageHeader.test.tsx` (nuevo)
- Test: `src/__tests__/MetaList.test.tsx` (nuevo)

**Interfaces:**
- Consumes: `--sc`/`--c` inline del contenedor de la página (no los fija el componente), clases `.page-head`, `.rule-double .accent-bar`, `.meta-list`.
- Produces:
  - `PageHeader({ eyebrow: string; title: string; subtitle?: ReactNode; actions?: ReactNode })`: `<div className="page-head"><span className="eyebrow">{eyebrow}</span><h1 className="font-display …">{title}</h1>{subtitle && <p className="italic …">{subtitle}</p>}{actions && <div className="…">{actions}</div>}</div><div className="rule-double"><span className="accent-bar" aria-hidden="true" /></div>`
  - `MetaList({ items: { label: string; value: ReactNode }[]; columns?: 2 | 3 })`: `<dl className={`meta-list cols-${columns}`}>…<dt>{label}</dt><dd>{value}</dd>…</dl>` (sin `columns` ⇒ grid responsive default, apilado en móvil).

- [ ] **Step 1: Tests fallidos**

`PageHeader.test.tsx`: renderiza `eyebrow/title/subtitle/actions`; `h1` texto exacto; `.rule-double` presente con `.accent-bar`; sin `subtitle` no renderiza `<p>`.
`MetaList.test.tsx`: render de 2 ítems con label/value exactos; `columns={3}` ⇒ clase `meta-list cols-3`; `columns={2}` ⇒ `cols-2`.

- [ ] **Step 2: V-N fallida** → `npx vitest run src/__tests__/PageHeader.test.tsx src/__tests__/MetaList.test.tsx` → FAIL (no existen).

- [ ] **Step 3: Implementar los dos componentes**

Siguiendo las Interfaces. Disponibilidad de `key` en lista: `MetaList` usa `items.map((item, i) => <div key={i}>` o la etiqueta como key (decisión del implementador; prefiera label salvo duplicados).

- [ ] **Step 4: V-N verde + V-B + V-T**.
- [ ] **Step 5: Commit**

```bash
git add src/components/PageHeader.tsx src/components/MetaList.tsx src/__tests__/PageHeader.test.tsx src/__tests__/MetaList.test.tsx
git commit -m "feat: PageHeader y MetaList compartidos para la familia Gabinete"
```

## Task 5: Retoques compartidos — `OwnerTabs`, `FilterPill`, `EmptyState`, `FormSection`, colofones (`statusline`), esqueletos

**Files:**
- Modify: `src/components/OwnerTabs.tsx`
- Modify: `src/components/FilterPill.tsx`
- Modify: `src/components/EmptyState.tsx`
- Modify: `src/components/FormSection.tsx`
- Modify: `src/components/Skeleton.tsx` y `src/components/SkeletonInline.tsx` (solo tonos papel)
- Test: `src/__tests__/OwnerTabs.test.tsx` (nuevo; añadir si existiera)
- Test: `src/__tests__/FilterPill.test.tsx` (nuevo o ampliado)

**Interfaces:**
- Consumes: `--rule`, `--sc`, papel/gradientes del css home.
- Produces (contratos para Tasks 6-14 y 15-24):
  - `OwnerTabs` **inmutable en props**: `{ value: OwnerTab; onChange: (t: OwnerTab) => void; showMine: boolean }`. Labels: `showMine` false → un span «Todas»; true → «Mi colección» / **«Todas»** (renombra «Otras colecciones»). Activa: `color: var(--sc)` + `border-bottom: 3px solid var(--sc)`; inactiva `text-graphite`. Conserva `role=tablist/tab` y `aria-selected`.
  - `FilterPill` **inmutable en props**: `{ active; onClick; children; label }`. Activa → `background: var(--sc); color: #fff; border-color: transparent;` (clases Tailwind o clase nueva `.filter-pill` en `index.css` con su dark); conserva `aria-pressed`.
  - `EmptyState` **inmutable en props** `{ title; message?; action? }`: icono en caja papel (gradiente brand→accent suave), título Fraunces; el acento de la caja puede tomar `var(--sc)` cuando la página lo fija.
  - `FormSection` **inmutable en props** `{ title; children }`: `<section className="fsec" aria-label={title}><h3 className="fsec-cap">{title}</h3>{children}</section>` (reemplaza el h3 `text-caption …` actual).
  - `SkeletonGrid`/`SkeletonInline`: cambiar `bg-silver/70` de las piezas por tonos papel `#f0e7d8`→del shimmer suave (mantener `aria-busy`, `aria-label` actuales), con su bloque dark.

- [ ] **Step 1: Tests**

`OwnerTabs.test.tsx`: `showMine=false` renderiza «Todas» (un solo tab, `aria-selected=true`); `showMine=true` renderiza «Mi colección» y «Todas»; clic en inactiva dispara `onChange('other')`; la activa tiene la clase de filete (`border-bottom` presente vía clase `owner-tab--active` o equivalente decida), `aria-selected` coherente.
`FilterPill.test.tsx`: `active=true` → `aria-pressed="true"` y clase de relleno activa; `active=false` → `aria-pressed="false"` y sin ella.

- [ ] **Step 2: V-N fallida** → FAIL (clases nuevas).
- [ ] **Step 3: Implementar los retoques** (las 5 modificaciones; las clases de estilo van a `index.css` dentro de la misma tarea si faltan).
- [ ] **Step 4: V-N verde + V-B + V-T**
- [ ] **Step 5: Commit**

```bash
git add src/components/OwnerTabs.tsx src/components/FilterPill.tsx src/components/EmptyState.tsx src/components/FormSection.tsx src/components/Skeleton.tsx src/components/SkeletonInline.tsx src/__tests__/OwnerTabs.test.tsx src/__tests__/FilterPill.test.tsx
git commit -m "feat: retoques Gabinete en OwnerTabs, FilterPill, EmptyState, FormSection y esqueletos"
```

## Task 6: Navbar — tratamiento A (regla doble + filete por colección)

**Files:**
- Modify: `src/components/Navbar.tsx`
- Test: `src/__tests__/NavbarActiveCollections.test.tsx` (debe seguir verde, sin cambios)
- Test: `src/__tests__/Navbar.test.tsx` (nuevo: filete y `--sc`)

**Interfaces:**
- Consumes: `COLLECTIONS_BY_KEY` (Task 1), `.nb-rule`, `.nb-lk.on::after` (Task 2).
- Produces: comportamiento de Navbar con acento por colección.

- [ ] **Step 1: Test nuevo**

`Navbar.test.tsx`: renderiza `MemoryRouter` con `initialEntries={['/coleccion']}` y `Navegación` con mock de `useAuth` (mismo stub que `NavbarActiveCollections.test.tsx`). Assert: el `NavLink` de «Libros» activo tiene `style` con `--sc` = `#c2410c`; el de «Inicio» activo (a `/` con `initialEntries=['/']`) **no** tiene `--sc` en style; el sub-nav Magic renderiza «Cartas» y «Mazos» cuando `activeCollections` los incluye.

- [ ] **Step 2: V-N fallida** → FAIL (sin estilo).
- [ ] **Step 3: Implementar en `Navbar.tsx`**

- Añadir `<div className="nb-rule" aria-hidden="true" />` bajo el `<header>` (o `border-bottom` doble equivalente, sin tocar el sticky).
- En los `NavLink` de navegación principales: cuando `isActive`, `style={{ '--sc': COLLECTIONS_BY_KEY[link.collection].accent.spine } as CSSProperties}` + clase `.nb-lk.on` que da el filete (py-1.5 …). **«Inicio» no aplica `--sc`** (solo peso/fondo activo actual). Los enlaces inactivos mantienen las clases actuales.
- Sub-nav Magic (`magicLinks`): aplicar el mismo tratamiento (`collection: 'magic'` → `#8f3a1e`, `decks` → `#92600a`) en desktop y móvil (móvil conserva su estilo del sub-nav, solo añadir el filete/color del acento en activo).
- **No cambiar textos, estructura DOM de `links`/`magicLinks`, filtrado `collectionVisible` ni `NavbarActiveCollections.test.tsx`** (los textos «Libros», «Magic», «Mazos» siguen presentes; el filtrado oculta Magic por completo si no está en `activeCollections`).

- [ ] **Step 4: V-N verdes** (`NavbarActiveCollections` + `Navbar`) + V-B + V-T.
- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/__tests__/Navbar.test.tsx
git commit -m "feat: navbar Gabinete con regla doble y filete de acento por colección"
```

## Task 7: `BookListPage`

**Files:**
- Modify: `src/pages/BookListPage.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `MetaList` (no), `OwnerTabs` (Task 5), `.filterbar`, `.statusline`, `COLLECTIONS_BY_KEY`.

- [ ] **Step 1: Implementar el reenvuelto** (V-B tras cada paso grande)

- Raíz de la página: `style={{ '--sc': COLLECTIONS_BY_KEY.books.accent.spine, '--c': COLLECTIONS_BY_KEY.books.accent.niche } as CSSProperties}` en el `<section>` raíz. La sección pasa de `flex flex-col gap-24` al vocabulario de cabecera (`gap` que favorezca cabecera compacta; mantener el resto de la página intacto).
- Sustituir el bloque `<h1>…` + `«{n} libros en tu colección · catálogo nº 02»` por `<PageHeader eyebrow="Libros" title="Colección de libros" subtitle={loading ? 'Cargando libros…' : `${totalElements} libro${…} en tu colección · catálogo nº 02`} actions={<action cluster intacto: SortSelect + botón «Filtros» con su badge + «Añadir libro»>} />`. Texts exactos actuales se conservan («Colección de libros», «en tu colección»).
- Panel `#filtros` → `<div id="filtros" className="filterbar …">` (id y `aria-controls` intactos, mismo contenido).
- Pills `OwnerTabs` + fila de `FilterPill`s: sin cambios de JSX (Task 5 ya les dio el filete); solo queda bajo la cabecera.
- Colofón: reemplazar `<p …>No hay más libros</p>` por `<p className="statusline" role="status">— fin del catálogo · {totalElements} libro{…} —</p>` (cuando `!hasMore` y hay ítems) y variante «— aún no hay catálogo —» cuando la lista está vacía; no se muestra durante carga ni error.
- Skeleton/EmptyState: ya vienen de Task 5.

- [ ] **Step 2: V-B + V-T** (sin errores en `BookListPage.tsx`) + V-N `src/__tests__/BookCard.test.tsx` (asegura que no se rompió la tarjeta).
- [ ] **Step 3: Commit**

```bash
git add src/pages/BookListPage.tsx
git commit -m "feat: BookListPage con cabecera Gabinete y colofón statusline"
```

## Task 8: `GameListPage`

**Files:**
- Modify: `src/pages/GameListPage.tsx`

**Interfaces:**
- Consumes: igual que Task 7 con `COLLECTIONS_BY_KEY.games` (`#b45309`/`#ee9b2e`).

- [ ] **Step 1: Implementar el reenvuelto**

Mismos cambios que Task 7 (subtitle con «catálogo nº 03», colofón «— fin del catálogo · N videojuegos —»). **El `select` de plataforma (157-173) NO se toca**: su patrón `platformOptions.concat(platformFilter && !platformOptions.includes(platformFilter) ? [platformFilter] : [])` + `platformLabel` ya satisface la spec (nunca pierde el valor actual) — solo verificar que sigue intacto tras el reenvuelto del panel `.filterbar`. Conservar `usePlatformOptions`/`useGenreOptions`, la grid y el colofón del resto.

- [ ] **Step 2: V-B + V-T** + V-N `src/__tests__/GameCard.test.tsx` (seguirá fallando por preexistente — NO arreglar aquí) y `listGamePlatforms.test.ts` verde.
- [ ] **Step 3: Commit** (`feat: GameListPage con cabecera Gabinete y colofón statusline`).

## Task 9: `MagicListPage` + `DeckListPage`

**Files:**
- Modify: `src/pages/MagicListPage.tsx`
- Modify: `src/pages/DeckListPage.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `.filterbar`, `.statusline`, `COLLECTIONS_BY_KEY.magic` / `.decks`.

- [ ] **Step 1: `MagicListPage`**

- Raíz con `--sc`/`--c` de magic (`#8f3a1e`/`#c96a3e`). Cabecera → `PageHeader eyebrow="Magic" title="Colección Magic" subtitle={… `128 cartas en tu colección · catálogo nº 04`} actions={<cluster actual con SortSelect + «Limpiar» condicional + «Añadir carta Magic»>}`. Panel `#filtros-magic` → `.filterbar` (id y contenido intactos, incluidos los tres selects y el `onSubmit`). Colofón «— fin del catálogo · N cartas —» / «— aún no hay catálogo —».

- [ ] **Step 2: `DeckListPage`**

- Raíz con `--sc`/`--c` de decks (`#92600a`/`#b8862f`). Cabecera → `PageHeader eyebrow="Mazos" title="Colección de mazos Commander" subtitle={… `9 mazos en tu colección · catálogo nº 04-B`} actions={<«Nuevo mazo» only mine>}`. **No hay SortSelect/Filtros** (se conserva la ausencia). El `SearchField` siempre visible se queda tal cual (debajo de la cabecera). Los artículos inline de mazo (163-227) NO se tocan (envuelta `card` intacta; el acento puede venir del `--sc` de la raíz solo si no rompe el interior — verificar visualmente). Colofón «— fin del catálogo · N mazos —» / vacío.

- [ ] **Step 3: V-B + V-T** + V-N (`NavbarActiveCollections` para asegurar que el sub-nav no se rompió).
- [ ] **Step 4: Commit**

```bash
git add src/pages/MagicListPage.tsx src/pages/DeckListPage.tsx
git commit -m "feat: MagicListPage y DeckListPage con cabecera Gabinete y colofón statusline"
```

## Task 10: `BoardGameListPage` + `MovieShowListPage`

**Files:**
- Modify: `src/pages/BoardGameListPage.tsx`
- Modify: `src/pages/MovieShowListPage.tsx`

**Interfaces:**
- Consumes: `COLLECTIONS_BY_KEY.boardgames` (`#6d4a2a`/`#a5783f`), `.movieshows` (`#77613a`/`#a08b52`).

- [ ] **Step 1: `BoardGameListPage`**

Cabecera → `PageHeader eyebrow="Juegos de mesa" title="La sala de juegos" subtitle={… `47 juegos en tu colección · catálogo nº 05`}` con actions (SortSelect + Filtros + «Añadir juego»). Panel `#filtros` → `.filterbar` (SearchField + Géneros). Colofón «— fin del catálogo · N juegos —». Botón «adquirir/En propiedad» en deseados intacto (vive en `BoardGameCard`, no se toca).

- [ ] **Step 2: `MovieShowListPage`**

Cabecera → `PageHeader eyebrow="Películas y series" title="La videoteca" subtitle={… `38 títulos en tu colección · catálogo nº 06`}` acciones intactas (SortSelect con «Novedades», Filtros, «Añadir película/serie»). Panel `#filtros` → `.filterbar` (SearchField + select tipo + Géneros). Colofón «— fin del catálogo · N títulos —».

- [ ] **Step 3: V-B + V-T** + V-N (suites de tarjetas `BoardGameCard`/`MovieShowCard` verdes, si existen).
- [ ] **Step 4: Commit** (`feat: BoardGameListPage y MovieShowListPage con cabecera Gabinete`).

## Task 11: `BookDetailPage`

**Files:**
- Modify: `src/pages/BookDetailPage.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `MetaList`, `.cover-frame`, `--sc` books.

- [ ] **Step 1: Reenvuelto a ficha A**

- Raíz con `--sc`/`--c` books. Conservar `Breadcrumbs` + fila de acciones (`← Volver`, `Editar`, `Eliminar`) y la `rule-double` con `.accent-bar` bajo ella (wrapper nuevo que no cambia los botones ni `goBack`).
- Portada: sustituir `<img className="w-full sm:w-48 h-72 …">`/placeholder por `.cover-frame` (mismo `src`/`alt`, placeholder intacto).
- Head: `PageHeader eyebrow="Libros" title={book.title} subtitle={book.author}` (el h1 actual pasa a PageHeader; `OwnerLine` y badges se quedan debajo tal cual).
- Reemplazar el `<dl className="grid grid-cols-1 sm:grid-cols-3 …">` por `<MetaList columns={3} items={[…]}>` con las **mismas etiquetas y valores exactos** de `details` (Páginas, Editorial, Año, ISBN, Fecha de obtención, Precio de adquisición solo si `state !== WISHLIST`, Fecha de inicio, Fecha de fin).
- Bloques funcionales intactos: bandas de estado (progreso de lectura / «Empezar a leer» / «Ya está en mi posesión»), Comentario, dialogs, toasts, delete → `/coleccion`.

- [ ] **Step 2: V-B + V-T** + V-N (si hay tests de detalle; `BookCard` verde).
- [ ] **Step 3: Commit** (`feat: BookDetailPage con ficha Gabinete (cover-frame + MetaList)`).

## Task 12: `GameDetailPage`

**Files:**
- Modify: `src/pages/GameDetailPage.tsx`

**Interfaces:**
- Consumes: `COLLECTIONS_BY_KEY.games`.

- [ ] **Step 1: Reenvuelto**

Igual que Task 11: `.cover-frame` con `game.thumbnailUrl` (seguir usando `thumbnailUrl`, el mockup muestra la carátula), `PageHeader eyebrow="Videojuegos" title={game.title} subtitle={…}` (conservar `OwnerLine`), `MetaList columns={3}` con las mismas etiquetas (`Fecha de inicio, Fecha de fin, Fecha de obtención, Precio de adquisición, Fuente externa`), Comentario intacto. **«Ver logros» intacto:** `<Link …>Ver logros</Link>` sigue condicionado a `game.steamAppId && isPcPlatform(game.platform)`.

- [ ] **Step 2: V-B + V-T** (y V-N `GameDetailPrice` seguirá fallando por el preexistente — no tocar).
- [ ] **Step 3: Commit** (`feat: GameDetailPage con ficha Gabinete (cover-frame + MetaList)`).

## Task 13: `MagicDetailPage` + `DeckDetailPage`

**Files:**
- Modify: `src/pages/MagicDetailPage.tsx`
- Modify: `src/pages/DeckDetailPage.tsx`

**Interfaces:**
- Consumes: `COLLECTIONS_BY_KEY.magic` / `.decks`.

- [ ] **Step 1: `MagicDetailPage`**

- Raíz con `--sc` magic. Conservar `Breadcrumbs` (Inicio/Magic) + «← Volver al listado» + solo **Eliminar** (no hay Editar). `.cover-frame` alrededor de la imagen (`imageLargeUrl || imageUrl`; placeholder intacto). Header izquierdo: `PageHeader eyebrow="Magic" title={card.name}` + chips (rareza, Foil, Condición, Cantidad) y `OwnerLine` tal cual. El grid interno `grid grid-cols-1 md:grid-cols-[350px_1fr]` se conserva. La **info grid** (Tipo, Set/Edición, Artista, Fuerza/Resistencia solo creatura, Precio estimado) → `MetaList columns={2}` con los mismos pares. «Texto de la carta» y «Notas personales» intactos. `MagicPrintingsPanel` NO se usa aquí (confirmado: solo en `MagicCreatePage`).

- [ ] **Step 2: `DeckDetailPage`**

- Raíz con `--sc` decks. Conservar `Breadcrumbs` (Inicio/Magic/Mazos) + «← Volver a mazos» + acciones (`+ Añadir carta` solo mine + Eliminar). El **aside sticky** (393-448) se conserva como está (o se envuelve con `.deck-aside` papel si no cambia el sticky `lg:sticky lg:top-24`); el `<dl>` interno de Cartas/Distintas NO se convierte a `MetaList` (es vertical compacto). La tabla de cartas (Cant./Carta/Coste/Tipo/Quitar) se conserva íntegra (envuelta `.card` → puede adoptar el papel vía clase, sin tocar estructura ni `min-w-[600px]`). Modal «Añadir carta al mazo» redux intacto (no usa `MagicPrintingsPanel`).

- [ ] **Step 3: V-B + V-T** + V-N (`NavbarActiveCollections`, `BookCard` libres).
- [ ] **Step 4: Commit** (`feat: MagicDetailPage y DeckDetailPage con ficha Gabinete`).

## Task 14: `BoardGameDetailPage` + `MovieShowDetailPage`

**Files:**
- Modify: `src/pages/BoardGameDetailPage.tsx`
- Modify: `src/pages/MovieShowDetailPage.tsx`

**Interfaces:**
- Consumes: `COLLECTIONS_BY_KEY.boardgames` / `.movieshows`.

- [ ] **Step 1: `BoardGameDetailPage`**

- `.cover-frame` con `game.imageUrl || game.thumbnailUrl`; `PageHeader eyebrow="Juegos de mesa" title={game.title}` + badges. `<dl>` → `MetaList columns={2}` (el detalle de mesa usa 2 columnas, no 3) con las mismas etiquetas exactas: Año, Jugadores, Duración, Editorial, Diseñadores, Categorías, Mecánicas, En la colección desde, Precio de adquisición, Dificultad, Jugadas, Última jugada, más Rating BGG y Valoración personal (los dos con `StarRating`). Notas personales intactas. **No hay bloque adquirir aquí** (está en `BoardGameCard`; no se añade nada).

- [ ] **Step 2: `MovieShowDetailPage`**

- Raíz con `--sc` cine. Conservar el **backdrop** (`movieShow.backdropUrl`) como primer hijo y el `.cover-frame` del póster. `PageHeader eyebrow="Películas y series" title={movieShow.title}` + badges (`MovieShowStatusBadge`, chip tipo, Géneros, StarRating). `<dl>` → `MetaList columns={3}` con `Año, Valoración TMDB (★ x/10), Fecha de inicio, Fecha de fin, Fuente externa`. Comentario intacto. Bloque **«Disponible en»** intacto: `StreamingProviderBadges` / mensaje sin plataformas + botón «Actualizar disponibilidad»/«Actualizando…» con `refreshMovieShowProviders`. Etiqueta del breadcrumb «Películas» se conserva.

- [ ] **Step 3: V-B + V-T** + V-N suites propias verdes.
- [ ] **Step 4: Commit** (`feat: BoardGameDetailPage y MovieShowDetailPage con ficha Gabinete`).

## Task 15: `CreateShell` compartido para altas/edición

**Files:**
- Create: `src/components/CreateShell.tsx`
- Test: `src/__tests__/CreateShell.test.tsx` (nuevo)

**Interfaces:**
- Consumes: `Breadcrumbs` (`Crumb`), `PageHeader`, `.method-tabs`/`.method-tab`, `.form-panel`.
- Produces:
  - `CreateShell({ crumbs: Crumb[]; eyebrow: string; title: string; subtitle?: string; tabs?: { value: string; label: string }[]; activeTab?: string; onTabChange?: (value: string) => void; children: ReactNode })`
  - Render: `<Breadcrumbs items={crumbs} />` + `<div className="rule-double"><span className="accent-bar" /></div>` + `<PageHeader eyebrow title subtitle />` + (tabs ⇒ `<div role="tablist" aria-label="Método de alta" className="method-tabs">` con botones `role="tab" aria-selected` y clase `method-tab`/`on`) + `<div className="form-panel">{children}</div>`.
  - Los Create/EditPage pasan su acento inline en su raíz; `CreateShell` no aplica color propio.

- [ ] **Step 1: Test fallido**

`CreateShell.test.tsx`: renders crumbs (último en negrita con `aria-current="page"`), título/subtitle, tabs con la activa `aria-selected`, clic en tab inactiva llama `onTabChange('manual')`, `children` dentro del `.form-panel`, y sin `tabs` no hay tablist.

- [ ] **Step 2: V-N fallida**.
- [ ] **Step 3: Implementar `CreateShell`** (siguiendo Interfaces; reutiliza `Breadcrumbs` existente).
- [ ] **Step 4: V-N verde + V-B + V-T**.
- [ ] **Step 5: Commit** (`feat: CreateShell compartido para altas y edición Gabinete`).

## Task 16: Libros — `BookCreatePage`, `BookEditPage`, `BookForm`, `BookSearch`, `BookIsbnScan`

**Files:**
- Modify: `src/pages/BookCreatePage.tsx` · `src/pages/BookEditPage.tsx`
- Modify: `src/components/BookForm.tsx` · `src/components/BookSearch.tsx` · `src/components/BookIsbnScan.tsx`

**Interfaces:**
- Consumes: `CreateShell`, `.form-panel`, `.fsec`, `.modal-paper`, `.scan-frame`, `.result-card`, `COLLECTIONS_BY_KEY.books`.

- [ ] **Step 1: `BookCreatePage`**

Raíz: `style={--sc/--c books}`. Reemplazar Breadcrumbs+h1+tabs+`<section>` por `<CreateShell crumbs={[{Inicio},{Libros /coleccion},{Añadir}]} eyebrow="Libros" title="Añadir libro" subtitle="Añade un libro a tu colección buscándolo, escaneando su código de barras o introduciendo sus datos manualmente." tabs={[{value:'search',label:'Buscar libro'},{value:'manual',label:'Alta manual'},{value:'barcode',label:'Código de barras'}]} activeTab={mode} onTabChange={(v) => setMode(v as Mode)}>` con el mismo children condicional (`BookSearch`/`BookIsbnScan`/`BookForm isCreate submitLabel="Guardar libro" …`). **Tab por defecto `'manual'` intacto.**

- [ ] **Step 2: `BookEditPage`**

Mismo `CreateShell` sin `tabs`, `title="Editar libro"`, `subtitle="Actualiza los datos del libro."`, crumbs con `{ label: book?.title || 'Detalle', to: /coleccion/:id }` y `{ Añadir → Editar }`. Conservar el botón `Eliminar` de la cabecera (en `actions` del PageHeader o junto a las migas, sin cambiar comportamiento) y los estados Spinner/EmptyState.

- [ ] **Step 3: `BookForm`**

Wrapper `<form>` pasa de `card flex flex-col gap-6` a `form-panel` (sin tocar campos/validación/`onChange` dirty). Pie (404-408): añadir botón `Cancelar` (ghost, `to='/coleccion'` vía `useNavigate` o Link) delante del submit — **solo cosmético, mantener el submit en `Guardando…`/`submitLabel`**. Las `FormSection` ya renderizan `.fsec` por Task 5.

- [ ] **Step 4: `BookSearch`**

Tarjetas de resultado `card card-hover flex gap-5` → `result-card` (papel, portada con lomo en `.cover-frame` si no rompe). El modal de alta pasa de `modal` a `modal-paper` manteniendo `role="dialog" aria-modal`, `max-w-md`, campos, ids y pie «Cancelar»/«Añadir». Overlay `bg-ink/40 backdrop-blur-md modal-sheet` intacto.

- [ ] **Step 5: `BookIsbnScan`**

La tarjeta banner pasa a `.scan-frame` (mantener textos: «Escanea el código de barras del libro con la cámara o escribe su ISBN.», botón `📷 Escanear código`, formulario manual de ISBN, estados Spinner/EmptyState). El modal se reenvuelve a `modal-paper` (mismos campos; **sin cambiar los labels sin `*` actuales**).

- [ ] **Step 6: V-B + V-T** + V-N (`BookCard`, `GenreMultiselect` verdes).
- [ ] **Step 7: Commit** (`feat: alta y edición de libros con formato Gabinete`).

## Task 17: Videojuegos — `GameCreatePage`, `GameEditPage`, `GameForm`, `GameSearch`

**Files:**
- Modify: `src/pages/GameCreatePage.tsx` · `src/pages/GameEditPage.tsx`
- Modify: `src/components/GameForm.tsx` · `src/components/GameSearch.tsx`

**Interfaces:**
- Consumes: `CreateShell`, `.form-panel`, `.modal-paper`, `.result-card`, `COLLECTIONS_BY_KEY.games`.

- [ ] **Step 1: `GameCreatePage`**

`CreateShell` sin cambios de lógica: `eyebrow="Videojuegos"` `title="Añadir videojuego"` subtítulo actual, tabs «Buscar videojuego»/«Alta manual» (valor por defecto `'manual'` intacto), children condicional. Raíz `--sc/--c` games.

- [ ] **Step 2: `GameEditPage`**

`CreateShell` sin tabs, `title="Editar videojuego"` (`subtitle="Actualiza los datos del videojuego."`), Eliminar conservado.

- [ ] **Step 3: `GameForm`**

Wrapper → `form-panel`; añadir `Cancelar` ghost al pie (va a `/juegos`). **No tocar el select de plataforma (213-226 con `concat`), el gate `canPlatinum`, ni el checkbox «Platinar» / Steam App ID condicionales.**

- [ ] **Step 4: `GameSearch`**

Resultados → `result-card` (meta line sin cambios: `[platform, genre, publisher, developer].filter(Boolean).join(' · ')`). Modal → `modal-paper` (campos intactos, incluido el select de plataforma con concat y el checkbox «Platinar» condicional `isPcPlatform(modalPlatform) && canPlatinum`).

- [ ] **Step 5: V-B + V-T** (y V-N: los 2 preexistentes siguen solo siendo `GameCard`/`GameDetailPrice`).
- [ ] **Step 6: Commit** (`feat: alta y edición de videojuegos con formato Gabinete`).

## Task 18: Magic — `MagicCreatePage`

**Files:**
- Modify: `src/pages/MagicCreatePage.tsx`
- Modify: `src/components/MagicPrintingsPanel.tsx`

**Interfaces:**
- Consumes: `CreateShell` (sin tabs), `.form-panel`, `.modal-paper`, `.result-card`, `COLLECTIONS_BY_KEY.magic`.

- [ ] **Step 1: `MagicCreatePage`**

`CreateShell` sin tabs (`eyebrow="Magic"` `title="Añadir carta Magic"` subtítulo actual). El form de búsqueda inline (inputs/ids intactos: placeholder `Ej. Lightning Bolt, Black Lotus…`, botón «Buscar en Scryfall»/«Buscando…», `inputRef`) dentro del `form-panel`. Grid de resultados (tarjetas `card p-4`) → `.result-card` conservando imagen `w-full h-48`, `Cantidad` con su input `w-24`, botón «Elegir impresión». Conservar `MagicPrintingsPanel` en el modal.

- [ ] **Step 2: `MagicPrintingsPanel`**

Dialog `modal w-full max-w-3xl …` → `modal-paper` (mantener `role="dialog" aria-label=…`, header con `rule-double` de acento en el `.modal-head` equivalente, cierre bloq. `busyScryfallId`, grids de impresiones, precios/Foil/etc. intactos).

- [ ] **Step 3: V-B + V-T**.
- [ ] **Step 4: Commit** (`feat: alta Magic con formato Gabinete (búsqueda + impresiones en papel)`).

## Task 19: Mazos — `DeckCreatePage`, `DeckEditPage`

**Files:**
- Modify: `src/pages/DeckCreatePage.tsx` · `src/pages/DeckEditPage.tsx`

**Interfaces:**
- Consumes: `CreateShell` (sin tabs), `.form-panel`, `.fsec` (uso opcional), `.picked-commander`, `.ident-dot`, `COLLECTIONS_BY_KEY.decks`.

- [ ] **Step 1: `DeckCreatePage`**

`CreateShell` sin tabs (`eyebrow="Mazos"` `title="Nuevo mazo Commander"` subtítulo actual). El `<form>` inline `card … p-6 md:p-8` → `form-panel` (mantener ids `deck-name`/`deck-description`, `onChange` dirty, `canCreate`, `useUnsavedGuard`). La sección de comandante: resultados mini → `.result-card` compactos; el bloque «elegido» → `.picked-commander` (imagen + «Identidad: …» con `.ident-dot` + botón «Cambiar»; guarda `isLegendaryCreature` + `/can be your commander/i` intactos). Footer `Cancelar`/«Crear mazo» intacto.

- [ ] **Step 2: `DeckEditPage`**

Mismo envoltorio (sin tabs, `title="Editar mazo"`), formulario inline → `form-panel` (commander como string, `Guardar cambios`, Eliminar, `useUnsavedGuard`). 

- [ ] **Step 3: V-B + V-T**.
- [ ] **Step 4: Commit** (`feat: alta y edición de mazos con formato Gabinete`).

## Task 20: Mesa — `BoardGameCreatePage`, `BoardGameEditPage`, `BoardGameForm`, `BoardGameSearch`

**Files:**
- Modify: `src/pages/BoardGameCreatePage.tsx` · `src/pages/BoardGameEditPage.tsx`
- Modify: `src/components/BoardGameForm.tsx` · `src/components/BoardGameSearch.tsx`

**Interfaces:**
- Consumes: `CreateShell`, `.form-panel`, `.modal-paper`, `.result-card`, `COLLECTIONS_BY_KEY.boardgames`.

- [ ] **Step 1: `BoardGameCreatePage`**

`CreateShell` con tabs «Buscar juego»/«Alta manual» y **tab por defecto `'search'` intacto**, `title="Añadir juego de mesa"`. Raíz `--sc/--c` boardgames.

- [ ] **Step 2: `BoardGameEditPage`** — `CreateShell` sin tabs, `title="Editar juego de mesa"`, Eliminar conservado.

- [ ] **Step 3: `BoardGameForm`**

Wrapper → `form-panel`; añadir `Cancelar` (a `/boardgames`). Secciones `FormSection` (ya `.fsec`): mantener la estructura por `useState` por campo, CSV helpers, y los condicionales OWNED (Fecha de adición*, Precio*, Valoración, Comentario, Jugadas, Última jugada*, Dificultad) intactos.

- [ ] **Step 4: `BoardGameSearch`**

Resultados → `.result-card` (meta `year · min–max jug.` y rating BGG sin cambios). Modal → `modal-paper` (estado «En propiedad» condicional intacto).

- [ ] **Step 5: V-B + V-T**.
- [ ] **Step 6: Commit** (`feat: alta y edición de juegos de mesa con formato Gabinete`).

## Task 21: Cine — `MovieShowCreatePage`, `MovieShowEditPage`, `MovieShowForm`, `MovieShowSearch`

**Files:**
- Modify: `src/pages/MovieShowCreatePage.tsx` · `src/pages/MovieShowEditPage.tsx`
- Modify: `src/components/MovieShowForm.tsx` · `src/components/MovieShowSearch.tsx`

**Interfaces:**
- Consumes: `CreateShell`, `.form-panel`, `.modal-paper`, `.result-card`, `COLLECTIONS_BY_KEY.movieshows`.

- [ ] **Step 1: `MovieShowCreatePage`** — `CreateShell` con tabs «Buscar en TMDB»/«Alta manual», **tab por defecto `'search'` intacto**, `title="Añadir película/serie"`.

- [ ] **Step 2: `MovieShowEditPage`** — `CreateShell` sin tabs, `title="Editar película/serie"`.

- [ ] **Step 3: `MovieShowForm`** — wrapper → `form-panel`; `Cancelar` (a `/movieshows`); condicionales WATCHING/WATCHED y payload `manual-${Date.now()}` intactos.

- [ ] **Step 4: `MovieShowSearch`** — resultados → `.result-card`; el **select de Tipo junto al SearchField** (id `movieshow-type`, options «Películas y series»/`MEDIA_TYPES`) se conserva tal cual; modal → `modal-paper`; en confirmar, `refreshMovieShowProviders(created.id)` best-effort intacto.

- [ ] **Step 5: V-B + V-T**.
- [ ] **Step 6: Commit** (`feat: alta y edición de películas/series con formato Gabinete`).

## Task 22: Perfil — `ProfilePage`, `PublicProfilePage`, `ProfileView`, `UserProfileHeader`

**Files:**
- Modify: `src/pages/ProfilePage.tsx` · `src/pages/PublicProfilePage.tsx`
- Modify: `src/components/ProfileView.tsx` · `src/components/UserProfileHeader.tsx`

**Interfaces:**
- Consumes: `.prof-card`, `.chip-niche`, `.avatar`, `.statusline`, `COLLECTIONS`/`COLLECTIONS_BY_KEY`.

- [ ] **Step 1: `ProfileView` + `UserProfileHeader`**

- Acento **brand** para el perfil (NO de colección): la cabecera usa el naranja Gabinete `#ea580c` (clases actuales `text-brand`/`bg-gradient-to-br from-brand to-accent`). No fijar `--sc` de colección en la raíz del perfil; el `--sc`/`--ac` por colección aparece solo en chips y tabs.
- `UserProfileHeader`: envolver la tarjeta en papel (`card` → puede quedarse, o `.prof-card` si mejora) con avatar `.avatar` (fallback inicial intacto), `h1` Fraunces (`displayName || username`), `@username`, bio. **Chips «Colecciones públicas»** → reemplazar el `<ul className="grid grid-cols-2 sm:grid-cols-3 …">` de li planos por chips `.chip-niche` con `style={{ '--ac': COLLECTIONS_BY_KEY[key].accent.spine }}` (etiqueta + conteo), solo colecciones con `count > 0`.
- `ProfileView`: las **tabs de colección** actuales (botones pill) pasan a `.method-tabs`/`.method-tab` con `style={{ '--sc': COLLECTIONS_BY_KEY[key].accent.spine }}` en la pestaña activa (filete del acento **de esa colección**, no brand). Conservar `aria-pressed`, labels `{label} (count)`, el estado privado (`PRIVATE_COLLECTION` → `EmptyState "Colección privada"`) y el grid de piezas (puede adoptar `.result-card` papel). Colofón → `.statusline` («— fin de la colección pública · N piezas —» + aviso «colección privada oculta» cuando corresponda).

- [ ] **Step 2: `PublicProfilePage`** — sin acciones: se apoya en `ProfileView` (no mostrar `Editar perfil`/`Borrar cuenta`; `ProfilePage` es quien tiene las acciones). Verificar que `PublicProfilePage` no pinte botones de edición (hoy solo renderiza `ProfileView`, comportamiento intacto).

- [ ] **Step 3: `ProfilePage`**

- Añadir `Breadcrumbs` (`Inicio / Perfil`) + `rule-double` con `.accent-bar` **brand** (sin `--sc` de colección) + cabecera (`PageHeader eyebrow="Perfil" title="…"` o el patrón actual de `UserProfileHeader` → decidir en implementación: la vista se queda como está salvo el envoltorio). Botones `Editar perfil` (ghost) y `Borrar cuenta` (ghost danger) intactos; modal «Editar perfil» → `modal-paper` (autovalida Steam ID 17 dígitos; campos Nombre/Bio/Foto/Steam ID intactos) y `ConfirmDialog` «Borrar cuenta» intactos.

- [ ] **Step 4: V-B + V-T**.
- [ ] **Step 5: Commit** (`feat: perfil con formato Gabinete (chips de colección y acento brand)`).

## Task 23: Preferencias — `PreferencesPage`, `CollectionPreferencesPanel`

**Files:**
- Modify: `src/pages/PreferencesPage.tsx`
- Modify: `src/components/CollectionPreferencesPanel.tsx`

**Interfaces:**
- Consumes: `CreateShell` (sin tabs) o envoltorio equivalente, `.form-panel`, `.prow`, `.dot`, `COLLECTIONS_BY_KEY`.

- [ ] **Step 1: `PreferencesPage`**

Radical igual que Edit shell: `CreateShell` sin tabs `eyebrow="Preferencias"` `title="Preferencias"` `subtitle="Configura tus colecciones."` (crumbs `Inicio / Preferencias`); raíz con acento brand (no colección). Body = `CollectionPreferencesPanel`.

- [ ] **Step 2: `CollectionPreferencesPanel`**

Panel `.card` → `.form-panel`. Filas: cada `<li>` pasa a `.prow` con `style={{ '--ac': COLLECTIONS_BY_KEY[key].accent.spine }}` + `.dot` + checkbox (`id={`pref-active-${key}`}` intacto, `accent-brand` actual) + label (label de la colección) + select (`aria-label={`Visibilidad de ${label}`}`, options `Público`/`Privado` intactos). Footer `Guardar cambios`/`Guardando…` intacto (`Promise.all([setActiveCollections, setCollectionVisibility])` + `refreshPreferences` + feedback).

- [ ] **Step 3: V-B + V-T** (+ V-N si existe test del panel).
- [ ] **Step 4: Commit** (`feat: preferencias con formato Gabinete (filas por colección con acento)`).

## Task 24: Verificación final

**Files:** ninguno (solo ejecución).

- [ ] **Step 1: Build**

Run: `npm run build` → ok (solo warning de chunk).

- [ ] **Step 2: TypeScript**

Run: `npx tsc --noEmit` → el contador de errores totales NO supera el baseline (~44 preexistentes) y ninguno referencia archivos tocados por el plan.

- [ ] **Step 3: Tests**

Run: `npm test` → 2 fallos exactos preexistentes (`GameCard.test.tsx`, `GameDetailPrice.test.tsx`) y el resto verdes (incluidos `NavbarActiveCollections`, `PageHeader`, `MetaList`, `OwnerTabs`, `FilterPill`, `CreateShell`, `collections`).

- [ ] **Step 4: Revisión visual (negocio)**

Revisar manualmente contra los mockups aprobados: navegación (filete por colección, Inicio sin filete, sub-nav Magic), 6 listas (cabecera A, colofón, panel `.filterbar`, páginas vacías), 6 detalles (cover-frame + MetaList + paneles propios), altas (11 ventanas: libros×3, videojuegos×2, magic, mazos, mesa×2, cine×2) y perfil (3 ventanas) — comprobando que **ninguna acción funcional desapareció** (menús ⋯, ciclos de estado, «Ver logros», «adquirir», modales de búsqueda, botón «Actualizar disponibilidad», etc.) y que el **modo oscuro** no rompe ninguna clase nueva.

- [ ] **Step 5: Commit final de cualquier ajuste** (`chore: ajustes finales de la revisión visual`).

---

## Self-Review (ejecutada por el autor del plan)

- **Cobertura de la spec:** §3 identidad → Task 1; §4 PageHeader/MetaList → Task 4; §5 retoques (OwnerTabs/FilterPill/EmptyState/colofón/loadings) → Task 5; §6 CSS → Tasks 2-3; §7 navbar → Task 6; §8 listas ×6 → Tasks 7-10; §9 detalles ×6 → Tasks 11-14; §10 estados → Tasks 5/7-10; §10B altas ×6 → Tasks 15-21; §10C perfil/preferencias → Tasks 22-23; §12 verificación → Task 24 (y V-B/V-T/V-N en cada tarea). Fecha/estado/fuente visual y baseline real corregidos en la spec (2026-10-04).
- **Escaneo de pasos:** cada paso permite escribir exactamente una cosa razonable; las interfaces (props, clases, valores) están fijadas por los bloques «Interfaces»/pasos, no por el cuerpo de código (el implementador escribe el JSX/CSS).
- **Consistencia de tipos:** `CollectionKey`, `COLLECTIONS_BY_KEY[key].accent.spine/niche`, `nick`, `catalogNo` se usan con los mismos nombres en Tasks 1, 6-23; `Crumb` viene de `Breadcrumbs.tsx`; `PageHeader`/`MetaList`/`CreateShell` con las props escritas en sus Interfaces sin variaciones posteriores (`columns` solo en `MetaList`).
- **Review Focus:** 1 (dark) → Tasks 2-3 + Task 24 Step 4; 2 (colofón) → Tasks 7-10 + Review Focus; 3 (`--sc` raíz) → cada tarea de página fija los dos vars + Task 24 Step 4; 4 (etiquetas de detalle) → Tasks 11-14; 5 (tabs/modal) → Tasks 15-21.
- **Proporción:** el plan especifica interfaces, valores exactos y contratos; los cuerpos de JSX/CSS quedan al implementador salvo el CSS guía (que es la «copy exacta» que fija la spec/`index.css`).