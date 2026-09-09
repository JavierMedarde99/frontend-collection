import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMagicCards, createMagicCard } from '../api/magicApi'
import type { MagicCardSearchResult, MagicCondition } from '../types'
import { MAGIC_CONDITIONS } from '../constants/magic'

export default function MagicCreatePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MagicCardSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Modal / Form state for selected card
  const [selectedCard, setSelectedCard] = useState<MagicCardSearchResult | null>(null)
  const [condition, setCondition] = useState<MagicCondition>('NEAR_MINT')
  const [isFoil, setIsFoil] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError(null)
    try {
      const data = await searchMagicCards(query.trim())
      setResults(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al buscar cartas.'
      setSearchError(message)
    } finally {
      setSearching(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!selectedCard) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createMagicCard({
        name: selectedCard.name,
        manaCost: selectedCard.manaCost,
        type: selectedCard.type,
        text: selectedCard.text,
        power: selectedCard.power,
        toughness: selectedCard.toughness,
        loyalty: selectedCard.loyalty,
        colors: selectedCard.colors,
        colorIdentity: selectedCard.colorIdentity,
        keywords: selectedCard.keywords,
        rarity: selectedCard.rarity,
        setCode: selectedCard.setCode,
        setName: selectedCard.setName,
        artist: selectedCard.artist,
        frame: selectedCard.frame,
        borderColor: selectedCard.borderColor,
        layout: selectedCard.layout,
        legalities: selectedCard.legalities,
        priceUsd: selectedCard.priceUsd,
        priceEur: selectedCard.priceEur,
        imageUrl: selectedCard.imageUrl,
        imageLargeUrl: selectedCard.imageLargeUrl,
        condition,
        isFoil,
        quantity,
        notes,
      })
      navigate('/magic')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la carta.'
      setSubmitError(message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display text-heading-lg mb-2">Añadir carta Magic</h1>
        <p className="text-body text-slate">
          Busca una carta en el catálogo de Scryfall para añadirla a tu colección.
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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
          {searchError}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-heading-sm">Resultados de búsqueda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((card, idx) => (
              <div key={card.scryfallId || idx} className="card flex flex-col justify-between p-4 gap-4">
                <div className="flex flex-col gap-3">
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
                </div>
                <button
                  type="button"
                  className="btn-primary w-full !py-2"
                  onClick={() => setSelectedCard(card)}
                >
                  Seleccionar y añadir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-heading-md">Añadir detalles: {selectedCard.name}</h2>
              <button
                type="button"
                className="btn-ghost !p-2"
                onClick={() => setSelectedCard(null)}
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-caption">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-semibold text-ink">Condición</label>
                <select
                  className="input"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as MagicCondition)}
                >
                  {Object.entries(MAGIC_CONDITIONS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFoil"
                  checked={isFoil}
                  onChange={(e) => setIsFoil(e.target.checked)}
                  className="w-5 h-5 rounded border-silver text-brand focus:ring-brand"
                />
                <label htmlFor="isFoil" className="text-body font-medium text-ink">¿Es Foil (brillante)? ✨</label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-semibold text-ink">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-semibold text-ink">Notas personales</label>
                <textarea
                  className="input min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Comprada en tienda local, firmada por artista…"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-silver/60">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setSelectedCard(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando…' : 'Guardar en colección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
