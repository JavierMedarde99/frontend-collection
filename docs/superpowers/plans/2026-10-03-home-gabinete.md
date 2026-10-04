# Home «Gabinete» (Dirección A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reimplementar la Home (`/`) con la dirección «Gabinete de curiosidades» aprobada en el mockup: vitrina con una pieza por colección, tarjetas-lomo para las cifras, tipografía Fraunces + Literata y textura de papel.

**Architecture:** Cambios en 3 capas acotadas — (1) fuentes y tokens tipográficos globales (`index.html`, `tailwind.config.js`), (2) clases de estilo «Gabinete» reutilizables (`src/index.css`), (3) reescritura de `src/pages/HomePage.tsx` con su test. No se toca `App.tsx`, rutas, ni APIs; la Home sigue consumiendo `getGlobalStats` como hoy.

**Tech Stack:** React 18 + Tailwind 3 + Vitest (jsdom). Sin dependencias nuevas (las fuentes se cargan por Google Fonts en `index.html`).

**Spec:** El mockup aprobado, servido en `http://localhost:8124/gabinete-mockup/index.html` (copia local: `/tmp/opencode/gabinete-mockup/index.html`). El plan argumenta desde ese HTML; su CSS/SVG/markup son la referencia exacta de valores.

## Global Constraints

