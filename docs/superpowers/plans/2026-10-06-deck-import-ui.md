# Plan: UI de importación masiva de mazos Commander (issue #462)

## Meta

- **Fecha:** 2026-10-06
- **Issue:** #462 — Fase 23 (frontend): UI de importación masiva de mazos Commander
- **Rama:** `feat/462-deck-import-ui` → PR contra `main` (sin merge hasta revisión)
- **Spec:** `docs/superpowers/specs/2026-10-06-deck-import-ui-design.md`
- **Contrato backend:** `/tmp/opencode/backend-deck-import-design.md` (spec real del backend) y `/tmp/opencode/DeckController.java` (controlador real)

## Objetivo

Poblar un mazo **ya creado** desde una lista de cartas (texto MTGO/Arena, JSON o CSV)
pegada o subida como archivo, con progreso en vivo, informe de validación
(DRAFT/COMPLETE/INVALID) y confirmación de cartas ambiguas desde el detalle del mazo.

Criterio de éxito: un usuario dueño del mazo abre `DeckDetailPage`, pulsa «Importar
mazo», pega una lista o sube un archivo, ve el progreso, y al terminar ve el resumen
(validación + comandante + cartas no resueltas) pudiendo añadir o ignorar ambiguas.

## Arquitectura

- Backend **asíncrono** ya desplegado: `POST /imports/text` (text/plain) y
  `POST /imports` (multipart `file`) devuelven `202 { jobId, statusUrl }`; el frontend
  hace **polling** cada ~2 s con `GET /imports/{jobId}` hasta `COMPLETED`/`FAILED`.
- Componente nuevo `DeckImportDialog` **autónomo** con su propia máquina de estados
  (`source → running → result`), el polling vive dentro (sin hook genérico, YAGNI).
- «Añadir» un candidato ambiguo reutiliza el endpoint existente
  `addCardToDeck(scryfallId, quantity)` y refresca el mazo vía `onImported`.
- El diálogo se monta condicionalmente (`{importOpen && <DeckImportDialog …/>}`): al
  cerrar se desmonta y cada apertura arranca en `source` sin estado stale.

## Stack

React 18 + TypeScript + Vite 5 + Tailwind 3 + React Router 6 + vitest/RTL. Sin
dependencias nuevas.

## Restricciones globales (leer primero)

- **Verificación:** `npm run build` es la puerta. `npx tsc --noEmit` no debe añadir
  errores nuevos (hay ~27 preexistentes en `main`). `npm test` solo con los 2 fallos
  preexistentes (`GameCard`, `GameDetailPrice`).
- El **helper `request()`** de `deckApi.ts` hace
  `headers: { 'Content-Type': 'application/json' }, ...options`: pasar `headers` en
  `options` **reemplaza por completo** los headers por defecto (orden del spread).
  - `importDeckText` → `headers: { 'Content-Type': 'text/plain' }`.
  - `importDeckFile` → `headers: {}` (así el navegador pone `multipart/form-data;
    boundary=…`; **nunca** fijar Content-Type a mano con FormData).
- `authFetch` ya añade `Authorization: Bearer`; el backend resuelve `@CurrentUser`, así
  que **no se envía** `currentUserId`.
- El conmutador `mode` (`replace` default / `merge`) se expone en la UI; el query
  `format` **se omite** (el backend deduce el formato del contenido).
- Patrón de tests de API: `src/__tests__/magicApi.test.ts` (`vi.stubGlobal('fetch', …)`
  + `jsonResponse` + `afterEach(vi.unstubAllGlobals)`).
- Patrón de tests de página con auth: `src/__tests__/MagicDetailPage.test.tsx`; para
  variar el estado de sesión por test usar `vi.hoisted` con un objeto mutable (ver
  Task 3).
- Convención: commits en español (`feat:`, `test:`, `refactor:`), una rama por issue,
  PR contra `main` sin merge hasta revisión.
- No tocar el checkout `/home/javi/orca/frontend-collection`.

## Foco de la revisión

- El **polling** no debe reiniciarse en cada render del padre: guardar `onImported` en
  un ref y depender solo de `[deckId, step]`.
- `onImported` debe llamarse **una sola vez** al llegar `COMPLETED`, no en cada tick.
- `importDeckFile` no debe fijar `Content-Type` manualmente.
- El botón «Importar» debe estar deshabilitado sin contenido y mientras envía; el ✕
  deshabilitado mientras envía.
- Los tests no deben depender de timers reales para el polling (usar fake timers).

---

