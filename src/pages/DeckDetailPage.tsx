import { useCallback, useEffect, useReducer, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getDeck, deleteDeck, addCardToDeck, removeCardFromDeck, getDeckStatus } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'
import type { DeckResponse, DeckStatusResponse, MagicCardSearchResult } from '../types'
import { DECK_STATUS_LABELS, DECK_STATUS_COLORS } from '../constants/decks'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import DeckCommanderImage from '../components/DeckCommanderImage'
import ManaColorDots from '../components/ManaColorDots'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

interface AddCardModalState {
  open: boolean
  query: string
  searchResults: MagicCardSearchResult[]
  searching: boolean
  searchError: string | null
  selected: MagicCardSearchResult | null
  quantity: number
  adding: boolean
  addError: string | null
}

type AddCardModalAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'query'; query: string }
  | { type: 'search/start' }
  | { type: 'search/success'; results: MagicCardSearchResult[] }
  | { type: 'search/error'; message: string }
  | { type: 'select'; card: MagicCardSearchResult }
  | { type: 'quantity'; quantity: number }
  | { type: 'add/start' }
  | { type: 'add/success' }
  | { type: 'add/error'; message: string }

const initialAddCardModal: AddCardModalState = {
  open: false,
  query: '',
  searchResults: [],
  searching: false,
  searchError: null,
  selected: null,
  quantity: 1,
  adding: false,
  addError: null,
}

