# frontend-collection

Frontend para gestionar colecciones personales: libros, videojuegos, cartas Magic (con mazos Commander), juegos de mesa y películas/series. Consume el backend Spring Boot de [backend-collection](https://github.com/JavierMedarde99/backend-collection).

## Stack

- React 18 + Vite 5 + TypeScript
- Tailwind CSS 3 + React Router 6
- Vitest para tests

## Comandos

```bash
npm run dev      # servidor de desarrollo (puerto 5173)
npm run build    # build de producción
npm run preview  # sirve el build
npm test         # ejecuta los tests (vitest)
```

`/api` se proxifica a `http://localhost:8080`, así que el frontend siempre usa URLs relativas `/api/...` (nunca hardcodear el host). El backend debe estar corriendo para desarrollo y para verificar contra la API real.

## Colecciones

### 📚 Libros (`/coleccion`)
Listado con filtros por título, autor, tipo y estado; detalle (`/coleccion/:id`); alta manual o por búsqueda en Google Books (`/nuevo`); edición (`/editar/:id`). Estados: por leer, leyendo, completado. Tipos: manga, novela, novela gráfica.

### 🎮 Videojuegos (`/juegos`)
Listado con filtros por título, plataforma y estado; detalle (`/juegos/:id`); alta manual o por búsqueda en RAWG/FreeToGame (`/juegos/nuevo`); edición (`/juegos/editar/:id`); logros de Steam (`/juegos/:id/logros`). Los juegos con logros al 100 % muestran insignia de trofeo en la lista. Plataformas: PC, PS2, PS3, Wii U, Switch.

### 🃏 Cartas Magic (`/magic`)
Listado con filtros por nombre, rareza, color y tipo (`MAGIC_CARD_TYPES`); detalle (`/magic/:id`); alta importando desde Scryfall (`POST /api/magic/scryfall/{scryfallId}`, `/magic/nuevo`); edición (`/magic/:id/editar`).

### 🃏 Mazos Commander (`/magic/mazos`)
Sub-apartado de Magic: listado con foto del comandante (`/magic/mazos`); creación eligiendo comandante en Scryfall con validación de criatura legendaria —o texto que lo permita— e identidad de color derivada de la carta (`/magic/mazos/nuevo`); detalle con apartado de comandante, cartas del mazo, estado Commander (`DRAFT/COMPLETE/INVALID` con mensaje) y popUp para añadir cartas (`/magic/mazos/:id`); edición (`/magic/mazos/:id/editar`, botón en la lista).

### 🎲 Juegos de mesa (`/boardgames`)
Listado con filtros por título y estado; detalle (`/boardgames/:id`); alta manual o por búsqueda en BoardGameGeek (`/boardgames/nuevo`); edición (`/boardgames/:id/editar`). Estados: en propiedad, lista de deseos. Rating BGG (0–10) mostrado como 5 estrellas.

### 🎬 Películas y series (`/movieshows`)
Listado con filtros por título, estado y tipo; detalle (`/movieshows/:id`); alta manual o por búsqueda en TMDB (`/movieshows/nuevo`); edición (`/movieshows/editar/:id`). Estados: viendo, visto, plan para ver. Tipos: película, serie.

## Estructura

- `src/pages/` — páginas, cableadas en `src/App.tsx`
- `src/components/` — UI compartida (`*Card`, `*Form`, `*Search`, `*StatusBadge`, `Navbar`, `ConfirmDialog`, `EmptyState`, `Skeleton`…). Clases reutilizables (`.btn-primary`, `.btn-ghost`, `.input`, `.label`, `.card`) en `src/index.css`
- `src/api/` — un cliente por colección (`booksApi`, `gamesApi`, `magicApi`, `deckApi`, `boardgamesApi`, `movieshowsApi`) con el mismo patrón `request<T>()` y manejo de 204/errores
- `src/types/` — tipos por dominio + `index.ts` que los reexporta
- `src/constants/` — etiquetas y colores de badges por dominio

## Notas del contrato backend

- `GET /api/books/search`, `/api/games/search` y `/api/movieshows/search` devuelven arrays directos; `/api/magic/search` y `/api/boardgames/search` devuelven envoltorio `{query, results}` (los clientes lo desenvuelven).
- `GET /api/decks/{id}/status` devuelve `{status, message}`.
- `POST /api/movieshows` exige `externalId` (400 sin él).
- El controlador de cartas Magic no expone crear/editar manuales: el alta es solo vía Scryfall.

## Ramas y PRs

Una rama `feature/<nombre>` y un PR por issue hacia `main`, sin mergear hasta revisión. `src/App.tsx` concentra las rutas y suele ser el punto de conflicto.
