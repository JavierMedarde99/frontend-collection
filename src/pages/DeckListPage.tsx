import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listDecks } from '../api/deckApi'
import DeckCommanderImage from '../components/DeckCommanderImage'
import type { DeckResponse } from '../types'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

function totalCards(deck: DeckResponse): number {
  return (deck.cards || []).reduce((sum, c) => sum + (c.quantity || 0), 0)
}

export default function DeckListPage() {
  const navigate = useNavigate()
  const [decks, setDecks] = useState<DeckResponse[]>([])
  const [nameInput, setNameInput] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listDecks(nameFilter || undefined)
      setDecks(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los mazos.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [nameFilter])

  useEffect(() => {
    load()
  }, [load])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setNameFilter(nameInput.trim())
  }

  function handleEdit(e: MouseEvent, deckId: string) {
    e.preventDefault()
    navigate(`/magic/mazos/${deckId}/editar`)
  }

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Mazos Commander</h1>
          <p className="text-body text-slate">
            {loading
              ? 'Cargando mazos…'
              : `${decks.length} mazo${decks.length === 1 ? '' : 's'} en tu colección`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link className="btn-primary" to="/magic/mazos/nuevo">
            <svg
              aria-hidden="true"
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo mazo
          </Link>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md">
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          className="input !pl-11 pr-28"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Buscar mazo por nombre…"
          aria-label="Buscar mazo por nombre"
        />
        <button className="btn-primary !py-2 !px-3.5 absolute right-1.5 top-1/2 -translate-y-1/2" type="submit">
          Buscar
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : decks.length === 0 ? (
        <EmptyState
          title="No hay mazos"
          message="Aún no has creado ningún mazo Commander o la búsqueda no arrojó resultados."
          action={
            <Link className="btn-primary mt-2" to="/magic/mazos/nuevo">
              Crear mazo
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck, idx) => (
            <Link
              key={deck.id}
              to={`/magic/mazos/${deck.id}`}
              className="card card-hover animate-fade-up flex gap-4 p-5 group"
              style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}
            >
              {deck.commander ? (
                <DeckCommanderImage commanderName={deck.commander} />
              ) : (
                <div className="w-20 h-28 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite text-center px-1">
                  Sin imagen
                </div>
              )}
              <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-heading-sm leading-snug text-ink line-clamp-1">
                    {deck.name}
                  </h3>
                  {(deck.commanderColors?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      {deck.commanderColors!.map((color) => (
                        <span
                          key={color}
                          className="w-5 h-5 rounded-full bg-brand-soft text-brand text-caption font-bold flex items-center justify-center"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {deck.commander && (
                  <p className="text-body-sm text-graphite line-clamp-1">
                    Comandante: {deck.commander}
                  </p>
                )}
                {deck.description && (
                  <p className="text-body text-slate line-clamp-2">{deck.description}</p>
                )}
                <p className="text-caption text-graphite">
                  {totalCards(deck)} carta{totalCards(deck) === 1 ? '' : 's'}
                </p>
                <div className="mt-auto pt-3 border-t border-silver/60 flex justify-end">
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-1.5"
                    onClick={(e) => handleEdit(e, deck.id)}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
