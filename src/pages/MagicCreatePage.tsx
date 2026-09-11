import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMagicCards, addMagicCardFromScryfall } from '../api/magicApi'
import type { MagicCardSearchResult } from '../types'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'

export default function MagicCreatePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MagicCardSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

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

  async function handleAdd(card: MagicCardSearchResult) {
    const key = card.scryfallId || card.name
    setSavingId(key)
    setSaveError(null)
    try {
      await addMagicCardFromScryfall(card.scryfallId)
      navigate('/magic')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la carta.'
      setSaveError(message)
      setSavingId(null)
    }
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

      {saveError && (
        <ErrorBanner message={saveError} />
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-heading-sm">Resultados de búsqueda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((card, idx) => {
              const key = card.scryfallId || `${card.name}-${idx}`
              const saving = savingId === key
              return (
                <div key={key} className="card flex flex-col justify-between p-4 gap-4">
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
                    onClick={() => handleAdd(card)}
                    disabled={savingId !== null}
                  >
                    {saving ? 'Guardando…' : 'Añadir a mi colección'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
