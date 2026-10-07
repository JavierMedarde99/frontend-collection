# Diseño: UI de importación masiva de mazos Commander (issue #462)

- **Fecha:** 2026-10-06
- **Issue:** #462 — Fase 23 (frontend): UI de importación masiva de mazos Commander (Scryfall/JSON/local)
- **Rama:** `feat/462-deck-import-ui`
- **Estado:** aprobado para planificar

## 1. Objetivo

Dar al usuario una UI para poblar un mazo Commander **ya creado** desde una lista de cartas
en texto plano (MTGO/Arena), JSON o CSV, sin tener que añadir cartas una a una con
`POST /decks/{id}/cards` desde el modal «Añadir carta».

El backend ya está implementado y desplegado (spec `2026-10-05-deck-import-design.md`,
issue #353 del backend): la importación es **asíncrona**, el `POST` devuelve `202` con un
`jobId` y el frontend hace poll del estado. Esta spec solo cubre la UI del frontend.

Criterio de éxito: un usuario abre un mazo propio en el detalle, pulsa «Importar mazo»,
pega una lista o sube un archivo, ve el progreso de resolución, y al terminar tiene el mazo
guardado con su informe de validación (DRAFT/COMPLETE/INVALID) y las cartas no resueltas
listadas con sus candidatos de Scryfall para confirmar o ignorar.

## 2. Fuentes de importación

Decisión con el usuario: **solo texto pegado + archivo local**. Queda **fuera de alcance**
el import por URL externa (Moxfield/Deckbox/Scryfall lists) por dos motivos: el backend lo
descartó explícitamente en su spec, y el fetch a origen externo depende de CORS del tercero.

- **Pegar lista**: textarea con el contenido (MTGO text, JSON o CSV; el backend deduce el
  formato del contenido — empezar por `{`/`[` → JSON; segunda línea con cabecera conocida
  → CSV; resto → texto MTGO).
- **Subir archivo**: input de archivo con `accept=".txt,.json,.csv"`.

El query `format` del backend **se omite**: se usa la deducción automática.

## 3. Contrato HTTP consumido

Todos los endpoints cuelgan de `/api/v1/decks/{id}` y requieren autenticación (el Bearer
ya lo pone `authFetch`; el backend resuelve el usuario con `@CurrentUser`, no hace falta
pasar `currentUserId` desde el frontend).

### 3.1 `POST /api/v1/decks/{id}/imports/text` — `text/plain`

- Query: `mode` (`replace` | `merge`, default `replace`). `format` omitido.
- Body: el contenido de la lista.
- `202` → `{ jobId, status: "PENDING", statusUrl }`. `400/403/404/429` → error.

### 3.2 `POST /api/v1/decks/{id}/imports` — `multipart/form-data`

- Query: `mode` (igual). `format` omitido.
- Body: campo `file` (el archivo elegido).
- `202` → el mismo `DeckImportAcceptedResponse`.

### 3.3 `GET /api/v1/decks/{id}/imports/{jobId}`

- `200` → `DeckImportJobResponse`:
  - `jobId`, `status` (`PENDING|RUNNING|COMPLETED|FAILED`), `phase` (`PARSING|RESOLVING|SAVING|DONE`)
  - `progress`: `{ total, processed, resolved, sideboardIgnored }`
  - `deck`: el mazo guardado, o `null` mientras el job no haya terminado
  - `commander`, `commanderColors`: comandante resuelto, si lo hubo
  - `unresolved[]`: líneas que no entraron en el mazo
  - `validation`: `{ status, reasons[] }`, o `null` si el job no terminó bien
  - `error`: motivo del fallo, o `null`
- `404` si el job caducó (estado en memoria, ~30 min) o no existe. `403` si no es del usuario.

### 3.4 Semántica de `mode`

- `replace`: el mazo queda con **exactamente** la lista importada (idempotente para reenviar).
- `merge`: suma cantidades a las cartas actuales, como `addCard`.

## 4. Tipos nuevos (`src/types/Deck.ts`)

Reflejan el contrato del backend. Se añaden al archivo de tipos de mazos existente.

```ts
export type DeckImportStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface DeckImportAcceptedResponse {
  jobId: string
  status: string
  statusUrl: string
}

export interface DeckImportProgressResponse {
  total: number
  processed: number
  resolved: number
  sideboardIgnored: number
}

export interface DeckImportCandidateResponse {
  scryfallId: string
  name: string
  manaCost?: string
  type?: string
  rarity?: string
  setCode?: string
  setName?: string
  imageUrl?: string
  priceUsd?: string
  colorIdentity?: string[]
}

export interface DeckImportUnresolvedResponse {
  line: number
  raw: string
  quantity: number
  name: string
  reason: 'NOT_FOUND' | 'AMBIGUOUS' | 'UPSTREAM_ERROR'
  candidates: DeckImportCandidateResponse[]
}

export interface DeckImportValidationResponse {
  status: DeckStatus
  reasons: string[]
}

export interface DeckImportJobResponse {
  jobId: string
  status: DeckImportStatus
  phase: string
  deck: DeckResponse | null
  commander: string | null
  commanderColors: string[]
  unresolved: DeckImportUnresolvedResponse[]
  validation: DeckImportValidationResponse | null
  error: string | null
  progress: DeckImportProgressResponse
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
```

## 5. API (`src/api/deckApi.ts`)

Tres funciones nuevas que reutilizan el helper `request<T>()` existente. Notas sobre
cabeceras:

- `importDeckText` debe enviar `Content-Type: text/plain`, no el `application/json` por
  defecto del helper.
- `importDeckFile` debe enviar `multipart/form-data` con `FormData` y **sin** fijar
  `Content-Type` a mano (el navegador pone el boundary automáticamente).

```ts
export function importDeckText(
  id: string,
  content: string,
  mode: 'replace' | 'merge' = 'replace',
): Promise<DeckImportAcceptedResponse>

export function importDeckFile(
  id: string,
  file: File,
  mode: 'replace' | 'merge' = 'replace',
): Promise<DeckImportAcceptedResponse>

export function getDeckImportJob(
  id: string,
  jobId: string,
): Promise<DeckImportJobResponse>
```

Los `400/403/404/429` del POST y el `404` del GET se propagan como `RequestError` (throw),
que el diálogo muestra en un `ErrorBanner`.

## 6. Componente nuevo: `DeckImportDialog` (`src/components/DeckImportDialog.tsx`)

Modal independiente con su propia máquina de estados. **No toca** el modal de «Añadir
carta» ni el preview de imagen del detalle.

### Props

```ts
interface DeckImportDialogProps {
  open: boolean
  deckId: string
  deckName: string
  onClose: () => void
  onImported: (deck: DeckResponse) => void
}
```

### Estados internos

- `source` — configuración de la importación:
  - Pestañas `.method-tabs`: **«Pegar lista»** (textarea) y **«Subir archivo»** (input
    `accept=".txt,.json,.csv"`).
  - Selector de **modo**: `replace` (default) / `merge`, con texto explicativo corto.
  - Botón «Importar» deshabilitado si el textarea está vacío o no hay archivo elegido.
  - Al pulsar, llama a `importDeckText` o `importDeckFile` → pasa a `running`.
- `running` — tras el `202`:
  - Texto de fase según `phase` del job: `PARSING` → «Leyendo lista», `RESOLVING` →
    «Resolviendo cartas…», `SAVING` → «Guardando mazo…».
  - Progreso `processed/total` con barra (estilo Gabinete, acento `--sc` de mazos).
  - **Polling**: `setInterval` cada ~2 s a `getDeckImportJob`, limpiado al desmontar o al
    cambiar de estado. Cuando `status === COMPLETED` → `done`; `FAILED` → `failed` con
    `job.error`.
- `done` — resultado de la importación:
  - Ficha de validación: `DECK_STATUS_LABELS`/`DECK_STATUS_COLORS` existentes +
    `validation.reasons` (gestionar `validation === null`).
  - Comandante detectado + `ManaColorDots` (si `job.commander`).
  - Contadores de cartas (total / distintas) desde `job.deck`.
  - **Cartas no resueltas** (`unresolved`): agrupadas por `name`, con cantidad y `raw`.
    Por cada candidato: tarjeta al estilo `result-card` (imagen, nombre, set, tipo) con
    botón «Añadir» → `addCardToDeck(scryfallId, quantity)` (endpoint existente) y luego
    `onImported` con el mazo devuelto; botón «Ignorar» que la marca como descartada.
    Las `UPSTREAM_ERROR` no pueden aparecer aquí (el job habría fallado).
  - Botón «Cerrar» → `onClose`.
- `failed` — `ErrorBanner` con el mensaje (`job.error` o `RequestError` del POST/GET) y
  botón «Cerrar». El cierre no pierde el mazo (nada se guardó a medias; en `FAILED` el
  mazo queda intacto).

### Diseño visual

- Reutiliza acento Gabinete (`--sc` de `COLLECTIONS_BY_KEY.decks.accent.spine`),
  `.modal`/`.modal-paper` según lo que ya exista en el repo, `.method-tabs`/`.method-tab`
  para las fuentes, `result-card` para candidatos y `ErrorBanner` para errores.
- Sin tokens de color nuevos en Tailwind; el acento se pasa por CSS var inline.

## 7. Integración en `DeckDetailPage`

- Botón **«Importar mazo»** junto a «+ Añadir carta», visible solo para el dueño (la
  misma condición que el botón existente: `isAuthenticated` y el mazo es del usuario).
- Estado `importOpen` que renderiza `<DeckImportDialog>`.
- `onImported`: `setDeck(deck)` y `setStatus(await getDeckStatus(id))` — el mismo refresco
  que ya hacen «Añadir» y «Quitar» carta.
- No se toca la tabla de cartas, el modal de añadir carta, el preview de imagen ni
  `App.tsx`. No hace falta `useUnsavedGuard` (la importación no es un formulario con
  navegación).

## 8. Tests (TDD, vitest)

Nuevo `src/__tests__/DeckImportDialog.test.tsx`, mockeando `../api/deckApi`:

1. **Fuente + validación**: el paso `source` muestra las dos pestañas, el selector de modo
   y el botón «Importar» deshabilitado sin contenido.
2. **Importar por texto**: pega lista → `importDeckText` llamado con el contenido y
   `mode` → `202` → se ve el progreso → job `COMPLETED` → resumen con validación y reasons.
3. **Importar por archivo**: `importDeckFile` llamado con el `File` en `FormData`.
4. **Modo merge**: el selector cambia el `mode` enviado.
5. **Ambiguas**: job con `unresolved` AMBIGUOUS y 2 candidatos → «Añadir» llama a
   `addCardToDeck` con `scryfallId` y `quantity` y refresca vía `onImported`; «Ignorar»
   la quita de la lista.
6. **Job fallido**: `FAILED` → `ErrorBanner` con el mensaje de `job.error`.
7. **Cerrar**: el botón de cerrar invoca `onClose`.
8. **Polling**: avanza de `RUNNING` a `COMPLETED` con timers falsos (o `waitFor`).

El polling por `setInterval` en tests se controla con timers falsos de vitest o con el
patrón `waitFor` que usa el resto de la suite.

## 9. Verificación

- `npm run build` — puerta principal.
- `npx tsc --noEmit` — sin errores nuevos (los 27 preexistentes de `main` no son regresión).
- `npm test` — solo los 2 fallos preexistentes (`GameCard`, `GameDetailPrice` por
  `GamePlatform.PC`).

## 10. Fuera de alcance

- Import por URL externa (Moxfield/Deckbox/Scryfall lists) — decisión del usuario; CORS.
- Import en `DeckCreatePage` como flujo de alta de un solo recorrido.
- Cancelación de jobs, SSE/WebSocket, jobs persistidos, reintentos.
- Formato declarado en la UI (`format` explícito): el backend deduce; la deducción
  automática cubre los tres formatos.
- Importación de sideboard (el backend la cuenta como `sideboardIgnored`).