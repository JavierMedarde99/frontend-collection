# Issue #578 — Videojuegos duplicados por plataforma (frontend)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consumir `GET /api/v1/games?groupBy=game` y pintar una tarjeta por juego (`GameGroup`) en `GameListPage`, con filas por plataforma. Extraer lógica de `GameCard` a `useGameRecordActions` para reutilizar en `GameCard` y `GameGroupCard`.

**Architecture:** Se agregan `GameGroup` y `PageGameGroupResponse`, se extiende `gamesApi.ts`, se crea `useGameRecordActions` (extrae diálogos, `gameToPayload`, `applyStatus`), se crea `GameGroupCard`, se modifica `GameListPage` para usar `groupBy=game` y `GameGroupCard`, y se agrega accesibilidad (`aria-label` con plataforma). `GameCard` conserva su JSX pero usa el hook.

**Tech Stack:** React 18 + TypeScript + Vite 5 + Tailwind 3 + React Router 6. Tests con vitest.

**Spec:** `docs/superpowers/specs/2026-10-24-issue-578-game-group-design.md`

---

## Global Constraints

- `listGames` acepta `groupBy?: 'game'`; el backend ordena las plataformas alfabéticamente, así que `games[0]` es la primera fila.
- `useGameRecordActions` debe incluir `gameToPayload`, `applyStatus`, los tres diálogos (`GameStateDialog`, `AcquisitionGameDialog`, `CompleteGameDialog`), y los estados `override`, `saving`, `actionError`.
- `GameCard` no se borra; se refactoriza para usar el hook sin duplicar lógica.
- `GameGroupCard`: cabecera con portada + título enlazado al primer registro (`games[0].id`); filas con `GamePlatformBadge`, `GameStatusBadge`, `StarRating`, y botones según estado (cada fila invoca `useGameRecordActions` con su `game`).
- Accesibilidad: `aria-label` en cada botón de fila debe incluir plataforma (`Marcar ${title} (${platform}) como en posesión`). Fila como `listitem` en `list`.
- `npm run build` es la verificación principal; `npm test` debe pasar (excepto 2 tests preexistentes que fallan en `main`).
- No se incluye recoger filas (`+2 plataformas`) — fuera de alcance.

## Review Focus

1. `listGames` con `groupBy=game`: ¿el tipo de retorno (`PageGameResponse | PageGameGroupResponse`) se maneja correctamente en `GameListPage` y `useInfiniteScroll`?
2. `useGameRecordActions`: ¿cada fila de `GameGroupCard` usa su propio `game` y sus propios diálogos, sin interferir con otras filas?
3. `GameGroupCard` accesibilidad: ¿cada botón de fila tiene `aria-label` que incluye la plataforma?
4. Título enlazado al primer registro: ¿el `key` del grupo es `group.gameKey` y el enlace es a `games[0].id`?
5. `GameCard`: ¿la refactorización al hook no rompe los diálogos ni los `aria-label` existentes?

---

## File Structure

- `src/types/Game.ts` — agregar `GameGroup`
- `src/types/GameApi.ts` — agregar `PageGameGroupResponse`, `groupBy` en `ListGamesParams`
- `src/hooks/useGameRecordActions.ts` — nuevo hook
- `src/components/GameCard.tsx` — refactorizar con hook
- `src/components/GameGroupCard.tsx` — nuevo componente
- `src/pages/GameListPage.tsx` — modificar para `groupBy=game` y `GameGroupCard`
- `src/api/gamesApi.ts` — agregar `groupBy` en `listGames`
- `tests/components/GameGroupCard.test.tsx` — nuevo
- `tests/pages/GameListPage.test.tsx` — modificar

---

### Task 1: Tipos (`GameGroup`, `PageGameGroupResponse`, `groupBy`)

**Files:**
- Create: —
- Modify: `src/types/Game.ts`, `src/types/GameApi.ts`
- Test: —

**Interfaces:**
- Consumes: `Game` existente (`src/types/Game.ts`)
- Produces: `GameGroup`, `PageGameGroupResponse`, `ListGamesParams` actualizado

- [ ] **Step 1: Agregar `GameGroup` en `src/types/Game.ts`**

```ts
export interface GameGroup {
  gameKey: string
  title: string
  thumbnailUrl?: string
  games: Game[]
}
```

- [ ] **Step 2: Agregar `PageGameGroupResponse` y `groupBy` en `src/types/GameApi.ts`**

```ts
export interface PageGameGroupResponse {
  content: GameGroup[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}
```

En `ListGamesParams`: agregar `groupBy?: 'game'`.

- [ ] **Step 3: Verificar que `src/types/index.ts` exporta los nuevos tipos**

Run: `grep -n "GameGroup\|PageGameGroupResponse" src/types/index.ts`
Expected: ambos tipos exportados.

- [ ] **Step 4: Commit**

```bash
git add src/types/Game.ts src/types/GameApi.ts src/types/index.ts
git commit -m "feat(#578): add GameGroup and PageGameGroupResponse types"
```

---

### Task 2: API (`listGames` con `groupBy`)

