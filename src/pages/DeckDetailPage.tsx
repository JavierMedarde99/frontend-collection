import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDeck, deleteDeck, addCardToDeck, removeCardFromDeck, getDeckStatus } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'
import type { DeckResponse, DeckStatusResponse, MagicCardSearchResult } from '../types'
import { DECK_STATUS_LABELS, DECK_STATUS_COLORS } from '../constants/decks'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import DeckCommanderImage from '../components/DeckCommanderImage'

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [deck, setDeck] = useState<DeckResponse | null>(null)
  const [status, setStatus] = useState<DeckStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // PopUp añadir carta: búsqueda Scryfall
  const [showAddModal, setShowAddModal] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MagicCardSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<MagicCardSearchResult | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

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
    setShowAddModal(true)
    setQuery('')
    setSearchResults([])
    setSearchError(null)
    setSelected(null)
    setQuantity(1)
    setAddError(null)
  }

  function closeAddModal() {
    if (adding) return
    setShowAddModal(false)
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError(null)
    try {
      setSearchResults(await searchMagicCards(query.trim()))
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error al buscar cartas.')
    } finally {
      setSearching(false)
    }
  }

  async function handleAddCard(e: FormEvent) {
    e.preventDefault()
    if (!id || !selected?.scryfallId) return
    setAdding(true)
    setAddError(null)
    try {
      const updated = await addCardToDeck(id, { scryfallId: selected.scryfallId, quantity })
      setDeck(updated)
      try {
        setStatus(await getDeckStatus(id))
      } catch {
        /* mantiene el estado anterior */
      }
      closeAddModal()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'No se pudo añadir la carta.')
    } finally {
      setAdding(false)
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 w-full">
          {error || 'Mazo no encontrado'}
        </div>
        <Link className="btn-primary" to="/magic/mazos">
          Volver a mazos
        </Link>
      </div>
    )
  }

  const cards = deck.cards || []

  return (
    <article className="max-w-4xl mx-auto flex flex-col gap-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link className="btn-ghost !px-4 !py-2" to="/magic/mazos">
          ← Volver a mazos
        </Link>
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
          {deleteError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-heading-lg text-ink">{deck.name}</h1>
          {status && (
            <span className={`px-3 py-1 rounded-full text-caption font-semibold ${DECK_STATUS_COLORS[status.status]}`}>
              {DECK_STATUS_LABELS[status.status]}
            </span>
          )}
        </div>
        {status?.message && (
          <div
            className={`p-4 rounded-xl border text-body ${
              status.status === 'INVALID'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-slate-50 border-silver/60 text-slate'
            }`}
            role={status.status === 'INVALID' ? 'alert' : 'status'}
          >
            {status.message}
          </div>
        )}
        {deck.description && (
          <p className="text-body text-slate whitespace-pre-line">{deck.description}</p>
        )}
        <p className="text-caption text-graphite">
          {cards.length} carta{cards.length === 1 ? '' : 's'} distintas
        </p>
      </div>

      {deck.commander && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-heading-sm">Comandante</h2>
          <div className="card p-4 flex items-center gap-4">
            <DeckCommanderImage commanderName={deck.commander} />
            <div className="min-w-0">
              <p className="font-display text-heading text-ink line-clamp-1">{deck.commander}</p>
              {(deck.commanderColors?.length ?? 0) > 0 && (
                <p className="text-body-sm text-graphite mt-1">
                  Colores: {deck.commanderColors!.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-heading-sm">Mazo</h2>
        {cards.length === 0 ? (
          <EmptyState
            title="Mazo vacío"
            message="Usa el botón Añadir carta para buscar en Scryfall."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card) => (
              <div key={card.scryfallId || card.cardName} className="card flex gap-4 p-4">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.cardName}
                    loading="lazy"
                    className="w-16 h-[88px] object-cover rounded-lg shadow-sm shrink-0 bg-paper"
                  />
                ) : (
                  <div className="w-16 h-[88px] rounded-lg shrink-0 bg-brand-soft flex items-center justify-center text-caption text-graphite text-center px-1">
                    Sin imagen
                  </div>
                )}
                <div className="min-w-0 flex-1 flex flex-col">
                  <h3 className="font-display text-heading-sm leading-snug line-clamp-1">{card.cardName}</h3>
                  <p className="text-caption text-graphite mt-0.5">
                    {[card.manaCost, card.typeLine].filter(Boolean).join(' · ') || 'Carta'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-caption">
                    <span className="font-semibold text-ink">x{card.quantity}</span>
                    {card.inCollection && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        En colección
                      </span>
                    )}
                    {card.isProxy && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                        Proxy
                      </span>
                    )}
                  </div>
                  {card.scryfallId && (
                    <button
                      type="button"
                      className="btn-ghost !px-3 !py-1 mt-auto self-start !text-red-600 hover:!bg-red-50 hover:!border-red-200"
                      disabled={removingId === card.scryfallId}
                      onClick={() => handleRemoveCard(card.scryfallId!)}
                    >
                      {removingId === card.scryfallId ? 'Quitando…' : 'Quitar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
          <div role="dialog" aria-modal="true" aria-label="Añadir carta al mazo" className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en Scryfall…"
                  aria-label="Buscar carta en Scryfall"
                />
                <button className="btn-primary shrink-0" type="submit" disabled={searching}>
                  {searching ? 'Buscando…' : 'Buscar'}
                </button>
              </form>

              {searchError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
                  {searchError}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.scryfallId || result.name}
                      type="button"
                      onClick={() => { setSelected(result); setQuantity(1); setAddError(null) }}
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
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <button type="submit" className="btn-primary shrink-0" disabled={adding}>
                    {adding ? 'Añadiendo…' : 'Añadir'}
                  </button>
                </form>
              )}

              {addError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
                  {addError}
                </div>
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
