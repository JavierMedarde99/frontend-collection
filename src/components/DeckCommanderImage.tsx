import { useEffect, useState } from 'react'
import { searchMagicCards } from '../api/magicApi'

interface DeckCommanderImageProps {
  commanderName: string
}

/**
 * Muestra la foto de la carta del comandante buscándola en Scryfall
 * por nombre (el backend no guarda la imagen del comandante en el mazo).
 */
export default function DeckCommanderImage({ commanderName }: DeckCommanderImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!commanderName.trim()) return
    let cancelled = false
    searchMagicCards(commanderName.trim())
      .then((results) => {
        if (!cancelled) {
          setImageUrl(results[0]?.imageUrl || null)
        }
      })
      .catch(() => {
        if (!cancelled) setImageUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [commanderName])

  if (!imageUrl) {
    return (
      <div className="w-20 h-28 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite text-center px-1">
        Sin imagen
      </div>
    )
  }

  return (
    <div className="shrink-0 w-20 overflow-hidden rounded-xl shadow-sm bg-paper">
      <img
        src={imageUrl}
        alt={commanderName}
        loading="lazy"
        className="w-20 h-28 object-cover transition-transform duration-300 group-hover:scale-[1.05]"
      />
    </div>
  )
}
