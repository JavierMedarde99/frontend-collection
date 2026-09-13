import { MANA_COLORS, type ManaColorCode } from '../constants/decks'

const DOT_STYLES: Record<ManaColorCode, string> = {
  W: 'bg-[#F9F6E3] text-stone-600 border border-stone-300',
  U: 'bg-sky-600 text-white',
  B: 'bg-neutral-800 text-white',
  R: 'bg-red-600 text-white',
  G: 'bg-green-700 text-white',
}

interface ManaColorDotsProps {
  colors?: string[]
  size?: 'sm' | 'md'
}

/** Identidad de color del comandante como círculos de colores MTG. */
export default function ManaColorDots({ colors, size = 'md' }: ManaColorDotsProps) {
  const valid = (colors || []).filter((c): c is ManaColorCode => c in MANA_COLORS)
  if (valid.length === 0) return null
  const dims = size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-[11px]'
  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      role="img"
      aria-label={`Colores: ${valid.map((c) => MANA_COLORS[c]).join(', ')}`}
    >
      {valid.map((color) => (
        <span
          key={color}
          title={MANA_COLORS[color]}
          className={`${dims} rounded-full font-bold flex items-center justify-center shadow-sm ${DOT_STYLES[color]}`}
        >
          {color}
        </span>
      ))}
    </span>
  )
}
