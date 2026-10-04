# Spec — Familia visual Gabinete en navegación, listas, detalles, altas/edición y perfil

- **Fecha:** 2026-10-03 (actualizada 2026-10-04 con el alcance de **altas/edición** y **perfil/preferencias**)
- **Estado:** revisada y aprobada por el usuario el 2026-10-04 (alcance ampliado ✅)
- **Rama base:** `origin/main` (`ec6f463`, PR #525 mergeado)
- **Fuente visual de la verdad:** mockups aprobados en `.superpowers/brainstorm/80845-1791022646/content/` (`navbar-treatment`, `pageheader-lists`, `detail-ficha`, `libros-v3`, `juegos-v2`, `magic`, `mazos`, `mesa`, `cine`, `estados`, **`alta`**, **`perfil`**, **`alta-videojuegos-mazos`**, **`alta-mesa-cine-libros`**).

---

## 1. Contexto y problema

La Home ya muestra la familia visual «Gabinete de curiosidades» (papel, Fraunces/Literata, regla doble, acento por colección, vitrina) — PR #525 mergeado. La **navegación**, las **listas**, los **detalles** y las ventanas de **alta/edición** y **perfil/preferencias** de las 6 colecciones siguen con el diseño genérico anterior: cabeceras planas, pestañas/píldoras de marca naranja, formularios en tarjetas planas, sin regla doble ni acento por colección. La ruptura visual entre la Home (rediseñada) y el resto de la app es el problema a resolver.

## 2. Objetivo

Extender el vocabulario común del Gabinete a navegación, las 6 listas, los 6 detalles, las **ventanas de alta/edición** de las 6 colecciones y el **perfil/preferencias**, manteniendo **toda la funcionalidad actual** de las páginas (botones, ciclos de estado, menús, paneles, modales, flujos de búsqueda exterior). Cada página compone con el mismo léxico (papel, tipografía, regla doble, acento por colección) pero con **composición propia** — ninguna página clona la vitrina de la Home.

### Alcance (extensiones aprobadas 2026-10-04)

- **Altas/edición:** `*CreatePage`/`*EditPage` de las 6 colecciones + sus componentes de formulario/búsqueda + `MagicPrintingsPanel`. Cambian de **formato** (envoltorio visual), **no de lógica ni flujos**: ni campos nuevos ni cambios de validación, selects o llamadas.
- **Perfil y preferencias:** `ProfilePage` (`/perfil`), `PublicProfilePage` (`/perfil/:username`), `PreferencesPage` (`/preferencias`) con `ProfileView`/`UserProfileHeader`/`CollectionPreferencesPanel`.
- **Rutas de `App.tsx` intactas** (todas estas páginas ya están cableadas).

### Criterios de éxito (gate)

1. `npm run build` pasa.
2. `npx tsc --noEmit` **sin errores nuevos** (sobre los ~44 preexistentes de `main`).
3. `npm test`: solo los 2 fallos preexistentes (`GameCard.test.tsx`, `GameDetailPrice.test.tsx` — ambos usan el eliminado `GamePlatform.PC`; verificados como baseline de `origin/main` 2026-10-04); `NavbarActiveCollections`, `BookCard` y `GenreMultiselect` están **verdes** (ya no son fallos preexistentes).
4. Funcionalidad conservada (ver §7, §9, §10B, §10C): ningún botón/acción de listas, detalles, formularios o perfil desaparece ni cambia de comportamiento.

## 3. Identidad por colección (fuente única)

Se centraliza en `src/constants/collections.ts` la identidad que hoy vive dispersa en `HomePage.tsx` (`ENTITIES`, `WARM`, `NICKS`), y se amplía con lo que necesitan navbar/listas/detalles.

```ts
// src/constants/collections.ts (esquema objetivo)
export type CollectionKey = 'books' | 'games' | 'magic' | 'decks' | 'boardgames' | 'movieshows'

export interface CollectionMeta {
  key: CollectionKey
  label: string      // 'Libros', 'Videojuegos', 'Magic', 'Mazos', 'Juegos de mesa', 'Películas y series'
  nick: string       // 'Libros', 'Videojuegos', 'Magic', 'Mazos', 'Mesa', 'Cine'  (etiqueta corta, nichos/navbar)
  to: string
  accent: { spine: string; niche: string }   // ex WARM
  catalogNo: string  // '02', '03', '04', '04-B', '05', '06' — junto al «catálogo nº» de celda X
}
```

| key | label | nick | to | spine (`--sc`) | niche (`--c`) | catálogo nº |
|---|---|---|---|---|---|---|
| `books` | Libros | Libros | `/coleccion` | `#c2410c` | `#e8633a` | 02 |
| `games` | Videojuegos | Videojuegos | `/juegos` | `#b45309` | `#ee9b2e` | 03 |
| `magic` | Magic | Magic | `/magic` | `#8f3a1e` | `#c96a3e` | 04 |
| `decks` | Mazos | Mazos | `/magic/mazos` | `#92600a` | `#b8862f` | 04-B |
| `boardgames` | Juegos de mesa | Mesa | `/boardgames` | `#6d4a2a` | `#a5783f` | 05 |
| `movieshows` | Películas y series | Cine | `/movieshows` | `#77613a` | `#a08b52` | 06 |

- El **acento** se aplica igual que en la Home: `style={{ '--sc': ..., '--c': ... }}` inline por página/colección. **Sin tokens nuevos en Tailwind.**
- `toBackendCollectionKey` / `fromBackendCollectionKey` se conservan.
- `HomePage.tsx` pasa a **importar** `COLLECTIONS` (o una forma `Record<CollectionKey, ...>`) y elimina sus constantes locales `ENTITIES`/`WARM`/`NICKS` (se conserva `NICHE_ICONS`, que es solo de la Home).
- Navbar pasa a alimentarse de `COLLECTIONS` para etiquetas y rutas (manteniendo el filtrado por `activeCollections`).

> El «catálogo nº» es texto decorativo aprobado en los mockups; el colofón usa la misma numeración junto al conteo (`— fin del catálogo · 132 libros —`).

## 4. Componentes compartidos (nuevos)

### `PageHeader` (`src/components/PageHeader.tsx`)
Cabecera de lista aprobada en `pageheader-lists`.

Props cerradas para el plan: `eyebrow`, `title`, `subtitle`, `actions?: ReactNode`. Render:
- Kicker `✦` en versalitas (clase `eyebrow` existente; color `brand`).
- `h1` Fraunces (≈34px) + subtítulo en cursiva (conteo + `· catálogo nº XX`).
- Acciones a la derecha (búsqueda/orden/filtros/añadir según página).
- `rule-double` bajo la cabecera con **segmento de acento** a la izquierda (barrita `var(--sc)`), como en los mockups.

### `MetaList` (`src/components/MetaList.tsx`)
Detalle ficha A (`detail-ficha`): fila(s) de pares label/valor en **versalitas** (label gris ~9,5px tracking ~1.2px, valor Fraunces/Literata 600 ≈12,5px). Props cerradas: `items: { label: string; value: ReactNode }[]`, `columns?: 2 | 3`. Grid de 3 columnas en `lg`, 2 en `md`, apilado en móvil. Sustituye los `dl` planos actuales de los detalles.

## 5. Retoques a componentes compartidos existentes

| Componente | Cambio aprobado | Detalle |
|---|---|---|
| `OwnerTabs` | De píldora de marca a **pestañas con filete inferior** | Etiquetas **«Mi colección» / «Todas»** (renombrando «Otras colecciones»; también el tab único sin sesión pasa a «Todas»). El cambio es **uniforme**: las 6 listas renderizan `<OwnerTabs value={effectiveTab} onChange={setOwnerTab} showMine={isAuthenticated} />` sin etiquetas propias, y ningún test depende de «Otras colecciones» (verificado). Activa: texto en `var(--sc)` + filete inferior 3px `var(--sc)`. Conservar `role=tablist/tab` y `aria-selected`. |
| `FilterPill` | Activa **rellena del acento** de colección | `active → background: var(--sc); color:#fff`, borde transparente. Inactiva: borde `silver`, sin relleno. Conserva `btn-ghost` base, `aria-pressed`, `label`. |
| `EmptyState` | Sobre regla doble, mismo vocabulario papel | Mantiene anatomía real (icono en caja con gradiente + título Fraunces + mensaje + acción) pero la caja de icono y el fondo usan el papel/gradiente del Gabinete; el acento de la caja puede tomar `var(--sc)`. Nunca romper la cabecera/pestañas de la lista (ver `estados.html`). |
| Barra de filtros/panel | Panel de papel con **filete lateral de acento** (≈3px `var(--sc)`) | Clase CSS nueva `.filterbar` reutilizada por las páginas que hoy montan paneles de filtros (selects de plataforma/rareza/genero, búsqueda «⏛ Filtros»). |
| Colofón | `statusline` | `— fin del catálogo · N … —` en versalitas grises bajo la cuadrícula cuando hay ítems y `!hasMore`; variante **«— aún no hay catálogo —»** solo cuando la lista está vacía (y aun así se muestran cabecera + pestañas). No se muestra durante carga ni con error. |
| Carga | Esqueletos en tonos papel | `SkeletonGrid`/`SkeletonInline` reutilizados con colores papel (`#f0e7d8`→`#faf3e8`) y shimmer suave; la portada reserva su hueco (ver `estados.html`). |

## 6. CSS — `@layer components` en `src/index.css`

Se añade la sección «Gabinete — navegación, listas y detalle» al final del bloque `@layer components` existente. Inventario:

- **Existen y se reutilizan:** `--rule` (`#cbb998`, dark `#4c3a24`), `.paper-grain`, `.eyebrow`, `.rule-double`, `.spine-card`, `.margin-note`. Fuerte tipografía `font-display` (Fraunces) y `font-body` (Literata) ya cableadas en `tailwind.config.js` e `index.html`.
- **Nuevas (orientativas):** `.page-head` (cabecera A), `.page-head-accent` / `.rule-double .accent-bar` (segmento de acento), `.meta-list`, `.filterbar`, `.statusline`, `.cover-frame` (marco de portada con lomo `var(--sc)`, sombra interior), `.nb-rule` (regla doble bajo navbar), `.nb-lk.on::after` (filete `var(--sc)`), y los retoques de `OwnerTabs`/`FilterPill`/`EmptyState` del §5.
- **Altas/edición (§10B):** `.form-panel` (panel de papel con filete lateral `var(--sc)`, base de los formularios/buscadores), `.fsec`/`.fsec-cap` (secciones en versalitas con separador `--rule` y barrita de acento — soporte visual de `FormSection`), `.form-actions` (pie Cancelar/Guardar), `.dropzone` (papel punteado para portada/imagen), `.scan-frame` (marco del escáner de ISBN), `.modal-paper` (modal de búsqueda/impresiones en papel con `rule-double` y acento).
- **Perfil/preferencias (§10C):** `.prof-card` (tarjeta de papel del perfil), `.chip-niche` (chip de colección con filete lateral `--ac`), `.prow`/`.dot` (filas de preferencias con dot del acento), `.avatar` (círculo con gradiente brand).
- **Modo oscuro:** `--rule` ya tiene variante dark (`#4c3a24`); las clases nuevas deben incluir su bloque dark (tonos papel → tonos `#241b12`/`#3a2413` del css de la Home) para no regresionar la app en oscuro.

## 7. Navegación — tratamiento A

`src/components/Navbar.tsx` (aprobado en `navbar-treatment`):

- **Regla doble bajo la barra** (`.nb-rule`, patrón de guiones `--rule`).
- **Enlace activo con filete** de 3px del color de su colección: cada `NavLink` establece `--sc` de su `collection` (`books/games/magic/boardgames/movieshows`); **«Inicio» queda sin filete** (tratamiento neutro, solo peso de fuente) — decisión fija, no variable.
- **Sub-nav Magic (Cartas/Mazos):** mismo tratamiento — «Cartas» con `--sc` de magic, «Mazos» con `--sc` de decks; visibilidad ligada a `activeCollections` (test existente).
- **Se conserva:** el array actual `links`/`magicLinks`, el uso de `NavLink` (rutas), la lógica de `activeCollections`/usuario, avatar, `ThemeToggle`/`ExportButton`, `toBackendCollectionKey`. `NavbarActiveCollections.test.tsx` no debe romperse (solo depende de los textos y la visibilidad).
- Menú móvil: mismo vocabulario (no rediseñar el mecanismo, solo saneamiento visual).

## 8. Listas ×6 (cabecera A)

Todas comparten: `PageHeader` + `rule-double` con acento + fila de `FilterPill`s (donde existan) + `OwnerTabs` con filete + cuadrícula de tarjetas (reutilizadas tal cual, salvo retoques de contenedor) + colofón `statusline`. **Toda la funcionalidad actual se conserva** (filtros, búsqueda, orden, scroll infinito…).

| Lista | Cabecera (mockup) | Pills | Controles conservados | Observaciones |
|---|---|---|---|---|
| `BookListPage` (`/coleccion`) | «Colección de libros» · `132 libros en tu colección · catálogo nº 02` | Todos / En lectura / Completados / Por leer | búsqueda, orden, filtros, scroll infinito | Pie de tarjeta con páginas leídas (barra/input) intacto |
| `GameListPage` (`/juegos`) | `47 videojuegos… · catálogo nº 03` | — (usa selects) | búsqueda, orden, select de plataforma (`usePlatformOptions`), filtros | **Preservar el valor actual del filtro de plataforma:** `platformOptions` solo trae el catálogo; si `platformFilter` (p. ej. legado `PS2`) no está en las opciones, el select queda en blanco al recargar. El plan debe **preponer `platformFilter` a las opciones del catálogo (deduplicado)** en el `select` de filtro de la lista — igual que ya hace el select del formulario. |
| `MagicListPage` (`/magic`) | «Colección Magic» · `128 cartas en tu colección · catálogo nº 04` | — | búsqueda, panel de filtros (rareza/color/tipo) | El panel de filtros pasa a `.filterbar` |
| `DeckListPage` (`/magic/mazos`) | «Colección de mazos» · `9 mazos en tu colección · catálogo nº 04-B` | — | búsqueda, orden | Tarjetas inline (no existe `DeckCard`): envoltura Gabinete sin tocar su interior |
| `BoardGameListPage` (`/boardgames`) | «La sala de juegos» · `47 juegos… · catálogo nº 05` | Todos / En propiedad / Lista de deseos | búsqueda, géneros, orden | Botón «adquirir» solo en deseados (intacto en `BoardGameCard`) |
| `MovieShowListPage` (`/movieshows`) | «La videoteca» · `38 títulos en tu colección · catálogo nº 06` | Todos / Viendo / Visto / Plan para ver | búsqueda, géneros, tipo de medio, orden | Badges Película/Serie + plataformas en tarjeta intactos |

**Decisiones explícitas (registro):**
- Las tarjetas individuales (`BookCard`, `GameCard`, `MagicCard`, `BoardGameCard`, `MovieShowCard`, inline de mazos) **no se re-dibujan**: se reutilizan con su estructura y pie funcional; el rediseño actúa sobre el contenedor, cabecera, filtros y pie de lista. Los mockups muestran la composición objetivo, no una reescritura de tarjetas.
- `Platform` sigue siendo texto libre; **ningún select pierde la opción con el valor actual** de la entidad (legado `PS2`, `WII_U`, etc.).

## 9. Detalles ×6 (ficha A)

Anatomía común (`detail-ficha`):
1. **Fila de migas + acciones** (`← Volver` / `Editar` / `Eliminar`) bajo la que corre una `rule-double` con segmento de acento.
2. **Portada/carátula enmarcada** (`.cover-frame`): imagen con lomo `var(--sc)` y sombra interior; alto ≈ ficha.
3. **Kicker ✦ + h1 Fraunces + subtítulo en cursiva** (autor/director/año según colección).
4. **Chips**: badge de estado, tipos y géneros según colección (colores de estado existentes se conservan).
5. **`MetaList`** (versalitas 3 col) con los datos que hoy viven en los `dl` planos de cada detalle.
6. **Paneles propios** por colección (con `rule-double` o separador entre bloques) — todos conservados:

| Detalle | Paneles / elementos propios conservados |
|---|---|
| `BookDetailPage` | progreso de lectura, comentario, ficha de datos del libro |
| `GameDetailPage` | «Ver logros» (**solo** con `steamAppId && isPcPlatform(platform)`), comentario, valoración, ficha de datos; sigue usando `thumbnailUrl` |
| `MagicDetailPage` | badge rareza/condición/cantidad, coste de maná, ficha pairs, «Texto de la carta», «Notas personales» |
| `DeckDetailPage` | tabla de cartas (Cant./Carta/Coste/Tipo/Quitar) + `aside` sticky con comandante, contadores y estado; modal «Añadir carta» (Scryfall) |
| `BoardGameDetailPage` | ficha 3 col, nota, valoración, adquirir (solo deseados) |
| `MovieShowDetailPage` | **backdrop** amplio, ★ TMDB, versalitas (Año, Valoración TMDB, Fecha inicio/fin, Episodios, Fuente externa), Comentario, «Disponible en» con `↻ Actualizar disponibilidad` |

Confirmado en planteo: `ficha A` en los 6 detalles **no introduce carrusel/paneles nuevos**; solo recompone los bloques existentes.

## 10. Estados compartidos (vacío / carga / tabs)

`estados.html`:
- Lista vacía: cabecera A + pestañas intactas; `EmptyState` en papel con lupa/accento y CTA «Empezar a añadir» (+ colofón variante «— aún no hay catálogo —» solo cuando corresponda).
- Carga: esqueletos papel con shimmer (adaptación de `SkeletonGrid`).
- Tabs + pills: filete inferior y relleno con `var(--sc)`; variante «Todas» gris bicolor (por tanto, la pestaña activa en rojo/gris cuando filtra colecciones ajenas).

## 10B. Altas y edición ×6 (formato de alta)

Aprobado en `alta.html`, `alta-videojuegos-mazos.html` y `alta-mesa-cine-libros.html`. **Cambia el envoltorio visual, no la lógica**: ningún campo, validación, select, llamada a API ni flujo de búsqueda exterior cambia. Los formularios siguen siendo los existentes (`BookForm`, `GameForm`, `BoardGameForm`, `MovieShowForm`, el inline de `DeckCreatePage`); solo se recomponen alrededor.

**Esqueleto común (todas las ventanas de alta):**
1. Migas (`Inicio / <Colección> / Añadir`) con `rule-double` y **segmento de acento** (`var(--sc)` de la colección).
2. **Cabecera A** — kicker `✦` en versalitas + `h1` Fraunces + subtítulo en cursiva (el mismo estribillo que las listas; `PageHeader` reutilizable).
3. **Tabs de método con filete** (`var(--sc)` activo) — solo donde existen (`Buscar …`/`Alta manual`/`Código de barras`; Mazos y Magic sin tabs).
4. **Panel de papel con filete lateral** (≈3px `var(--sc)`) para el formulario o el buscador; dentro, **secciones en versalitas** («Información básica», «Adquisición»/«Imagen/Portada», «Fechas», «Valoración y notas»…) — las que ya usa `FormSection` — con separador `--rule` y la pequeña barrita de acento de sección.
5. **Pie** `Cancelar` (ghost) + `Guardar…` (primary), como hoy.
6. Búsquedas exteriores: `SearchField` en barra redondeada (pilera) con botón; **resultados** en tarjetas de papel (portada real 44×62 + título + metadatos + «Añadir a mi colección»); el **modal de alta** que hereda el flujo actual recompuesto en papel (`rule-double` con acento en su cabecera, mismos campos, mismo pie Cancelar/Añadir).

**Tabla por colección (todo conservado tal cual):**

| Alta | Ventanas/pestañas | Particularidades conservadas |
|---|---|---|
| `BookCreatePage` (`/nuevo`) | Buscar libro · Alta manual · **Código de barras** | `BookSearch` + modal de alta; `BookIsbnScan` con marco de escáner + entrada manual de ISBN (al localizar, mismo modal); `BookForm` compartido con `BookEditPage` |
| `GameCreatePage` (`/juegos/nuevo`) | Buscar videojuego · Alta manual | `GameSearch` + modal; `GameForm` compartido con `GameEditPage`; **select de plataforma nunca pierde el valor actual** (plataforma texto libre, legados `PS2`/`WII_U`…) y checkbox «Platinar» solo con plataforma PC + Steam ID |
| `MagicCreatePage` (`/magic/nuevo`) | búsqueda única (sin tabs) | `MagicPrintingsPanel` en **modal de papel** (ediciones + precios + cantidad) — no hay edit de Magic |
| `DeckCreatePage` (`/magic/mazos/nuevo`) | alta única (sin tabs) | Formulario inline con buscador de comandante (mini-resultados Scryfall) + bloque «elegido» con imagen, **identidad de color** y botón «Cambiar»; `DeckEditPage` duplica el mismo esqueleto |
| `BoardGameCreatePage` (`/boardgames/nuevo`) | Buscar juego · Alta manual | `BoardGameSearch` + modal; `BoardGameForm` compartido con `BoardGameEditPage`; campos condicionales del estado «En propiedad» (adquisición/jugadas/dificultad) intactos |
| `MovieShowCreatePage` (`/movieshows/nuevo`) | Buscar en TMDB · Alta manual | select de Tipo (Películas/Series) junto al buscador; `MovieShowSearch` + modal; `MovieShowForm` compartido con `MovieShowEditPage` |

## 10C. Perfil y preferencias

Aprobado en `perfil.html`. El perfil **no pertenece a una colección**: usa el acento **brand** (naranja del Gabinete) en su cabecera, y el acento de cada colección aparece solo donde se listan colecciones.

- **`ProfilePage` (`/perfil`)**: migas + `rule-double` con acento **brand**; cabecera con avatar, nombre (h1 Fraunces) y bio; fila derecha con «Editar perfil» (ghost) y «Borrar cuenta» (ghost danger). Tarjeta de papel **«Colecciones públicas»** con **chips por colección**: cada chip lleva su **filete lateral del acento de la colección** (`--ac` inline) + etiqueta y conteo. Tabs de colección debajo (el activo con **filete del acento de su colección**, no de brand) + grid de piezas y colofón `statusline`. El modal «Editar perfil» hereda el panel de papel de los formularios (Nombre · Bio · Foto de avatar · Steam ID → Guardar).
- **`PublicProfilePage` (`/perfil/:username`)**: misma composición **sin acciones** (sin Editar/Borrar). Las colecciones privadas se ocultan («Colección privada») y solo aparecen los tabs de las públicas. Colofón con aviso de colección oculta.
- **`PreferencesPage` (`/preferencias`)**: cabecera A de acento brand («Preferencias»). Panel de papel (filete lateral) con sección en versalitas «Preferencias de colección» y **una fila por colección**: `dot` del acento de la colección (`--ac`), nombre activable (checkbox en papel) y select `Público/Privado`; pie con «Guardar cambios» (primary). `CollectionPreferencesPanel` se conserva, solo se reenvuelve (cada fila: dot + checkbox + select con `--ac` inline por colección desde `COLLECTIONS`).

## 11. Fuera de alcance (explícito)

- **Auth** (login/registro/sesiones), **`App.tsx`** (rutas intactas; todas las páginas implicadas ya están cableadas).
- **Estructura interna de las tarjetas** (solo contenedor/espaciado).
- **Lógica y flujos de formularios, búsquedas exteriores, perfil y preferencias** — solo cambia el envoltorio visual (ver §10B/§10C).
- **La vitrina Home ya está mergeada** (no se retoca): sin tokens de color nuevos en `tailwind.config.js`.

## 12. Verificación

```
npm run build
npx tsc --noEmit      # vs baseline ~44 errores preexistentes (solo nuevos importan)
npm test              # solo los 2 fallos preexistentes (GameCard, GameDetailPrice — GamePlatform eliminado)
```

Plus revisión visual manual contra los mockups aprobados (navegación + 6 listas + 6 detalles + estados + **11 ventanas de alta** — libros×3, videojuegos×2, magic, mazos, mesa×2, cine×2 — + **3 de perfil**), revisando que ninguna acción funcional haya desaparecido.

## 13. Archivos alto nivel

- `src/constants/collections.ts` (ampliar) · `src/pages/HomePage.tsx` (consumir `COLLECTIONS`)
- `src/components/PageHeader.tsx` **nuevo** · `src/components/MetaList.tsx` **nuevo**
- `src/components/Navbar.tsx` · `OwnerTabs.tsx` · `FilterPill.tsx` · `EmptyState.tsx`
- `src/index.css` (`@layer components`)
- 6 × `*ListPage.tsx` · 6 × `*DetailPage.tsx`
- **Altas/edición:** `*CreatePage.tsx` ×6 · `*EditPage.tsx` ×5 (no Magic) · `BookForm`/`GameForm`/`BoardGameForm`/`MovieShowForm`/`BookSearch`/`GameSearch`/`BoardGameSearch`/`MovieShowSearch`/`BookIsbnScan`/`MagicPrintingsPanel`/`SearchField`/`FormSection`
- **Perfil/preferencias:** `ProfilePage.tsx` · `PublicProfilePage.tsx` · `PreferencesPage.tsx` · `ProfileView.tsx` · `UserProfileHeader.tsx` · `CollectionPreferencesPanel.tsx`
- `src/__tests__/NavbarActiveCollections.test.tsx` (no romper)

## 14. Orden de implementación sugerido (para el plan)

1. `constants/collections.ts` + migración de `HomePage`.
2. CSS nuevo (`@layer components`).
3. `PageHeader` + `MetaList`.
4. Retoques `OwnerTabs` / `FilterPill` / `EmptyState` / `.filterbar` / `statusline`.
5. Navbar (tratamiento A).
6. Listas ×6 (una a una, con build intermedio).
7. Detalles ×6 (una a una).
8. Altas ×6 + perfil/preferencias (wrap Gabinete; una a una).
9. Estados compartidos + `npm run build` + `tsc` + `npm test` finales.