import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import { listDecks, deleteDeck } from '../api/deckApi'
import DeckCommanderImage from '../components/DeckCommanderImage'
import ManaColorDots from '../components/ManaColorDots'
import OwnerLine from '../components/OwnerLine'
import ConfirmDialog from '../components/ConfirmDialog'
import type { DeckResponse } from '../types'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import SearchField from '../components/SearchField'
import SkeletonInline from '../components/SkeletonInline'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import OwnerTabs, { type OwnerTab } from '../components/OwnerTabs'
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
  const [query, setQuery] = useListQuery({ name: '' })
  const { name: nameFilter } = query

  const { isAuthenticated, user } = useAuth()
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('mine')
  const effectiveTab = isAuthenticated ? ownerTab : 'other'

  const {
    items: decks,
    totalElements,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
    reload: load,
  } = useInfiniteScroll<DeckResponse>({
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar los mazos.',
    fetchPage: (page, size) =>
      listDecks({ page, size, name: nameFilter || undefined, sort: 'name,asc', owner: effectiveTab, viewerId: user?.id || undefined }),
    deps: [nameFilter, effectiveTab, user?.id],
  })

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setQuery({ name: nameInput.trim() })
  }

  function clearFilters() {
    setNameInput('')
    setQuery({ name: '' })
  }

  const hasActiveFilters = Boolean(nameFilter)

  const [deleting, setDeleting] = useState<DeckResponse | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  function handleEdit(deckId: string) {
    navigate(`/magic/mazos/${deckId}/editar`)
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await deleteDeck(deleting.id)
      setDeleting(null)
      load()
    } finally {
      setDeleteBusy(false)
    }
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
          {effectiveTab === 'mine' && (
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
          )}
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

      <OwnerTabs value={effectiveTab} onChange={setOwnerTab} showMine={isAuthenticated} />

      {error && (
        <ErrorBanner message={error} />
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : decks.length === 0 ? (
        <EmptyState
          title={(effectiveTab === 'other' && !hasActiveFilters) ? 'Nada por aquí todavía' : hasActiveFilters ? 'Sin resultados' : 'No hay mazos'}
          message={
            hasActiveFilters
              ? 'Ningún mazo coincide con la búsqueda. Limpia el filtro para verlos todos.'
              : (effectiveTab === 'other' && !hasActiveFilters) ? 'Ningún usuario ha añadido nada a esta colección todavía.'
              : 'Crea tu primer mazo Commander eligiendo su comandante.'
          }
          action={
            hasActiveFilters ? (
              <button className="btn-ghost mt-2" onClick={clearFilters}>
                Limpiar filtros
              </button>
            ) : effectiveTab === 'other' ? undefined : (
              <Link className="btn-primary mt-2" to="/magic/mazos/nuevo">
                Crear mazo
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck, idx) => {
            const total = totalCards(deck)
            return (
              <article
                key={deck.id}
                className="card card-hover animate-fade-up group flex flex-col overflow-hidden hover:!border-accent hover:shadow-lg"
                style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}
              >
                <div className="flex gap-4 p-5">
                  <Link
                    to={`/magic/mazos/${deck.id}`}
                    aria-label={`Ver ${deck.name}`}
                    className="shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {deck.commander ? (
                      <DeckCommanderImage commanderName={deck.commander} size="lg" />
                    ) : (
                      <div className="w-28 h-40 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite text-center px-1">
                        Sin imagen
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/magic/mazos/${deck.id}`}
                        className="font-display text-heading leading-snug text-ink line-clamp-1 min-w-0 flex-1 hover:text-brand transition-colors"
                        title={deck.name}
                      >
                        {deck.name}
                      </Link>
                      <ManaColorDots colors={deck.commanderColors} />
                    </div>
                    {effectiveTab === 'other' && <OwnerLine owner={deck.userOwned} />}
                {deck.commander && (
                      <p className="text-body-sm text-graphite line-clamp-1" title={deck.commander}>
                        {deck.commander}
                      </p>
                    )}
                    <p className="text-body font-semibold text-brand mt-auto pt-1">
                      {total} carta{total === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                {deck.description && (
                  <p className="text-body text-slate line-clamp-2 px-5 pb-4">{deck.description}</p>
                )}
                {effectiveTab === 'mine' && (
                  <div className="mt-auto flex items-center gap-2 px-4 py-3 border-t border-silver/60">
                    <button
                      type="button"
                      className="btn-ghost !px-4 !py-2 flex-1"
                      onClick={() => handleEdit(deck.id)}
                      aria-label={`Editar ${deck.name}`}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !px-4 !py-2 flex-1 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
                      onClick={() => setDeleting(deck)}
                      aria-label={`Eliminar ${deck.name}`}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
        {loadingMore && <SkeletonInline />}
        {!hasMore && (
          <p className="text-body-sm text-graphite text-center" role="status">
            No hay más mazos
          </p>
        )}
        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar mazo"
        message={deleting ? `¿Seguro que quieres eliminar "${deleting.name}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        busy={deleteBusy}
      />
    </section>
  )
}
