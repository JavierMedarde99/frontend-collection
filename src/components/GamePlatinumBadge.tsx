import { useEffect, useState } from 'react'
import { getGameAchievements } from '../api/gamesApi'
import { GamePlatform, type Game } from '../types'

interface GamePlatinumBadgeProps {
  game: Game
}

/**
 * Muestra un trofeo dorado (estilo Steam 100 %) cuando el juego tiene
 * todos sus logros conseguidos. Solo aplica a juegos de PC vinculados
 * a Steam; en cualquier otro caso (o si la consulta falla) no muestra nada.
 */
export default function GamePlatinumBadge({ game }: GamePlatinumBadgeProps) {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (game.platform !== GamePlatform.PC || !game.steamAppId) return
    let cancelled = false
    getGameAchievements(game.id)
      .then((data) => {
        if (!cancelled && data.totalAchievements > 0 && data.percentage >= 100) {
          setCompleted(true)
        }
      })
      .catch(() => {
        /* sin insignia si no se pueden consultar los logros */
      })
    return () => {
      cancelled = true
    }
  }, [game.id, game.platform, game.steamAppId])

  if (!completed) return null

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-medium bg-amber-100 text-amber-800"
      title="Logros completados al 100 %"
      aria-label="Logros completados al 100 %"
    >
      <svg
        aria-hidden="true"
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
      100 %
    </span>
  )
}