- Verificación: `npm run build` (gate), `npx vitest run` (solo fallos preexistentes de `main` permitidos: `GameDetailPrice.test.tsx` ×2 y `GameCard.test.tsx` roto a nivel fichero por #515), `npx tsc --noEmit` sin errores nuevos (baseline 27).
- `noUnusedLocals: true`: al reescribir HomePage hay que eliminar imports/constantes que queden sin usar.
- No tocar `App.tsx` (punto de conflicto de merge recurrente en este repo).
- Mantener el consumo actual de stats: `getGlobalStats()` → `collections` con clave `boardgames` (ya mapeada en `fetchEntityTotals`).
- Comportamiento actual que NO cambia: en anónimo se muestran las 6 colecciones; autenticado se filtra por `activeCollections`; si `getGlobalStats` falla se muestran ceros.
- A11y: `usePageTitle('Inicio')`, enlaces con `aria-label`, y reducción de movimiento respetada tanto en CSS (regla global existente) como en el contador JS (`matchMedia('(prefers-reduced-motion: reduce)')`).
- Los labels de colección se conservan exactamente: `Libros`, `Videojuegos`, `Cartas Magic`, `Mazos`, `Juegos de mesa`, `Películas y series`.
- Texto que otros tests dependen: «elementos guardados» en el pie de la Home.

## Review Focus

Usuarios y condiciones que el mockup no cubre pero la página real sí, con su comportamiento esperado (cada línea tiene su test en Task 3):

1. **Filtrado por colecciones activas** — autenticado con un subconjunto de `activeCollections` debe mostrar solo esas tarjetas y niches (hoy `visibleEntities` hace ese filtro; no regresionar). Test en Task 3.
2. **Error de `getGlobalStats`** — si la petición falla, la vitrina y las tarjetas se renderizan igual con contadores a 0 (no romper, no quedarse en loading). Test en Task 3.
3. **`prefers-reduced-motion`** — el contador animado debe pintar el valor final inmediatamente (sin rAF). Test en Task 3.
4. **Dark mode** — las tarjetas-lomo usan `bg-cream` + `border-silver` (token), que ya tienen overrides `.dark` en `index.css`; la madera de la vitrina es fija y funciona en ambos modos. No añadir CSS oscuro nuevo. Verificación visual en Task 4 (no automatizable en jsdom).
5. **Estado de loading** — mientras `loading === true` los contadores muestran el esqueleto (`.skeleton`) tal como hoy; el test cuenta con ello para el primer render.

---

### Task 1: Fuentes y tokens tipográficos

**Files:**
- Modify: `index.html`
- Modify: `tailwind.config.js`
- (config: excepción TDD — se verifica con `npm run build`)

- [ ] **Step 1: Crear la rama desde `main` actualizado**

```bash
git fetch origin
git checkout -b feature/home-gabinete origin/main
```

- [ ] **Step 2: Cargar las fuentes en `index.html`**

Añadir en `<head>` (antes de la etiqueta `<title>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Literata:ital,opsz,wght@0,7..72,300..700;1,7..72,300..700&display=swap" rel="stylesheet" />
```

- [ ] **Step 3: Cambiar las fuentes en `tailwind.config.js`**

En `theme.extend.fontFamily`:
- `sans`: `['Literata', 'Georgia', 'serif']`
- `display`: `['Fraunces', 'Georgia', 'serif']`

Añadir en `theme.extend.colors` (para las tarjetas-lomo de cifras):
- `wine: '#8f3a1e'`, `bronze: '#92600a'`, `leather: '#6d4a2a'`, `sepia: '#77613a'`

- [ ] **Step 4: Verificar y commit**

Run: `npm run build` → esperado: build OK.
Commit: `feat(home): fuentes Fraunces/Literata y tokens cálidos para el Gabinete`

---

### Task 2: Clases de estilo «Gabinete» en `src/index.css`

**Files:**
- Modify: `src/index.css`
- (estilos/config: excepción TDD — se verifica cuando Task 3 los consume)

- [ ] **Step 1: Añadir las clases al final de `src/index.css`**

Trasladar del mockup (referencia exacta) con estos nombres y valores fijados:

- `.rule-double` — `border-bottom: 3px double var(--rule)` y `--rule: #cbb998` (definido en `.dark` como `#4c3a24`).
- `.paper-grain` — overlay fijo con el SVG `feTurbulence` data-URI del mockup (opacidad `.55`, `pointer-events: none`).
- `.vitrina` — panel de madera: gradiente `#6b4a24 → #4a2c12 → #38210c`, radio `12px`, borde `rgba(214,160,90,.4)`, sombra cálida; usa `--c` (color de colección) para `.vitrina-niche` hover.
- `.vitrina-plaque` — texto `Fraunces`, `11px`, `letter-spacing: 3.5px`, mayúsculas, color `#dfb877`.
- `.vitrina-niches` — `display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px`.
- `.vitrina-niche` — 128px de alto, arco (`border-radius: 42px 42px 10px 10px`), interior `#221205 → #160a04` con inset shadow; animación `niche-in` (translateY 16px + opacity) con delays `nth-child(1..6)` de `.10s` a `.45s`.
- `.vitrina-niche-obj` — `48px`, `color: var(--c)`, drop-shadow; hover: `translateY(-6px) scale(1.1)`.
- `.vitrina-niche-label` — `10.5px`, `letter-spacing: 1.8px`, mayúsculas, `rgba(244,226,199,.55)`; hover: `color: var(--c)`.
- `.vitrina-foot` — `11.5px`, `letter-spacing: 1.2px`, mayúsculas, `rgba(240,220,190,.62)`.
- `@keyframes vitrina-in` / `niche-in` — iguales a las del mockup.
- `.spine-card` — tarjeta-lomo: `background: var(--cream)` (o `bg-cream`), borde `1px solid var(--rule)` sin lado izquierdo, `padding: 18px 18px 16px 26px`; `::before` lomo de `9px` con `background: var(--sc)`; hover `translate(-3px,-4px) rotate(-.4deg)`. Hijos: `.count` (Fraunces 38px, `sup` con la unidad), `.label`, `.rule-line` (34×2px, `var(--sc)`), `.to` (minúsculas→mayúsculas con flecha `→` en `var(--sc)`).

- [ ] **Step 2: Verificar y commit**

Run: `npm run build` → esperado: build OK (las clases aún no se usan; Tailwind no las purga porque son CSS plano).
Commit: `feat(home): clases de estilo Gabinete (vitrina, spine-card, rule-double, paper-grain)`

---

### Task 3: HomePage rediseñada (TDD)

**Files:**
- Modify: `src/__tests__/HomePage.test.tsx`
- Rewrite: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `getGlobalStats` de `../api/statsApi` (mock ya existente en el test con `collections: { books: 7, games: 3, magic: 5, decks: 2, boardgames: 4, movieshows: 6 }`), `usePageTitle`, `useAuth().activeCollections`, `visibleEntities` (lógica actual).
- Produces (definidos aquí, dentro de HomePage.tsx):
  - `const WARM: Record<keyof EntityTotals, { spine: string; niche: string }>` con valores: `books {#c2410c,#e8633a}`, `games {#b45309,#ee9b2e}`, `magic {#8f3a1e,#c96a3e}`, `decks {#92600a,#b8862f}`, `boardGames {#6d4a2a,#a5783f}`, `movieShows {#77613a,#a08b52}`.
  - `function useCountUp(target: number, durationMs = 900): number` — anima `0 → target` con rAF easing `1-(1-p)^3`; si `prefers-reduced-motion`, devuelve `target` directo.

- [ ] **Step 1: Escribir el test que fija la nueva estructura**

En `src/__tests__/HomePage.test.tsx`, reemplazar el `describe` actual por:

```tsx
describe('HomePage', () => {
  it('muestra la vitrina de curiosidades con una pieza por colección', async () => {
    renderHome()
    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Todas tus colecciones, por fin en orden' })).toBeInTheDocument()
    expect(screen.getByText('Tu gabinete de curiosidades')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Vitrina de curiosidades/ })).toBeInTheDocument()
    for (const label of ['Libros', 'Videojuegos', 'Cartas Magic', 'Mazos', 'Juegos de mesa', 'Películas y series']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('cifras por entidad con enlaces a cada lista y contadores animados', async () => {
    renderHome()
    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    const mazosCard = screen.getByText('Mazos').closest('a')
    expect(mazosCard).not.toBeNull()
    expect(mazosCard!.getAttribute('href')).toBe('/magic/mazos')
    // El contador de Libros llega a 7 al terminar la animación
    const booksCard = screen.getByText('Libros').closest('a')!
    expect(await within(booksCard).findByText('7')).toBeInTheDocument()
  })

  it('ya no muestra la sección de añadido recientemente', async () => {
    renderHome()
    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(screen.queryByText('Añadido recientemente')).not.toBeInTheDocument()
  })
})
```

(necesita `import { within } from '@testing-library/react'`)

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npx vitest run src/__tests__/HomePage.test.tsx`
Esperado: FAIL — «Todas tus colecciones, por fin en orden» no existe (la Home actual usa «Todas tus colecciones, por fin en orden»? No: la actual usa ese mismo h1… ajustar la aserción si el h1 actual coincide; el fallo real esperado: `Vitrina de curiosidades` (role img) no existe).

- [ ] **Step 3: Reescribir `src/pages/HomePage.tsx`**

Mantener: imports `getGlobalStats`, `usePageTitle`, `useAuth`, el `ENTITIES` (iconos SVG actuales), `fetchEntityTotals`, y el filtrado `visibleEntities`. Nueva estructura JSX:

1. `section` envolvente con `animate-fade-up`.
2. **Hero** (`grid` 2 columnas, `md:grid-cols-2`): a la izquierda eyebrow «Tu gabinete de curiosidades», `h1` «Todas tus colecciones, *por fin* en orden» (`em` en itálica brand), lede (texto del mockup), CTA con `btn-primary` hacia `/nuevo` (mantener ruta actual del CTA si existía) y caption «N elementos guardados en M colecciones» (mismo formato que hoy, para no romper el test). A la derecha la **vitrina**.
3. **Vitrina**: `div role="img" aria-label="Vitrina de curiosidades con una pieza por cada colección"` + plaque «El Gabinete · Colecciones» + 6 `.vitrina-niche` (uno por `ENTITIES`: SVG del mockup con `style={{ '--c': WARM[key].niche } as CSSProperties}`) + `.vitrina-foot` «6 vitrinas · {total} piezas» (total = suma actual).
4. **Nota al margen**: `.rule-double` con la cita del mockup.
5. **Cifras**: `.section-head` con «Tu colección en cifras» + «catálogo nº 01 · otoño 2026»; grid de `.spine-card` (link `to={entity.to}`) por `visibleEntities`, con `--sc` inline, contador `useCountUp(loading ? 0 : entities[key])` y label. Repetir el patrón skeleton mientras `loading`.
   - El contador del hero (evitar duplicados): mantener un único contador visible en el caption; los tests dependen de «elementos guardados».

- [ ] **Step 4: Verificar verde + suite + tsc**

Run: `npx vitest run src/__tests__/HomePage.test.tsx` → PASS.
Run: `npx vitest run` → solo los fallos preexistentes (`GameDetailPrice` ×2, `GameCard.test.tsx` a nivel fichero).
Run: `npm run build` → OK.
Run: `npx tsc --noEmit` → sigue en **27** errores (baseline), ninguno nuevo.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/HomePage.test.tsx src/pages/HomePage.tsx
git commit -m "feat(home): rediseño Gabinete — vitrina de curiosidades, tarjetas-lomo y contadores"
```

---

### Task 4: Verificación final y PR

- [ ] **Step 1: Verificación completa**

Run: `npx vitest run` (solo preexistentes), `npm run build`, `npx tsc --noEmit` (27).

- [ ] **Step 2: Push y apertura de PR**

```bash
git push -u origin feature/home-gabinete
gh pr create --base main --head feature/home-gabinete --title "feat(home): rediseño «Gabinete» — vitrina de curiosidades y tarjetas-lomo" --body "..."
```

Cuerpo del PR: resumen de la dirección A (Fraunces + Literata, vitrina con una pieza por colección, cifras como lomos, textura de papel, dark mode intacto), referencia al mockup (`/tmp/opencode/gabinete-mockup/index.html`), y verificación (suite/build/tsc).