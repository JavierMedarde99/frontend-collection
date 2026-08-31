---
name: Studio Minimalist
colors:
  surface: '#f8f9ff'
  surface-dim: '#d8dae0'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f9'
  surface-container: '#eceef3'
  surface-container-high: '#e7e8ee'
  surface-container-highest: '#e1e2e8'
  on-surface: '#191c20'
  on-surface-variant: '#44474a'
  inverse-surface: '#2e3135'
  inverse-on-surface: '#eff0f6'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#003ec6'
  on-secondary: '#ffffff'
  secondary-container: '#0052fe'
  on-secondary-container: '#dfe3ff'
  tertiary: '#000001'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001452'
  on-secondary-fixed-variant: '#0038b6'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f8f9ff'
  on-background: '#191c20'
  surface-variant: '#e1e2e8'
  studio-white: '#FFFFFF'
  charcoal-deep: '#1A1C1E'
  digital-blue: '#0052FF'
  surface-muted: '#F1F3F7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  container-max: 1440px
---

## Brand & Style
The design system transitions from a scholarly archive to a **Modern Minimalist** digital studio. The personality is clean, precise, and sophisticated, favoring clarity over ornamentation. The emotional response is one of effortless efficiency and high-end curation.

The aesthetic is characterized by a "Studio White" environment that emphasizes content through deliberate whitespace rather than structural lines. By removing traditional borders and embracing a high-contrast palette with vibrant digital accents, the design system achieves a contemporary, forward-looking feel suitable for premium digital experiences.

## Colors
The palette is built on a high-contrast foundation to ensure a crisp, modern aesthetic.

- **Primary (#1A1C1E):** Deep Charcoal is the anchor for all primary text and structural elements, providing a grounded, authoritative presence.
- **Secondary (#0052FF):** Digital Blue serves as the vibrant accent color for primary actions, focus states, and key highlights.
- **Surface (#FFFFFF):** The primary canvas is a pure Studio White, creating a sense of limitless space and clarity.
- **Neutral (#F8F9FF):** A very subtle cool-grey used for secondary backgrounds and subtle grouping without the need for borders.

## Typography
The system utilizes **Inter** exclusively to create a unified, systematic typographic hierarchy. The transition to a geometric sans-serif removes the literary weight of the previous iteration in favor of a neutral, functional "metadata" aesthetic. 

Headlines use a crisp type scale with generous letter spacing to enhance the "Modern Minimalist" feel. Body text is optimized for readability with a comfortable line height, while labels maintain a high tracking value for a sophisticated, architectural look.

## Layout & Spacing
The layout follows a **Fluid-Fixed Hybrid** model. Content is contained within a max-width container to preserve the minimalist composition, while whitespace is treated as a first-class design element.

- **Grid:** A 12-column system is used for desktop with increased 80px margins to frame content like a gallery piece.
- **Responsive:** On mobile, margins are kept generous at 20px to ensure the UI doesn't feel cramped. 
- **Rhythm:** Spacing follows a strict 8px base unit. Internal component padding should be "oversized" (typically 32px or 40px) to reinforce the luxury of space.

## Elevation & Depth
Hierarchy is achieved through **Tonal Layers** and **Ambient Shadows** rather than borders. This creates a "soft depth" where elements appear to float over the Studio White surface.

- **Level 1 (Base):** Studio White (#FFFFFF) background.
- **Level 2 (Containers):** Subtle surface shifts to Neutral (#F8F9FF) to define sections without hard edges.
- **Level 3 (Floating):** Active cards and menus use extra-diffused, low-opacity shadows (e.g., Blur: 32px, Offset-Y: 12px, Opacity: 4%). This creates a light, "weightless" feel.
- **Interactions:** Subtle backdrop blurs may be used for navigation overlays to maintain context while focusing the user's attention.

## Shapes
The shape language is defined by **Rounded (0.5rem)** corners. This increased radius provides a friendlier, contemporary appearance that softens the high-contrast color palette. 

Large containers like cards should use `rounded-lg` (1rem), while primary action buttons and inputs utilize the base 0.5rem radius. This consistent rounding across the system ensures a cohesive, intentional visual language.

## Components
### Buttons
Primary buttons are solid Digital Blue (#0052FF) with white text. They should have a significant height (at least 48px) and use `label-sm` typography. Secondary buttons are "Ghost" style but without a border—using a light Neutral (#F8F9FF) background and Primary text.

### Cards
Cards are borderless. They rely on a soft ambient shadow or a slight background color shift to define their boundaries. Content within cards should have a minimum of 32px padding to maintain the minimalist aesthetic.

### Input Fields
Inputs are styled as clean, filled containers using the Neutral (#F8F9FF) color. They have no borders in their default state. On focus, they transition to a 2px Primary or Secondary outline to provide clear feedback.

### Chips & Lists
Chips are pill-shaped and use a high-contrast style: Charcoal text on a light Neutral background. Lists are separated by generous whitespace rather than divider lines, using typographic weight to distinguish between primary and secondary information.

### Navigation
The navigation bar is a minimal, floating element or a fixed top bar with a Studio White background and no bottom border, relying on a subtle shadow for separation during scroll.