## Task 1 — Tipos `DeckImport*` + 3 funciones de API (TDD)

Archivos: `src/types/Deck.ts`, `src/types/index.ts`, `src/api/deckApi.ts`,
`src/__tests__/deckImportApi.test.ts` (nuevo).

### 1a. Test primero: `src/__tests__/deckImportApi.test.ts`

Patrón de `magicApi.test.ts`: helper local

```ts
function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}
```

`beforeEach(vi.clearAllMocks)`, `afterEach(vi.unstubAllGlobals)`.

Casos:

1. `importDeckText envía el contenido como text/plain con mode=replace por defecto`:
   stub `fetch` con `jsonResponse({ jobId: 'j1', status: 'PENDING', statusUrl: 'x' }, 202)`.
   `await importDeckText('d1', '1 Sol Ring\n1 Arcane Signet')`. Assert:
   `fetchSpy` llamado con `expect.stringContaining('/api/v1/decks/d1/imports/text')`,
   `expect.stringContaining('mode=replace')`, y opciones
   `{ method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '1 Sol Ring\n1 Arcane Signet' }`.
   El resultado resuelto es `{ jobId: 'j1', status: 'PENDING', … }`.
2. `importDeckText usa mode=merge cuando se pide`: `await importDeckText('d1', 'x', 'merge')`
   → URL con `mode=merge`.
3. `importDeckFile sube el archivo como FormData sin Content-Type fijo`: crea
   `const file = new File(['a'], 'mazo.txt')`; `await importDeckFile('d1', file)`.
   Assert: URL con `/api/v1/decks/d1/imports` y `mode=replace`; `options.method === 'POST'`;
   `options.body instanceof FormData`; `(options.body as FormData).get('file')` devuelve
   el mismo `file`; `options.headers` es `{}` (sin Content-Type).
4. `getDeckImportJob consulta el job y devuelve el progreso`: stub fetch con el JSON de
   un `DeckImportJobResponse`; `await getDeckImportJob('d1', 'j1')` → valor igual al JSON;
   URL contiene `/api/v1/decks/d1/imports/j1`.
5. `lanza RequestError con el mensaje del backend cuando el job no existe (404)`:
   stub `jsonResponse({ message: 'Job no encontrado' }, 404)`;
   `await expect(getDeckImportJob('d1', 'x')).rejects.toMatchObject({ status: 404, message: 'Job no encontrado' })`.

### 1b. Tipos: append a `src/types/Deck.ts`

Exactamente (contrato del backend):

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

export type DeckImportUnresolvedReason = 'NOT_FOUND' | 'AMBIGUOUS' | 'UPSTREAM_ERROR'

export interface DeckImportUnresolvedResponse {
  line: number
  raw: string
  quantity: number
  name: string
  reason: DeckImportUnresolvedReason
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

Añadir todos los nombres nuevos a la línea 11 de `src/types/index.ts` (export type de
`./Deck`), si no `deckApi.ts` no podrá importarlos desde `'../types'`.

### 1c. Funciones: append a `src/api/deckApi.ts`

```ts
export function importDeckText(
  id: string,
  content: string,
  mode: 'replace' | 'merge' = 'replace',
): Promise<DeckImportAcceptedResponse> {
  return request<DeckImportAcceptedResponse>(`${apiUrl(BASE_URL)}/${id}/imports/text?mode=${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: content,
  }) as Promise<DeckImportAcceptedResponse>
}

export function importDeckFile(
  id: string,
  file: File,
  mode: 'replace' | 'merge' = 'replace',
): Promise<DeckImportAcceptedResponse> {
  const form = new FormData()
  form.append('file', file)
  return request<DeckImportAcceptedResponse>(`${apiUrl(BASE_URL)}/${id}/imports?mode=${mode}`, {
    method: 'POST',
    headers: {},
    body: form,
  }) as Promise<DeckImportAcceptedResponse>
}