**Files:**
- Create: —
- Modify: `src/api/gamesApi.ts`
- Test: `tests/api/gamesApi.test.ts` (si existe; si no, verificar con `npm run build`)

**Interfaces:**
- Consumes: `ListGamesParams` actualizado (Task 1)
- Produces: `listGames` retorna `Promise<PageGameResponse | PageGameGroupResponse>`

- [ ] **Step 1: Escribir el test de `listGames` con `groupBy` (o verificar construcción)**

Si no existe `tests/api/gamesApi.test.ts`, saltar a implementación.

- [ ] **Step 2: Modificar `listGames` en `src/api/gamesApi.ts`**

Agregar `groupBy?: 'game'` a la destructuración y `search.set('groupBy', groupBy)` cuando esté presente. El retorno sigue siendo `request<PageGameResponse>`; para simplificar, se puede usar `request<any>` o una sobrecarga, pero para evitar errores de TypeScript, se define:

```ts
export function listGames(params: ListGamesParams = {}): Promise<PageGameResponse | PageGameGroupResponse> {
  ...
  if (groupBy) search.set('groupBy', groupBy)
  ...
  return request<PageGameResponse | PageGameGroupResponse>(...) as Promise<PageGameResponse | PageGameGroupResponse>
}
```

- [ ] **Step 3: Verificar `npm run build`**

Expected: PASS (o solo errores preexistentes).

- [ ] **Step 4: Commit**

```bash
git add src/api/gamesApi.ts
git commit -m "feat(#578): add groupBy to listGames"
```

---

### Task 3: Hook `useGameRecordActions`

**Files:**
- Create: `src/hooks/useGameRecordActions.ts`
- Modify: — (luego `GameCard` en Task 4)
- Test: `tests/hooks/useGameRecordActions.test.ts` (opcional; si no existe, verificar con `npm test`)

**Interfaces:**
- Consumes: `updateGame` (`src/api/gamesApi.ts`), `Game`, `GameFormData`
- Produces: `record`, `saving`, `actionError`, funciones para abrir diálogos (`openPlaying`, `openAcquiring`, `openCompleting`), `onSavePlaying`, `onSaveAcquiring`, `onSaveComplete`

- [ ] **Step 1: Escribir el hook**

Extraer `gameToPayload`, `applyStatus`, `startPlaying`, `markAsOwned`, `markComplete`. El hook recibe `game: Game` y expone:
- `record`: `Game` con `override` aplicado
- `saving`: boolean
- `actionError`: `string | null`
- `openPlaying`, `openAcquiring`, `openCompleting`: funciones que abren diálogos
- `onSavePlaying`, `onSaveAcquiring`, `onSaveComplete`: funciones que llaman a `applyStatus`
- Los componentes `GameStateDialog`, `AcquisitionGameDialog`, `CompleteGameDialog` se mantienen en `GameCard`/`GameGroupCard`; el hook no los devuelve como JSX, solo los estados y funciones para montarlos.

- [ ] **Step 2: Escribir test básico (opcional)**

Si no hay test, saltar.

- [ ] **Step 3: Verificar `npm run build`**

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGameRecordActions.ts
git commit -m "feat(#578): extract useGameRecordActions hook"
```

---

### Task 4: `GameCard` con `useGameRecordActions`

**Files:**
- Create: —
- Modify: `src/components/GameCard.tsx`
- Test: `tests/components/GameCard.test.tsx` (verificar que sigue pasando)

**Interfaces:**
- Consumes: `useGameRecordActions` (Task 3), diálogos (`GameStateDialog`, `AcquisitionGameDialog`, `CompleteGameDialog`)
- Produces: `GameCard` refactorizado; mantiene JSX, diálogos y `aria-label`

- [ ] **Step 1: Reemplazar lógica interna por `useGameRecordActions(game)` en `GameCard`**

Eliminar `gameToPayload`, `applyStatus`, `override`, `saving`, `actionError`, `startPlaying`, `markAsOwned`, `markComplete` del componente. Importar `useGameRecordActions` y usar `record`, `saving`, `actionError`, `openPlaying`, `onSavePlaying`, etc. Los diálogos se mantienen montados con los props del hook.

- [ ] **Step 2: Verificar que `aria-label` sigue incluyendo `game.title` (sin plataforma, ya que es un registro suelto)**

- [ ] **Step 3: Correr `npm test` (o al menos `npm run build`)**

Expected: `GameCard` funciona igual; no se rompen los diálogos.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameCard.tsx
git commit -m "feat(#578): refactor GameCard to useGameRecordActions"
```

---

### Task 5: `GameGroupCard`

**Files:**
- Create: `src/components/GameGroupCard.tsx`, `tests/components/GameGroupCard.test.tsx`
- Modify: —
- Test: `tests/components/GameGroupCard.test.tsx`

**Interfaces:**
- Consumes: `GameGroup` (Task 1), `useGameRecordActions` (Task 3), `GamePlatformBadge`, `GameStatusBadge`, `StarRating`, `Link`
- Produces: `GameGroupCard` con cabecera, filas por plataforma, accesibilidad (`aria-label` con plataforma)

