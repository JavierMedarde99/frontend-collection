import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGame, getGameAchievements } from '../api/gamesApi'
import type { Game, GameAchievementsResponse } from '../types'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'

export default function GameAchievementsPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [data, setData] = useState<GameAchievementsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const game = await getGame(id)
      const data = await getGameAchievements(id)
      setGame(game)
      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los logros.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const achievements = data?.achievements ?? []
  const achievedCount = data?.totalAchieved ?? 0
  const progress = data?.percentage ?? 0

  return (
    <section className="flex flex-col gap-24">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Logros de {game?.title || '…'}</h1>
          <p className="text-body text-slate">
            {achievements.length > 0
              ? `${achievedCount} de ${achievements.length} logros conseguidos · ${progress}%`
              : 'Consultando logros del juego…'}
          </p>
        </div>
        <Link className="btn-ghost !px-5" to="/juegos">
          <svg
            aria-hidden="true"
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Volver a mis videojuegos
        </Link>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner label="Cargando logros…" />
      ) : !error && achievements.length === 0 ? (
        <EmptyState
          title="Sin logros"
          message="Este juego no tiene logros registrados en Steam."
          action={
            <Link className="btn-primary mt-2" to="/juegos">
              Volver a mis videojuegos
            </Link>
          }
        />
      ) : !error ? (
        <>
          <div className="w-full h-2 rounded-pill bg-silver/60 overflow-hidden">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-brand to-accent transition-all duration-500 ease-smooth"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="flex flex-col gap-4">
            {achievements.map((achievement) => (
              <li
                key={achievement.name}
                className={`card animate-fade-up flex items-center gap-4 ${
                  achievement.achieved ? 'opacity-100' : 'opacity-60'
                }`}
              >
                {achievement.iconUrl ? (
                  <img
                    src={achievement.iconUrl}
                    alt=""
                    loading="lazy"
                    className="w-12 h-12 shrink-0 rounded-lg bg-paper object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-paper border border-silver/60 flex items-center justify-center">
                    <svg
                      aria-hidden="true"
                      className={`w-6 h-6 ${achievement.achieved ? 'text-accent' : 'text-stone/40'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-heading leading-snug text-ink">{achievement.name}</h3>
                  {achievement.description && (
                    <p className="text-body text-slate mt-1 line-clamp-2">{achievement.description}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption shrink-0 ${
                    achievement.achieved ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-slate'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full ${
                      achievement.achieved ? 'bg-emerald-500' : 'bg-stone/40'
                    }`}
                  />
                  {achievement.achieved ? 'Conseguido' : 'Sin conseguir'}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}