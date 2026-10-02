import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMagicCardsPage, addMagicCardFromScryfall } from '../api/magicApi'
import type { MagicCardPrinting, MagicCardSearchResult } from '../types'
import ErrorBanner from '../components/ErrorBanner'
import SkeletonInline from '../components/SkeletonInline'
import Spinner from '../components/Spinner'
import MagicPrintingsPanel from '../components/MagicPrintingsPanel'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import Breadcrumbs from '../components/Breadcrumbs'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function MagicCreatePage() {
  usePageTitle('Añadir carta Magic')
  const navigate = useNavigate()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [printingsFor, setPrintingsFor] = useState<MagicCardSearchResult | null>(null)
  const [panelSavingId, setPanelSavingId] = useState<string | null>(null)
  const [panelError, setPanelError] = useState<string | null>(null)

  function quantityOf(key: string): number {
    return quantities[key] ?? 1
  }

  function resultKey(card: MagicCardSearchResult): string {
    return card.scryfallId || card.name
  }

  function openPrintings(card: MagicCardSearchResult) {
    setPanelError(null)
    setPanelSavingId(null)
    setPrintingsFor(card)
  }

  async function handleChoosePrinting(printing: MagicCardPrinting) {
    if (!printingsFor) return
    const quantity = Math.max(1, Math.floor(quantityOf(resultKey(printingsFor))) || 1)
    setPanelSavingId(printing.scryfallId)
    setPanelError(null)
    try {
      await addMagicCardFromScryfall(printing.scryfallId, quantity)
      notify(quantity > 1 ? `${quantity} copias añadidas a tu colección.` : 'Carta añadida a tu colección.')
      navigate('/magic')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la carta.'
      setPanelError(message)
      setPanelSavingId(null)
    }
  }

  const {
    items: results,
    hasMore,
    loading: searching,
    loadingMore,
    error: searchError,
    sentinelRef,
  } = useInfiniteScroll<MagicCardSearchResult>({
    size: 10,
    errorMessage: 'Error al buscar cartas.',
    enabled: submitted !== null,
    fetchPage: (page, size) => searchMagicCardsPage(submitted ?? '', page, size),
    deps: [submitted],
  })

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSubmitted(q)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Magic", to: "/magic" }, { label: "Añadir" }]} />
      <div>
        <h1 className="font-display text-heading-lg mb-2">Añadir carta Magic</h1>
        <p className="text-body text-slate">
          Busca una carta en el catálogo de Scryfall y añádela a tu colección.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
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
            className="input !pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. Lightning Bolt, Black Lotus…"
            aria-label="Buscar carta"
          />
        </div>
        <button className="btn-primary shrink-0" type="submit" disabled={searching}>
          {searching ? 'Buscando…' : 'Buscar en Scryfall'}
        </button>
      </form>

      {searchError && (
        <ErrorBanner message={searchError} />
      )}

      {searching && <Spinner label="Buscando…" />}

      {!searching && submitted !== null && results.length === 0 && !searchError && (
        <p className="text-body text-slate text-center" role="status">
          Sin resultados para &ldquo;{submitted}&rdquo;.
        </p>
      )}

      {!searching && results.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-heading-sm">Resultados de búsqueda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((card, idx) => {
              const key = card.scryfallId || `${card.name}-${idx}`
              return (
                <div key={key} className="card flex flex-col justify-between p-4 gap-4">
                  <button
                    type="button"
                    className="text-left flex flex-col gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    aria-label={`Ver impresiones de ${card.name}`}
                    onClick={() => openPrintings(card)}
                  >
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.name} className="w-full h-48 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-48 bg-brand-soft rounded-xl flex items-center justify-center text-graphite text-caption">
                        Sin imagen
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-heading-sm line-clamp-1">{card.name}</h3>
                      <p className="text-caption text-graphite mt-0.5">{card.setName || card.type || 'Magic'}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="btn-primary w-full !py-2"
                    aria-label={`Elegir impresión de ${card.name}`}
                    onClick={() => openPrintings(card)}
                  >
                    Elegir impresión
                  </button>
                  <div className="flex items-center justify-between gap-3">
                    <label className="label !mb-0" htmlFor={`qty-${key}`}>
                      Cantidad
                    </label>
                    <input
                      id={`qty-${key}`}
                      className="input w-24 !py-1.5"
                      type="number"
                      min="1"
                      step="1"
                      value={quantityOf(key)}
                      onChange={(e) =>
                        setQuantities((q) => ({ ...q, [key]: Math.max(1, Math.floor(Number(e.target.value)) || 1) }))
                      }
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {loadingMore && <SkeletonInline count={3} />}
          {!hasMore && (
            <p className="text-body-sm text-graphite text-center" role="status">
              No hay más cartas
            </p>
          )}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </div>
      )}

      {printingsFor && (
        <MagicPrintingsPanel
          card={printingsFor}
          quantity={Math.max(1, Math.floor(quantityOf(resultKey(printingsFor))) || 1)}
          onSelect={handleChoosePrinting}
          onClose={() => setPrintingsFor(null)}
          busyScryfallId={panelSavingId}
          saveError={panelError}
        />
      )}
    </div>
  )
}