function addCardModalReducer(state: AddCardModalState, action: AddCardModalAction): AddCardModalState {
  switch (action.type) {
    case 'open':
      return { ...initialAddCardModal, open: true }
    case 'close':
      // No se cierra mientras se está añadiendo
      return state.adding ? state : { ...state, open: false }
    case 'query':
      return { ...state, query: action.query }
    case 'search/start':
      return { ...state, searching: true, searchError: null }
    case 'search/success':
      return { ...state, searching: false, searchResults: action.results }
    case 'search/error':
      return { ...state, searching: false, searchError: action.message }
    case 'select':
      return { ...state, selected: action.card, quantity: 1, addError: null }
    case 'quantity':
      return { ...state, quantity: action.quantity }
    case 'add/start':
      return { ...state, adding: true, addError: null }
    case 'add/success':
      return { ...initialAddCardModal }
    case 'add/error':
      return { ...state, adding: false, addError: action.message }
  }
}

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/magic/mazos')

  const [deck, setDeck] = useState<DeckResponse | null>(null)
  usePageTitle(deck?.name || 'Mazos')
  const [status, setStatus] = useState<DeckStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // PopUp añadir carta: máquina de estados del modal
  const [modal, dispatchModal] = useReducer(addCardModalReducer, initialAddCardModal)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { query, searchResults, searching, searchError, selected, quantity, adding, addError } = modal

  // PopUp imagen en grande (carta de la tabla o comandante)
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)
  const [commanderImage, setCommanderImage] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedImage) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedImage])

  useEffect(() => {
    setCommanderImage(null)
  }, [deck?.commander])

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [deckData, statusData] = await Promise.all([
        getDeck(id),
        getDeckStatus(id).catch(() => null),
      ])
      setDeck(deckData)
      setStatus(statusData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el mazo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  function openAddModal() {
    dispatchModal({ type: 'open' })
  }

  function closeAddModal() {
    dispatchModal({ type: 'close' })
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    dispatchModal({ type: 'search/start' })
    try {
      const results = await searchMagicCards(query.trim())
      dispatchModal({ type: 'search/success', results })
    } catch (err) {
      dispatchModal({
        type: 'search/error',
        message: err instanceof Error ? err.message : 'Error al buscar cartas.',
      })
    }
  }

  async function handleAddCard(e: FormEvent) {
    e.preventDefault()
    if (!id || !selected?.scryfallId) return
    dispatchModal({ type: 'add/start' })
    try {
      const updated = await addCardToDeck(id, { scryfallId: selected.scryfallId, quantity })
      setDeck(updated)
      try {
        setStatus(await getDeckStatus(id))
      } catch {
        /* mantiene el estado anterior */
      }
      dispatchModal({ type: 'add/success' })
    } catch (err) {
      dispatchModal({
        type: 'add/error',
        message: err instanceof Error ? err.message : 'No se pudo añadir la carta.',
      })
    }
  }

  async function handleRemoveCard(scryfallId: string) {
    if (!id) return
    setRemovingId(scryfallId)
    try {
      const updated = await removeCardFromDeck(id, scryfallId)
      setDeck(updated)
      try {
        setStatus(await getDeckStatus(id))
      } catch {
        /* mantiene el estado anterior */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar la carta.')
    } finally {
      setRemovingId(null)
    }
  }

  async function confirmDelete() {
    if (!id) return
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await deleteDeck(id)
      navigate('/magic/mazos', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el mazo.')
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonGrid count={4} />
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 flex flex-col items-center gap-4">
        <ErrorBanner message={error || 'Mazo no encontrado'} />
        <Link className="btn-primary" to="/magic/mazos">
          Volver a mazos
        </Link>
      </div>
    )
  }

  const cards = deck.cards || []
  const totalCount = cards.reduce((sum, c) => sum + (c.quantity || 0), 0)

  return (
    <article className="max-w-6xl mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Magic", to: "/magic" }, { label: "Mazos", to: "/magic/mazos" }, { label: deck?.name || 'Detalle' }]} />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver a mazos
        </button>
        <div className="flex items-center gap-2">
          <button className="btn-primary !px-4 !py-2" onClick={openAddModal}>
            + Añadir carta
          </button>
          <button
            className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {deleteError && (
        <ErrorBanner message={deleteError} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="font-display text-heading-sm">Cartas del mazo</h2>
            <p className="text-caption text-graphite">
              {totalCount} carta{totalCount === 1 ? '' : 's'} · {cards.length} distinta{cards.length === 1 ? '' : 's'}
            </p>
          </div>
          {cards.length === 0 ? (
            <EmptyState
              title="Mazo vacío"
              message="Usa el botón Añadir carta para buscar en Scryfall."
            />
          ) : (
            <div className="card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-silver/60 text-caption uppercase tracking-wide text-stone">
                      <th scope="col" className="px-4 py-3 font-semibold">Cant.</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Carta</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Coste</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Tipo</th>
                      <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr
                        key={card.scryfallId || card.cardName}
                        onClick={() => {
                          if (card.imageUrl) setSelectedImage({ url: card.imageUrl, title: card.cardName })
                        }}
                        title={card.imageUrl ? `Ver ${card.cardName} en grande` : undefined}
                        className="border-b border-silver/40 last:border-0 even:bg-slate-50/60 hover:bg-brand-soft/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-ink text-white text-body-sm font-bold">
                            x{card.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {card.imageUrl ? (
                              <img
                                src={card.imageUrl}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                className="w-20 h-28 object-cover rounded-lg shadow-sm shrink-0 bg-paper"
                              />
                            ) : (
                              <div className="w-20 h-28 rounded-lg shrink-0 bg-brand-soft flex items-center justify-center text-caption text-graphite">
                                ?
                              </div>
                            )}
                            <div className="min-w-0">
                              <button
                                type="button"
                                className="font-medium text-ink line-clamp-1 text-left hover:text-brand transition-colors"
                                onClick={() => {
                                  if (card.imageUrl) setSelectedImage({ url: card.imageUrl, title: card.cardName })
                                }}
                                aria-label={`Ver ${card.cardName} en grande`}
                              >
                                {card.cardName}
                              </button>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {card.inCollection && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-caption">
                                    En colección
                                  </span>
                                )}
                                {card.isProxy && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium text-caption">
                                    Proxy
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-body font-semibold text-ink whitespace-nowrap">
                          {card.manaCost || '—'}
                        </td>
                        <td className="px-4 py-3 text-body-sm text-graphite max-w-[220px]">
                          <span className="line-clamp-2">{card.typeLine || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {card.scryfallId && (
                            <button
                              type="button"
                              className="btn-ghost !px-3 !py-1.5 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
                              disabled={removingId === card.scryfallId}
                              onClick={(e) => { e.stopPropagation(); handleRemoveCard(card.scryfallId!) }}
                            >
                              {removingId === card.scryfallId ? 'Quitando…' : 'Quitar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <aside className="card p-5 flex flex-col gap-4 lg:sticky lg:top-24" aria-label="Información del mazo">
          <div className="flex justify-center">
            {deck.commander ? (
              commanderImage ? (
                <button
                  type="button"
                  className="rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setSelectedImage({ url: commanderImage, title: deck.commander! })}
                  aria-label={`Ver ${deck.commander} en grande`}
                  title={`Ver ${deck.commander} en grande`}
                >
                  <DeckCommanderImage commanderName={deck.commander} size="xl" onImageLoad={setCommanderImage} />
                </button>
              ) : (
                <DeckCommanderImage commanderName={deck.commander} size="xl" onImageLoad={setCommanderImage} />
              )
            ) : (
              <div className="w-32 h-44 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite text-center px-1">
                Sin imagen
              </div>
            )}
          </div>
          <div className="text-center flex flex-col items-center gap-1.5">
            <h1 className="font-display text-heading text-ink">{deck.name}</h1>
            <ManaColorDots colors={deck.commanderColors} size="lg" />
            {deck.commander && (
              <p className="text-body-sm text-graphite line-clamp-1" title={deck.commander}>
                {deck.commander}
              </p>
            )}
          </div>
          {deck.description && (
            <p className="text-body text-slate whitespace-pre-line">{deck.description}</p>
          )}
          <dl className="flex flex-col gap-1.5 text-body-sm border-t border-silver/60 pt-4">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-graphite">Cartas</dt>
              <dd className="font-semibold text-ink">{totalCount}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-graphite">Distintas</dt>
              <dd className="font-semibold text-ink">{cards.length}</dd>
            </div>
          </dl>
          {status && (
            <div className="border-t border-silver/60 pt-4 flex flex-col gap-2">
              <span className={`self-start px-4 py-1.5 rounded-full text-body-sm font-semibold ${DECK_STATUS_COLORS[status.status]}`}>
                {DECK_STATUS_LABELS[status.status]}
              </span>
              {status.message && (
                <p className="text-body-sm text-slate">{status.message}</p>
              )}
            </div>
          )}
        </aside>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md modal-sheet"
          onClick={() => setSelectedImage(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-ink text-white text-body font-bold shadow-lg hover:bg-brand transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Cerrar detalle"
            >
              ✕
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[85vh] w-auto max-w-[90vw] rounded-xl shadow-2xl bg-paper"
            />
          </div>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet">
          <div role="dialog" aria-modal="true" aria-label="Añadir carta al mazo" className="modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-heading-sm">Añadir carta al mazo</h3>
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5"
                onClick={closeAddModal}
                disabled={adding}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  className="input flex-1"
                  value={query}
                  onChange={(e) => dispatchModal({ type: 'query', query: e.target.value })}
                  placeholder="Buscar en Scryfall…"
                  aria-label="Buscar carta en Scryfall"
                />
                <button className="btn-primary shrink-0" type="submit" disabled={searching}>
                  {searching ? 'Buscando…' : 'Buscar'}
                </button>
              </form>

              {searchError && (
                <ErrorBanner message={searchError} />
              )}

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.scryfallId || result.name}
                      type="button"
                      onClick={() => dispatchModal({ type: 'select', card: result })}
                      className={`card p-3 flex items-center gap-3 text-left transition-all ${
                        selected?.scryfallId === result.scryfallId ? '!border-brand !shadow-brand-glow' : ''
                      }`}
                    >
                      {result.imageUrl && (
                        <img src={result.imageUrl} alt={result.name} className="w-10 h-14 object-cover rounded shrink-0" />
                      )}
                      <span className="min-w-0">
                        <span className="block font-display text-heading-sm line-clamp-1">{result.name}</span>
                        <span className="block text-caption text-graphite">{result.setName || result.type}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selected && (
                <form onSubmit={handleAddCard} className="card p-4 flex flex-col sm:flex-row sm:items-end gap-4 !shadow-none border border-silver/60">
                  <p className="text-body font-medium text-ink flex-1">
                    Añadir <span className="font-display">{selected.name}</span> al mazo
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="label" htmlFor="deck-quantity">Cantidad</label>
                    <input
                      id="deck-quantity"
                      type="number"
                      min="1"
                      className="input w-28"
                      value={quantity}
                      onChange={(e) => dispatchModal({ type: 'quantity', quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    />
                  </div>
                  <button type="submit" className="btn-primary shrink-0" disabled={adding}>
                    {adding ? 'Añadiendo…' : 'Añadir'}
                  </button>
                </form>
              )}

              {addError && (
                <ErrorBanner message={addError} />
              )}

              <div className="flex justify-end border-t border-silver/60 pt-4">
                <button type="button" className="btn-ghost" onClick={closeAddModal} disabled={adding}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting}
        title="Eliminar mazo"
        message={`¿Seguro que quieres eliminar "${deck.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </article>
  )
}