- [ ] **Step 1: Escribir `GameGroupCard`**

Prop: `group: GameGroup`.
Cabecera: portada (`group.thumbnailUrl` o la del primer `game`), título enlazado a `/juegos/${group.games[0].id}`.
Filas: `group.games.map(game => ...)`. Cada fila:
- `GamePlatformBadge` con `game.platform`
- `GameStatusBadge` con `game.status`
- `StarRating` con `game.userRating`
- Botones según `game.status` (usando `useGameRecordActions(game)`); `aria-label` incluye `game.platform` (`Marcar ${group.title} (${game.platform}) como en posesión`).
- Cada fila es `listitem` dentro de un `list`.
- Cada fila tiene sus propios diálogos montados con `useGameRecordActions(game)`.

- [ ] **Step 2: Escribir test `tests/components/GameGroupCard.test.tsx`**

Verificar:
- Hay `N` filas con plataforma y estado (`expect(screen.getAllByRole('listitem')).toHaveLength(group.games.length)` o similar).
- Cada botón de fila llama a `updateGame` con el `id` de esa fila.
- El título enlaza al primer registro (`group.games[0].id`).

- [ ] **Step 3: Correr `npm test`**

Expected: test pasa (o se corrige hasta pasar).

- [ ] **Step 4: Commit**

```bash
git add src/components/GameGroupCard.tsx tests/components/GameGroupCard.test.tsx
git commit -m "feat(#578): add GameGroupCard with rows per platform"
```

---

### Task 6: `GameListPage` con `groupBy=game`

**Files:**
- Create: —
- Modify: `src/pages/GameListPage.tsx`
- Test: `tests/pages/GameListPage.test.tsx`

**Interfaces:**
- Consumes: `listGames` actualizado (Task 2), `GameGroupCard` (Task 5), `useInfiniteScroll`
- Produces: `GameListPage` renderiza `GameGroupCard` con `groupBy: 'game'`

- [ ] **Step 1: Modificar `GameListPage`**

Agregar `groupBy: 'game'` al `fetchPage`. El tipo `items` pasa a ser `GameGroup[]` (se maneja con el tipo genérico de `useInfiniteScroll`). Reemplazar `GameCard` por `GameGroupCard` en el renderizado (`games.map(group => <GameGroupCard key={group.gameKey} group={group} readOnly={...} onDelete=... />`).

Nota: `onDelete` debe recibir el `id` del registro específico que se quiere eliminar; como `GameListPage` pasa `onDelete` a `GameCard`, para `GameGroupCard` el `onDelete` debe ser adaptado: cada fila de `GameGroupCard` debe poder eliminar su propio registro (`game.id`). El `GameGroupCard` recibe `onDelete` como prop que recibe un `gameId: string`, o el componente maneja la eliminación internamente. Según el issue, `GameListPage` debe seguir funcionando; dado que `GameGroupCard` tiene filas con registros individuales, `onDelete` debe ser llamado con el `id` del registro de la fila.

- [ ] **Step 2: Modificar `tests/pages/GameListPage.test.tsx`**

Verificar que `listGames` se llama con `groupBy=game` y que se renderiza `GameGroupCard`.

- [ ] **Step 3: Correr `npm test` y `npm run build`**

Expected: ambos pasan (o se corrigen errores nuevos, no preexistentes).

- [ ] **Step 4: Commit**

```bash
git add src/pages/GameListPage.tsx tests/pages/GameListPage.test.tsx
git commit -m "feat(#578): use groupBy=game and GameGroupCard in GameListPage"
```

---

### Task 7: Verificación final y PR

**Files:**
- Modify: —
- Test: `npm run build`, `npm test`

**Interfaces:**
- Consumes: todos los cambios anteriores
- Produces: PR lista, sin errores nuevos

- [ ] **Step 1: Verificar `npm run build`**

Expected: PASS (sin errores nuevos; los ~44 preexistentes de `main` no cuentan).

- [ ] **Step 2: Verificar `npm test`**

Expected: PASS (excepto los 2 tests preexistentes que fallan en `main`).

- [ ] **Step 3: Verificar accesibilidad (`aria-label` con plataforma)**

Verificar que cada botón en `GameGroupCard` tiene `aria-label` que incluye la plataforma.

- [ ] **Step 4: Crear PR**

```bash
git push origin feature/578-videojuegos-duplicados-plataforma
echo "Crear PR en GitHub: https://github.com/JavierMedarde99/frontend-collection/compare/main...feature/578-videojuegos-duplicados-plataforma"
```

- [ ] **Step 5: Confirmar con el usuario que la PR está lista**

---

## Plan Review

- Plan cubre todas las secciones del spec: tipos, API, hook, `GameCard`, `GameGroupCard`, `GameListPage`, accesibilidad, tests.
- Cada paso es una acción con resultado verificable.
- No hay código duplicado (el hook se reutiliza).
- `GameCard` no se elimina; se conserva con el hook.
- `groupBy` no es un filtro del usuario; `GameListPage` lo usa siempre.
