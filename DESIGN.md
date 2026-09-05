# Book Collection — Design System

> **Theme:** Warm Library · **Voice:** Vibrant but disciplined

A book-collection product with a warm, curated feel. Terracotta orange is the primary brand color, amber carries the accent, and indigo/emerald signal reading states. Surfaces stay quiet (cream, paper) so color reads as intentional energy rather than noise.

## Foundations

### Color

| Token           | Value     | Usage                                                  |
| --------------- | --------- | ------------------------------------------------------ |
| `brand`         | `#ea580c` | Primary CTA, active states, hero gradient              |
| `brand-deep`    | `#c2410c` | Hover / pressed CTA, gradient end                      |
| `brand-soft`    | `#ffedd5` | Icon chips and soft brand fills                        |
| `accent`        | `#f59e0b` | Accent stars, dots, gradient end                       |
| `accent-deep`   | `#b45309` | Accent hover and badge text                            |
| `accent-soft`   | `#fef3c7` | Amber-flagged badge backgrounds                        |
| `ink`           | `#1a150f` | Primary text                                          |
| `paper`         | `#faf7f2` | Main page background (warm off-white)                  |
| `cream`         | `#fffdf8` | Elevated / hero surfaces                               |
| `graphite`      | `#3d3428` | Secondary text and controls                            |
| `slate`         | `#6b6259` | Muted text                                             |
| `stone`         | `#98907f` | Subtle labels and icon color                           |
| `silver`        | `#e6e0d6` | Input and control borders                              |
| `info-banner`   | `#eff6fe` | Informational banner background                        |

Semantic status colors (Tailwind defaults, themed in `src/constants/books.js`):

| State       | Fill / text                    | Dot       |
| ----------- | ------------------------------ | --------- |
| TO_READ     | `bg-accent-soft` / `accent-deep` | `accent`  |
| READING     | `bg-indigo-100` / `indigo-700`   | indigo-500 |
| COMPLETED   | `bg-emerald-100` / `emerald-700` | emerald-500 |

Type badges: Manga → rose, Novela → indigo, Novela gráfica → emerald (soft 100 fill, 700 text).

### Gradients

| Gradient          | Source                                  | Usage                    |
| ----------------- | --------------------------------------- | ------------------------ |
| `hero-gradient`   | `135deg, #7c2d12 → #ea580c → #f59e0b`   | Home hero banner         |
| `navbar-gradient` | `90deg, #fffdf8 → #ffedd5 → #fde6d0`    | Sticky navbar background |
| `card-gradient`   | `180deg, #ffffff → #fff8f0`             | Card surfaces            |

### Typography

Use **Poppins** for headings and CTAs, **Inter** for reading and product UI.

| Role          | Family        | Weight | Size / line height | Tracking |
| ------------- | ------------- | -----: | ------------------ | -------- |
| Caption       | Inter         |    500 | 12px / 1.4         | -0.24px  |
| Body small    | Inter         |    400 | 14px / 1.5         | -0.20px  |
| Body          | Inter         |    400 | 16px / 1.5         | -0.19px  |
| Subheading    | Inter         |    400 | 18px / 1.4         | -0.20px  |
| Heading small | Poppins       |    600 | 20px / 1.3         | 0.20px   |
| Heading       | Poppins       |    600 | 24px / 1.3         | 0.24px   |
| Heading large | Poppins       |    700 | 48px / 1.1         | 0.48px   |
| Display       | Poppins       |    700 | 64px / 1.1         | 0.64px   |

### Spacing

Use the 4px rhythm: `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `28`, `32`, `40`, `48`, `80`.

### Radius

`4`, `8`, `12`, `16`, `24`, `32`, `40`, `9999` px. Inputs use 16px; cards use 16px; tags, pills and CTAs use 9999px; the home hero uses 24px.

### Shadows

| Token          | Value                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `sm-4`         | `rgba(90, 60, 30, 0.06) 0px 4px 12px 0px`                                                                                       |
| `sm`           | `rgba(60, 30, 0, 0.18) 0px 1px 5px -4px, rgba(90, 60, 30, 0.06) 0px 4px 12px 0px`                                               |
| `card`         | `rgba(120, 80, 40, 0.05) 0px 1px 2px 0px, rgba(120, 80, 40, 0.08) 0px 4px 12px 0px`                                             |
| `card-hover`   | `rgba(154, 52, 18, 0.12) 0px 8px 16px -4px, rgba(120, 80, 40, 0.12) 0px 18px 32px -8px`                                        |
| `brand-glow`   | `0 10px 30px -10px rgba(234, 88, 12, 0.55)`                                                                                     |

Cards use a pronounced hover elevation (`card-hover` + `-translate-y-1`).

## Layout

- Content maximum: `1200px`
- Section gap: `96px`
- Standard card padding: `24px`
- Product UI cards use `card-gradient` with an extremely subtle shadow instead of a border.

## Components

### Buttons and controls

| Component       | Treatment                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Primary CTA     | `brand → accent` gradient fill, white text, pill radius, 16px × 24px padding, `brand-glow` shadow           |
| Secondary ghost | Transparent, graphite text, 1px silver border, pill radius; hover → white fill with brand border/text       |
| Danger          | Red fill, white text, pill radius                                                                            |
| Header CTA      | Small primary pill (`!px-4 !py-2`)                                                                           |
| Active nav link | Brand pill with `brand-glow`; inactive links are ghost pills with brand hover                               |
| Navbar          | `navbar-gradient`, sticky, logo chip with gradient, active state styled as pills                             |

### Cards and covers

- Book cards: 16px radius, `card-gradient`, `card` shadow; hover elevates with `card-hover` + lift.
- Book covers are prominent (`w-28 h-36`, rounded, subtle shadow) and scale slightly on hover; missing covers render as a soft brand/amber gradient chip with a book icon.
- Each card enters with a staggered `fade-up` animation.

### Home hero

The home page (`/`) opens with a `hero-gradient` banner: brand "chip" tag, display headline, subheading, primary "Ver mi colección" CTA (white pill, brand text) and a translucent "Añadir libro" ghost. Below it, four stat cards (total · por leer · leyendo · completados) pull live counts from the API.

### Forms

- Inputs are white, 16px rounded, `h-12`, with a warm border and a brand focus ring; common fields carry an inline SVG icon (`pl-11`).
- Fields visibly labeled; required markers use `brand`.

### Empty and loading states

- EmptyState: soft `brand-soft` gradient panel, gradient icon chip with `brand-glow`, centered copy, optional action.
- While loading, the collection shows skeleton cards with a `shimmer` sweep; the home hero shows skeleton stat placeholders.

## Usage guidance

**Do**

- Use the warm palette with intent: brand for actions, status colors only for reading states.
- Use Poppins for headings and CTAs, Inter for body.
- Use gradients for the navbar, hero, cover fallbacks and primary CTAs; keep them brand/amber.
- Prefer cards with soft elevation over borders, and reserve `card-hover` for interactive items.

**Avoid**

- Broad, arbitrary decoration in unrelated hues; status colors belong to their states.
- Sharp corners on pills/CTAs, heavy card borders, or flat black call-to-action fills.
- Font weights above 700.

## Accessibility

Maintain visible keyboard focus (brand ring), semantic controls, readable contrast, and reduced-motion behavior. Entrance and shimmer animations are disabled for `prefers-reduced-motion`. Skeleton and stat elements are announced via `aria-busy`/`aria-hidden` where appropriate.