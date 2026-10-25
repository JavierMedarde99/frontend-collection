export const FIGURE_STATUS_LABELS: Record<'OWNED' | 'WISHLIST', string> = {
  OWNED: 'En propiedad',
  WISHLIST: 'Lista de deseos',
}

export const FIGURE_STATUS_COLORS: Record<'OWNED' | 'WISHLIST', string> = {
  OWNED: 'bg-green-600 text-white',
  WISHLIST: 'bg-yellow-100 text-yellow-800',
}

export const FIGURE_DOT_COLORS: Record<'OWNED' | 'WISHLIST', string> = {
  OWNED: 'bg-white',
  WISHLIST: 'bg-yellow-500',
}

export const AMIIBO_TYPE_LABELS: Record<'CARD' | 'FIGURE' | 'BAND' | 'YARN' | 'BLOCK', string> = {
  CARD: 'Carta',
  FIGURE: 'Figura',
  BAND: 'Banda',
  YARN: 'Lana',
  BLOCK: 'Bloque',
}