export function getDeckImportJob(id: string, jobId: string): Promise<DeckImportJobResponse> {
  return request<DeckImportJobResponse>(
    `${apiUrl(BASE_URL)}/${id}/imports/${encodeURIComponent(jobId)}`,
  ) as Promise<DeckImportJobResponse>
}
```

Verde: `npm test -- deckImportApi` y `npx tsc --noEmit` (sin errores nuevos). Commit
`test: y feat: tipos y API de importación de mazos (issue #462)`.

---

## Task 2 — `DeckImportDialog` (TDD)

Archivos: `src/components/DeckImportDialog.tsx` (nuevo),
`src/__tests__/DeckImportDialog.test.tsx` (nuevo).

### 2a. Test primero: `src/__tests__/DeckImportDialog.test.tsx`

Mock del módulo de API (el componente importa `../api/deckApi` desde `src/components`,
que se resuelve al mismo módulo):

```tsx
vi.mock('../api/deckApi', () => ({
  importDeckText: vi.fn(),
  importDeckFile: vi.fn(),
  getDeckImportJob: vi.fn(),
  addCardToDeck: vi.fn(),
}))
```

Fixtures: `accepted = { jobId: 'job-1', status: 'PENDING', statusUrl: 'x' }`; `deck` con
`{ id: 'd1', name: 'Mazo de Atraxa', commander: 'Atraxa', commanderColors: ['W','U','B','G'], cards: [{ cardName: 'Sol Ring', quantity: 1, … }] }`;
`completedJob` (status COMPLETED, phase DONE, `validation: { status: 'COMPLETE', reasons: [] }`,
`unresolved: []`, `deck`); `runningJob` (status RUNNING, phase RESOLVING,
`progress: { total: 10, processed: 5, resolved: 3, sideboardIgnored: 0 }`); `failedJob`
(status FAILED, `error: 'Formato no reconocido'`); `ambiguousJob` (status COMPLETED,
`unresolved: [{ line: 2, raw: '2 Sol Ring', quantity: 2, name: 'Sol Ring', reason: 'AMBIGUOUS', candidates: [c1, c2] }]`).

Helper de render:

```tsx
function renderDialog(overrides: Partial<DeckImportDialogProps> = {}) {
  const onClose = vi.fn()
  const onImported = vi.fn()
  render(
    <DeckImportDialog
      open
      deckId="d1"
      deckName="Mazo de Atraxa"
      onClose={onClose}
      onImported={onImported}
      {...overrides}
    />,
  )
  return { onClose, onImported }
}
```

Casos (nombres en el estilo de la suite, español):

1. `muestra las dos fuentes, el selector de modo y el botón deshabilitado sin contenido`:
   `getByRole('button', { name: 'Pegar lista' })`, `{ name: 'Subir archivo' }`,
   `getByLabelText('Modo de importación')` con valor `replace`;
   `getByRole('button', { name: 'Importar mazo' })` `toBeDisabled()`.
2. `habilita Importar al escribir y envía importDeckText con mode=replace`:
   change el textarea (`getByLabelText('Lista de cartas')`) a `'1 Sol Ring'`; click
   «Importar mazo»; `mockedImportText` llamado con `('d1', '1 Sol Ring', 'replace')`.
3. `envía mode=merge cuando se selecciona`: change el select a `'merge'`; escribir;
   click; `mockedImportText` llamado con `('d1', '1 Sol Ring', 'merge')`.
4. `importa por archivo y sube el File en el campo file`: click «Subir archivo»;
   `fireEvent.change(screen.getByLabelText(/archivo/i), { target: { files: [new File(['a'], 'mazo.txt')] } })`
   (el input `accept=".txt,.json,.csv"`); click «Importar mazo»;
   `mockedImportFile` llamado con `('d1', expect.any(File), 'replace')`.
5. `hace polling de RUNNING a COMPLETED, muestra el resumen y notifica onImported una vez`:
   `vi.useFakeTimers()`; `mockedImportText.mockResolvedValue(accepted)`;
   `mockedGetJob.mockResolvedValueOnce(runningJob).mockResolvedValueOnce(completedJob)`;
   escribir + click; `await act(async () => {})` (flush del submit); avanzar:
   `await act(async () => { await vi.advanceTimersByTimeAsync(2000) })` → ver
   `'Resolviendo cartas…'` y `'5 de 10 cartas'`; avanzar otros 2000 ms → ver badge
   `'Completo'`, `'Atraxa'` (comandante), totales de cartas; `onImported` llamado
   **una vez** con `deck`. `afterEach(() => vi.useRealTimers())`.
6. `muestra el error del job cuando falla`: `mockedGetJob.mockResolvedValue(failedJob)`;
   escribir + click + avanzar 2000 ms → `getByText(/Formato no reconocido/)` (ErrorBanner).
7. `añadir un candidato llama a addCardToDeck con la cantidad y refresca`:
   `mockedGetJob.mockResolvedValue(ambiguousJob)`; llegar al resumen; click en el primer
   `getAllByRole('button', { name: 'Añadir' })[0]` →
   `mockedAddCard` llamado con `('d1', { scryfallId: 'c1', quantity: 2 })`;
   `mockedAddCard.mockResolvedValue(updatedDeck)`; `onImported` llamado con `updatedDeck`;
   la entrada desaparece (`queryByText('Línea 2')` null).
8. `ignorar quita la entrada de la lista`: click «Ignorar» → `queryByText('Línea 2')` null.
9. `cerrar llama a onClose`: click en el botón con `aria-label="Cerrar"` (✕) en source →
   `onClose` llamado; y en el resumen de fallo, click en el botón «Cerrar» del pie →
   `onClose` llamado.

`beforeEach`: `vi.clearAllMocks()`. `afterEach`: `vi.useRealTimers()`.

### 2b. Componente: `src/components/DeckImportDialog.tsx`

Props (de la spec):

```tsx
interface DeckImportDialogProps {
  open: boolean
  deckId: string
  deckName: string
  onClose: () => void
  onImported: (deck: DeckResponse) => void
}
```

Estado interno:

```tsx
type ImportStep = { kind: 'source' } | { kind: 'running'; jobId: string } | { kind: 'result' }
type Source = 'text' | 'file'

const [step, setStep] = useState<ImportStep>({ kind: 'source' })
const [job, setJob] = useState<DeckImportJobResponse | null>(null)
const [error, setError] = useState<string | null>(null)
const [source, setSource] = useState<Source>('text')
const [mode, setMode] = useState<'replace' | 'merge'>('replace')
const [text, setText] = useState('')
const [file, setFile] = useState<File | null>(null)
const [sending, setSending] = useState(false)
const [hidden, setHidden] = useState<Set<number>>(new Set()) // líneas resueltas o ignoradas
const [confirmBusy, setConfirmBusy] = useState<string | null>(null) // scryfallId en curso
const [confirmError, setConfirmError] = useState<string | null>(null)
```

`onImported` en ref para que el intervalo no se reinicie en cada render del padre:

```tsx
const onImportedRef = useRef(onImported)
useEffect(() => { onImportedRef.current = onImported }, [onImported])
```

Polling (deps **solo** `[deckId, step]`):

```tsx
useEffect(() => {
  if (step.kind !== 'running') return
  let cancelled = false
  async function tick() {
    try {
      const next = await getDeckImportJob(deckId, step.jobId)
      if (cancelled) return
      if (next.status === 'COMPLETED') {
        setJob(next)
        setStep({ kind: 'result' })
        if (next.deck) onImportedRef.current(next.deck)
      } else if (next.status === 'FAILED') {
        setJob(next)
        setError(next.error || 'La importación falló.')
        setStep({ kind: 'result' })
      } else {
        setJob(next) // PENDING/RUNNING → progreso
      }
    } catch (err) {
      if (cancelled) return
      setError(err instanceof Error ? err.message : 'No se pudo consultar la importación.')
      setStep({ kind: 'result' })
    }
  }
  const timer = window.setInterval(tick, 2000)
  return () => { cancelled = true; window.clearInterval(timer) }
}, [deckId, step])
```

Handlers: `handleImport` (guarda `sending`, llama `importDeckText` o `importDeckFile`
según `source`, pasa a `{ kind: 'running', jobId: accepted.jobId }`, error → `ErrorBanner`),
`handleConfirmCandidate(u, c)` (`addCardToDeck(deckId, { scryfallId: c.scryfallId, quantity: u.quantity })`,
`onImported(updated)`, esconde `u.line`), `handleDismiss(line)` (esconde `u.line`).

Render:

- `if (!open) return null`.
- Overlay: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet`
  (mismo patrón que el modal «Añadir carta» de la página). Diálogo:
  `className="modal-paper modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"` con
  `role="dialog" aria-modal="true" aria-label="Importar mazo"`.
- Cabecera: `h3` «Importar mazo» + `<p className="text-caption text-graphite">{deckName}</p>`;
  botón ✕ `btn-ghost !px-3 !py-1.5` `aria-label="Cerrar"` `disabled={sending}`.
- **source**:
  - `.method-tabs` con 2 `.method-tab` (el activo con `.on`): «Pegar lista» (por defecto)
    y «Subir archivo».
  - text: `<textarea className="input min-h-40 font-mono text-body-sm" aria-label="Lista de cartas" placeholder="1 Sol Ring\n1 Arcane Signet" />`.
  - file: `<input type="file" accept=".txt,.json,.csv" aria-label="Archivo de mazo" onChange={e => setFile(e.target.files?.[0] ?? null)} />`
    + nombre del archivo elegido en `text-caption`.
  - modo: `<select className="input" aria-label="Modo de importación" value={mode} onChange={…}>`
    con `<option value="replace">Reemplazar</option>` y `<option value="merge">Combinar</option>`,
    más `<p className="text-caption text-graphite">Reemplazar deja solo las cartas
    importadas; Combinar las suma a las actuales.</p>`.
  - `submitError`/`error` → `<ErrorBanner message={…} />`.
  - `.form-actions`: `<button type="button" className="btn-primary" onClick={handleImport}
    disabled={sending || (source === 'text' ? !text.trim() : !file)}>{sending ? 'Importando…' : 'Importar mazo'}</button>`.
- **running**:
  - Fase con mapa local `PHASE_LABELS = { PARSING: 'Leyendo lista…', RESOLVING: 'Resolviendo cartas…', SAVING: 'Guardando mazo…', DONE: 'Completando…' }`
    con fallback «Importando…» (si `job` aún es null tras el 202).
  - Barra: contenedor `h-2 rounded-full bg-silver/60 overflow-hidden` + relleno
    `style={{ width: pct%, background: 'var(--sc, #b45309)' }}` (el `--sc` lo hereda de
    `DeckDetailPage`); `pct = total > 0 ? Math.round(processed / total * 100) : 0`.
  - Texto `{processed} de {total} cartas`. El ✕ queda habilitado (cerrar no pierde nada).
- **result**:
  - Si `job?.status === 'COMPLETED'`:
    - Ficha validación: si `job.validation` → badge
      `DECK_STATUS_COLORS[job.validation.status]` + `DECK_STATUS_LABELS[…]` + `<ul>` con
      `reasons`. Si `validation === null` no se muestra la ficha.
    - Comandante: si `job.commander` → `job.commander` + `<ManaColorDots colors={job.commanderColors ?? []} size="md" />`.
    - Contadores desde `job.deck`: `totalCount` y `cards.length` («X cartas · Y distintas»).
    - Ambiguas: `const unresolved = (job.unresolved ?? []).filter(u => !hidden.has(u.line))`;
      por entrada `<div key={u.line}>`: cabecera «Línea {u.line}: {u.quantity}× {u.name}»
      + motivo (`AMBIGUOUS` → «varias coincidencias», `NOT_FOUND` → «no encontrada») + `raw`
      en `text-caption` + botón `btn-ghost` «Ignorar» (`handleDismiss(u.line)`); debajo,
      grid `grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto` con tarjetas
      `result-card p-2.5`: imagen (si `c.imageUrl`), nombre, `c.setName || c.type`, y botón
      `btn-primary !px-3 !py-1.5 text-body-sm` «Añadir» (`disabled={confirmBusy !== null}`,
      label «Añadiendo…» si `confirmBusy === c.scryfallId`) → `handleConfirmCandidate(u, c)`.
    - `confirmError` → ErrorBanner.
    - `.form-actions`: botón `btn-primary` «Cerrar» → `onClose`.
  - Si falló (`job?.status === 'FAILED'` o `error`): `<ErrorBanner message={error ?? ''} />`
    + `.form-actions` con «Cerrar».

Verde: `npm test -- DeckImportDialog` y `npx tsc --noEmit` (sin errores nuevos). Commit
`feat: Dialog de importación masiva de mazos (issue #462)`.

---

## Task 3 — Integración en `DeckDetailPage` (TDD)

Archivos: `src/pages/DeckDetailPage.tsx`, `src/__tests__/DeckDetailPage.test.tsx` (nuevo).
Ruta del detalle: `/magic/mazos/:id`.

### 3a. Test primero: `src/__tests__/DeckDetailPage.test.tsx`

Mocks:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DeckDetailPage from '../pages/DeckDetailPage'
import { getDeck, getDeckStatus } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'

const { authState } = vi.hoisted(() => ({
  authState: { value: { isAuthenticated: true, user: { username: 'javi' } } },
}))

vi.mock('../api/deckApi', () => ({
  getDeck: vi.fn(),
  getDeckStatus: vi.fn(),
  addCardToDeck: vi.fn(),
  removeCardFromDeck: vi.fn(),
  deleteDeck: vi.fn(),
  importDeckText: vi.fn(),
  importDeckFile: vi.fn(),
  getDeckImportJob: vi.fn(),
}))

vi.mock('../api/magicApi', () => ({ searchMagicCards: vi.fn() })) // lo usa DeckCommanderImage

vi.mock('../context/AuthContext', () => ({ useAuth: () => authState.value }))
```

Fixture: `deck = { id: 'd1', name: 'Mazo de Atraxa', commander: 'Atraxa', commanderColors: ['W','U','B','G'], cards: [], userOwned: { username: 'javi' } }`.
En `beforeEach`: `vi.mocked(getDeck).mockResolvedValue(deck)`;
`vi.mocked(getDeckStatus).mockResolvedValue({ status: 'DRAFT', message: null })`;
`vi.mocked(searchMagicCards).mockResolvedValue([])`; `authState.value = { isAuthenticated: true, user: { username: 'javi' } }`.

Helper de render:

```tsx
function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/magic/mazos/d1']}>
      <Routes>
        <Route path="/magic/mazos/:id" element={<DeckDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}
```

Casos:

1. `muestra el botón Importar mazo para el dueño y abre el diálogo`:
   `await screen.findByText('Mazo de Atraxa')`; `getByRole('button', { name: 'Importar mazo' })`
   presente; click → `getByRole('dialog', { name: 'Importar mazo' })` visible.
2. `oculta el botón Importar mazo sin sesión`: `authState.value = { isAuthenticated: false, user: null }`;
   render; esperar el título; `queryByRole('button', { name: 'Importar mazo' })` null
   (y «+ Añadir carta» tampoco está).
3. `al cerrar el diálogo se desmonta`: abrir, click en ✕ (`aria-label="Cerrar"`),
   `queryByRole('dialog', { name: 'Importar mazo' })` null.

Nota: `DeckCommanderImage` lanza `searchMagicCards` al montarse; el mock evita fetch real.
Con `cards: []` la página muestra `EmptyState` «Mazo vacío» — válido.

### 3b. Implementación en `src/pages/DeckDetailPage.tsx`

- Import: `DeckImportDialog` de `'../components/DeckImportDialog'`; `DeckResponse` ya está
  en el import de tipos.
- Estado: `const [importOpen, setImportOpen] = useState(false)`.
- En la barra de acciones del dueño (el `div.flex.items-center.gap-2` de la línea ~274),
  **antes** de «+ Añadir carta»:

```tsx
<button type="button" className="btn-ghost !px-4 !py-2" onClick={() => setImportOpen(true)}>
  Importar mazo
</button>
```

- Handler (mismo patrón de refresco que `handleAddCard`):

```tsx
async function handleImported(deckData: DeckResponse) {
  setDeck(deckData)
  if (!id) return
  try {
    setStatus(await getDeckStatus(id))
  } catch {
    /* mantiene el estado anterior */
  }
}
```

- Render (montaje condicional → reset automático en cada apertura), junto al
  `ConfirmDialog` al final del `<article>`:

```tsx
{importOpen && (
  <DeckImportDialog
    open
    deckId={deck.id}
    deckName={deck.name}
    onClose={() => setImportOpen(false)}
    onImported={handleImported}
  />
)}
```

Verde: `npm test -- DeckDetailPage` y `npx tsc --noEmit` (sin errores nuevos). Commit
`feat: botón Importar mazo en el detalle del mazo (issue #462)`.

---

## Verificación final

1. `npm run build` — debe pasar.
2. `npx tsc --noEmit` — sin errores nuevos frente a los ~27 preexistentes de `main`.
3. `npm test` — solo los 2 fallos preexistentes (`GameCard`, `GameDetailPrice`).
   Los nuevos ficheros `deckImportApi`, `DeckImportDialog` y `DeckDetailPage` verdes.
4. `git status` limpio salvo `docs/superpowers/` (gitignored) y archivos en `/tmp/opencode/`.
5. Push de `feat/462-deck-import-ui` y PR contra `main` (sin merge hasta revisión).

## Dificultades previstas

- **Fake timers + promises**: usar `vi.advanceTimersByTimeAsync` (no la versión síncrona)
  y flush del submit con `await act(async () => {})`; `vi.useRealTimers()` en `afterEach`.
- **Reinicio del intervalo**: mantener `onImported` en un ref; deps `[deckId, step]`.
  El cambio de `step` a `result` limpia el intervalo y garantiza un único `onImported`.
- **FormData en `request()`**: el helper reemplaza `headers` en su totalidad; pasar
  `headers: {}` y no tocar el Content-Type.
- **Re-export de tipos**: olvidar actualizar `src/types/index.ts` rompe los imports de
  `../types` en `deckApi.ts` y el componente.