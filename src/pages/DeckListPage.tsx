import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePagedList } from '../hooks/usePagedList'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import { listDecks, deleteDeck } from '../api/deckApi'
import CardMenu from '../components/CardMenu'
import DeckCommanderImage from '../components/DeckCommanderImage'
import type { DeckResponse } from '../types'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import SearchField from '../components/SearchField'
import Pagination from '../components/Pagination'
import { usePageTitle } from '../hooks/usePageTitle'
import { useListQuery } from '../hooks/useListQuery'

function totalCards(deck: DeckResponse): number {
  return (deck.cards || []).reduce((sum, c) => sum + (c.quantity || 0), 0)
}

const PAGE_SIZE = 12

export default function DeckListPage() {
  usePageTitle('Mazos Commander')
  const navigate = useNavigate()
  const [nameInput, setNameInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchRef)
  const [query, setQuery] = useListQuery({ page: 0, name: '' })
  const { name: nameFilter, page } = query

  const {
    items: decks,
    totalPages,
    totalElements,
    loading,
    error,
    reload: load,
  } = usePagedList<DeckResponse>({
    page,
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar los mazos.',
    fetchPage: (page, size) =>
      listDecks({ page, size, name: nameFilter || undefined, sort: 'name,asc' }),
    deps: [nameFilter],
  })

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setQuery({ name: nameInput.trim(), page: 0 })
  }

  function clearFilters() {
    setNameInput('')
    setQuery({ name: '', page: 0 })
  }

  const hasActiveFilters = Boolean(nameFilter)

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
              : `${totalElements} mazo${totalElements === 1 ? '' : 's'} en tu colección`}
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

      <SearchField
            value={nameInput}
            onChange={setNameInput}
            onSubmit={handleSearch}
            placeholder="Buscar mazo por nombre…"
            label="Buscar mazo por nombre"
            inputRef={searchRef}
            shortcutHint
          />

      {error && (
        <ErrorBanner message={error} />
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : decks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'Sin resultados' : 'No hay mazos'}
          message={
            hasActiveFilters
              ? 'Ningún mazo coincide con la búsqueda. Limpia el filtro para verlos todos.'
              : 'Crea tu primer mazo Commander eligiendo su comandante.'
          }
          action={
            hasActiveFilters ? (
              <button className="btn-ghost mt-2" onClick={clearFilters}>
                Limpiar filtros
              </button>
            ) : (
              <Link className="btn-primary mt-2" to="/magic/mazos/nuevo">
                Crear mazo
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck, idx) => (
            <Link
              key={deck.id}
              to={`/magic/mazos/${deck.id}`}
              className="card card-hover animate-fade-up relative flex gap-4 p-5 group"
              style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}
            >
              <div className="absolute top-3 right-3">
                <CardMenu
                  detailTo={`/magic/mazos/${deck.id}`}
                  editTo={`/magic/mazos/${deck.id}/editar`}
                  itemName={deck.name}
                  onDelete={async () => { await deleteDeck(deck.id); load() }}
                />
              </div>
              {deck.commander ? (
                <DeckCommanderImage commanderName={deck.commander} />
              ) : (
                <div className="w-20 h-28 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite text-center px-1">
                  Sin imagen
                </div>
              )}
              <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="font-display text-heading-sm leading-snug text-ink line-clamp-1 min-w-0 flex-1"
                    title={deck.name}
                  >
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
                  <p className="text-body-sm text-graphite line-clamp-1" title={deck.commander}>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(n) => setQuery({ page: n })}
      />
    </section>
  )
}
