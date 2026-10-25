# Issue #578 — Videojuegos duplicados por plataforma (frontend)

## Entendimiento acordado
Pintar una sola tarjeta por juego (`GameGroup`) en `GameListPage`, con una fila por plataforma dentro. Cada fila conserva su propio estado, nota y botones. El título enlaza al primer registro (plataforma alfabéticamente menor). Se consume `GET /api/v1/games?groupBy=game`.

## Diseño

### Tipos (`src/types/Game.ts`, `src/types/GameApi.ts`)
- `GameGroup`: `gameKey`, `title`, `thumbnailUrl?`, `games: Game[]`
- `PageGameResponse`: se reutiliza; `content` será `Game[]` o `GameGroup[]` dependiendo del query. Para evitar ambigüedad, `listGames` devolverá un tipo genérico o una unión. Dado que el backend devuelve `Page<GameGroup>` cuando `groupBy=game`, se agrega:
  - `PageGameGroupResponse`: `content: GameGroup[]`, mismo resto de campos (`totalPages`, `totalElements`, ...)
- `ListGamesParams`: agregar `groupBy?: 'game'`

### API (`src/api/gamesApi.ts`)
- `listGames(params)`: agregar `groupBy?: 'game'`. Si está presente, incluir `search.set('groupBy', groupBy)`.
- Se mantiene `PageGameResponse` para registros sueltos; `listGames` devolverá `PageGameResponse | PageGameGroupResponse` (o un tipo unificado con `content: unknown`). Dado TypeScript, se recomienda:
  - `PageGameResponse` con `content: Game[]`
  - `PageGameGroupResponse` con `content: GameGroup[]`
  - `listGames` retorna `Promise<PageGameResponse>` por defecto y `Promise<PageGameGroupResponse>` cuando `groupBy` está presente. Esto requiere una sobrecarga o un tipo de retorno dinámico. Para simplificar, se define:
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
  - `listGames` retorna `Promise<PageGameResponse | PageGameGroupResponse>`.

### Hook reutilizable (`src/hooks/useGameRecordActions.ts`)
- Extrae de `GameCard`:
  - `gameToPayload(game, patch)`
  - Estado `override`, `saving`, `actionError`
  - `applyStatus(patch)` con `updateGame`
  - `startPlaying`, `markAsOwned`, `markComplete`
  - Diálogos: `GameStateDialog`, `AcquisitionGameDialog`, `CompleteGameDialog`
- Expone: `record` (con override aplicado), `saving`, `error`, y funciones para abrir diálogos (`openPlaying`, `openAcquiring`, `openCompleting`), `onSavePlaying`, `onSaveAcquiring`, `onSaveComplete`, y los componentes `PlayingDialog`, `AcquiringDialog`, `CompletingDialog` (o los diálogos se mantienen en el componente que los usa). Dado que `GameCard` y `GameGroupCard` necesitan los diálogos en su JSX, el hook debe devolver también los elementos JSX o el componente debe importar los diálogos directamente. Para evitar complejidad, el hook expone las funciones y los estados; el componente importa los diálogos y los renderiza con los props del hook.
- El hook recibe `game: Game` como prop/argumento.

### Componentes
- `useGameRecordActions` (hook, `src/hooks/useGameRecordActions.ts`): no es un componente separado. El componente (`GameCard` o `GameGroupCard`) importa los diálogos (`GameStateDialog`, `AcquisitionGameDialog`, `CompleteGameDialog`) y los monta con los props del hook.

- `GameCard` (`src/components/GameCard.tsx`):
  - Usa `useGameRecordActions(game)`.
  - Mantiene todo su JSX actual, reemplazando `gameToPayload`, `applyStatus`, `override`, `saving`, diálogos internos por los valores del hook.

- `GameGroupCard` (`src/components/GameGroupCard.tsx`):
  - Prop: `group: GameGroup`
  - Cabecera: portada (`group.thumbnailUrl` o la del primer `game`), título (`group.title`) enlazado al primer registro (`games[0].id` ordenado alfabéticamente por plataforma; el backend ya ordena así).
  - Filas: una fila por `game` en `group.games`. Cada fila muestra:
    - `GamePlatformBadge`
    - `GameStatusBadge`
    - Nota (`StarRating`)
    - Botones según estado (usando `useGameRecordActions(game)`). Cada fila debe tener sus propios diálogos; por lo tanto, cada fila invoca `useGameRecordActions` con su `game`.
  - Accesibilidad: `aria-label` en cada botón debe incluir la plataforma (`Marcar ${title} (${platform}) como en posesión`).
  - La fila se presenta como información tabular: `role="list"` en el contenedor, `role="listitem"` en cada fila, o una tabla (`table`, `tbody`, `tr`, `td`). Dado el diseño visual, `role="list"` con `listitem` es más simple.

### Página (`src/pages/GameListPage.tsx`)
- `listGames` recibe `groupBy: 'game'` en los params.
- El tipo de `items` en `useInfiniteScroll` cambia según `groupBy`. Se recomienda que `useInfiniteScroll` sea lo suficientemente flexible (ya usa un genérico `T`), por lo que si `groupBy` está presente, `items` es `GameGroup[]` en lugar de `Game[]`. Esto requiere que `GameListPage` maneje dos tipos de contenido.
- Dado que `groupBy` es un nuevo parámetro del filtro, podría ser parte de `query` en `useListQuery`. Sin embargo, el issue indica que `GameListPage` debe pedir `groupBy=game` y renderizar `GameGroupCard`. Esto sugiere que `groupBy` no es un filtro del usuario, sino un cambio de modo de visualización. Según el issue: "`GameListPage`: pedir `groupBy=game` y renderizar `GameGroupCard`". No dice que sea un filtro configurable, sino que la página debe usar `groupBy=game`.
- Por lo tanto, `GameListPage` debe modificar su llamada a `listGames` para incluir `groupBy: 'game'` y renderizar `GameGroupCard` en lugar de `GameCard`. Esto cambia la página completamente.
- Si se desea que `GameListPage` funcione con grupos siempre (como dice el issue: "pedir `groupBy=game` y renderizar `GameGroupCard`"), entonces se modifica la llamada a `listGames` y el mapa de renderizado.
- El `key` debe ser `group.gameKey`.

### Accesibilidad
- `aria-label` en cada botón de fila debe incluir la plataforma.
- La fila es `listitem` dentro de `list`.
- El título enlaza al primer registro (plataforma alfabéticamente menor).

### Tests
- `GameGroupCard.test.tsx`: verifica que hay `N` filas con plataforma y estado; los botones de cada fila llaman a `updateGame` con el `id` de esa fila; el título enlaza al primero.
- `GameListPage.test.tsx`: verifica que `listGames` se llama con `groupBy=game` y que se renderiza `GameGroupCard` por grupo.
- `npm test` y `npm run build` en verde.

## Riesgos y decisiones
- `useGameRecordActions` debe ser cuidadosamente extraído para que `GameCard` y `GameGroupCard` compartan la lógica sin duplicarla.
- El tipo de retorno de `listGames` debe ser manejado correctamente en TypeScript.
- No se incluye recoger filas a partir de la tercera (`+2 plataformas`) — fuera de alcance.

## Verificación
- `npm run build`
- `npm test` (excepto los 2 tests preexistentes que fallan en `main`)
