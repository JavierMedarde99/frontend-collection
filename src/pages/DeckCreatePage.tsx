import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createDeck } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'
import type { MagicCardSearchResult } from '../types'
import { MANA_COLORS, type ManaColorCode } from '../constants/decks'
import ErrorBanner from '../components/ErrorBanner'
import ConfirmDialog from '../components/ConfirmDialog'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'
import Breadcrumbs from '../components/Breadcrumbs'
import { useToast } from '../components/Toast'

const VALID_COLORS = Object.keys(MANA_COLORS) as ManaColorCode[]

function identityFromCard(result: MagicCardSearchResult): ManaColorCode[] {
  const identity = result.colorIdentity ?? result.colors ?? []
  return identity.filter((c): c is ManaColorCode =>
    (VALID_COLORS as string[]).includes(c),
  )
}

export default function DeckCreatePage() {
  const navigate = useNavigate()
  const notify = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [commander, setCommander] = useState<MagicCardSearchResult | null>(null)
  const [commanderColors, setCommanderColors] = useState<ManaColorCode[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)
  const [error, setError] = useState<string | null>(null)

  // Búsqueda del comandante en Scryfall
  const [commanderQuery, setCommanderQuery] = useState('')
  const [commanderResults, setCommanderResults] = useState<MagicCardSearchResult[]>([])
  const [searchingCommander, setSearchingCommander] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const canCreate = name.trim() !== '' && commander !== null && !submitting

  async function handleCommanderSearch(e: FormEvent) {
    e.preventDefault()
    if (!commanderQuery.trim()) return
    setSearchingCommander(true)
    setSearchError(null)
    try {
      setCommanderResults(await searchMagicCards(commanderQuery.trim()))
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error al buscar el comandante.')
    } finally {
      setSearchingCommander(false)
    }
  }

  function isLegendaryCreature(typeLine?: string): boolean {
    if (!typeLine) return false
    const lower = typeLine.toLowerCase()
    return lower.includes('legendary') && lower.includes('creature')
  }

  function handlePickCommander(result: MagicCardSearchResult) {
    if (!isLegendaryCreature(result.type)) {
      // Fallback: algunas cartas (p. ej. planeswalkers) pueden ser
      // comandante si su texto lo indica ("can be your commander").
      if (!result.text || !/can be your commander/i.test(result.text)) {
        setSearchError(`"${result.name}" no se puede añadir como comandante: debe ser una criatura legendaria o indicarlo en su texto.`)
        return
      }
    }
    setSearchError(null)
    setDirty(true)
    setCommander(result)
    setCommanderColors(identityFromCard(result))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !commander) {
      setError('El nombre y el comandante son obligatorios.')
      return
    }
    setSubmitting(true)
    setDirty(false)
    setError(null)
    try {
      const created = await createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        commander: commander.name,
        commanderColors: commanderColors.length > 0 ? commanderColors : undefined,
      })
      navigate(`/magic/mazos/${created.id}`)
      notify('Mazo creado.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el mazo.'
      setError(message)
      setDirty(true)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Magic", to: "/magic" }, { label: "Mazos", to: "/magic/mazos" }, { label: "Añadir" }]} />
      <div>
        <h1 className="font-display text-heading-lg mb-2">Nuevo mazo Commander</h1>
        <p className="text-body text-slate">
          Ponle nombre al mazo, busca su comandante y créalo.
        </p>
      </div>

      <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="card flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1.5">
          <label className="label" htmlFor="deck-name">
            Nombre <span className="text-brand">*</span>
          </label>
          <input
            id="deck-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del mazo"
            required
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="label">
            Comandante <span className="text-brand">*</span>
          </span>
          {commander ? (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-brand-soft/50 border border-brand/30">
              {commander.imageUrl && (
                <img
                  src={commander.imageUrl}
                  alt={commander.name}
                  className="w-12 h-[68px] object-cover rounded-lg shadow-sm shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-heading-sm text-ink line-clamp-1">{commander.name}</p>
                <p className="text-caption text-graphite">
                  Identidad: {commanderColors.length > 0 ? commanderColors.join(', ') : 'Incolora'}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5 shrink-0"
                onClick={() => { setCommander(null); setCommanderColors([]) }}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <input
                  className="input flex-1"
                  value={commanderQuery}
                  onChange={(e) => setCommanderQuery(e.target.value)}
                  placeholder="Buscar comandante en Scryfall…"
                  aria-label="Buscar comandante"
                />
                <button
                  type="button"
                  className="btn-primary shrink-0"
                  onClick={handleCommanderSearch}
                  disabled={searchingCommander}
                >
                  {searchingCommander ? 'Buscando…' : 'Buscar'}
                </button>
              </div>
              {searchError && (
                <ErrorBanner message={searchError} />
              )}
              {commanderResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {commanderResults.map((result) => (
                    <div key={result.scryfallId || result.name} className="card p-3 flex items-center gap-3">
                      {result.imageUrl && (
                        <img
                          src={result.imageUrl}
                          alt={result.name}
                          className="w-10 h-14 object-cover rounded shrink-0"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-heading-sm line-clamp-1">{result.name}</span>
                        <span className="block text-caption text-graphite">{result.setName || result.type}</span>
                      </span>
                      <button
                        type="button"
                        className="btn-primary !px-3 !py-1.5 shrink-0"
                        onClick={() => handlePickCommander(result)}
                      >
                        Añadir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="label" htmlFor="deck-description">
            Descripción
          </label>
          <textarea
            id="deck-description"
            className="input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del mazo…"
          />
        </div>

        {error && (
          <ErrorBanner message={error} />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-silver/60">
          <Link className="btn-ghost" to="/magic/mazos">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={!canCreate}>
            {submitting ? 'Creando…' : 'Crear mazo'}
          </button>
        </div>

      <ConfirmDialog
        open={guard.showPrompt}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. ¿Seguro que quieres salir? Se perderán."
        confirmLabel="Salir sin guardar"
        onConfirm={guard.confirmNavigation}
        onCancel={guard.cancelNavigation}
      />
      </form>
    </div>
  )
}
