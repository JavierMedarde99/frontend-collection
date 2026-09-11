import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDeck, updateDeck, deleteDeck } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'
import type { MagicCardSearchResult } from '../types'
import { MANA_COLORS, type ManaColorCode } from '../constants/decks'

const VALID_COLORS = Object.keys(MANA_COLORS) as ManaColorCode[]

function identityFromCard(result: MagicCardSearchResult): ManaColorCode[] {
  const identity = result.colorIdentity ?? result.colors ?? []
  return identity.filter((c): c is ManaColorCode =>
    (VALID_COLORS as string[]).includes(c),
  )
}
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

export default function DeckEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [commander, setCommander] = useState('')
  const [commanderColors, setCommanderColors] = useState<ManaColorCode[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Búsqueda del comandante en Scryfall
  const [commanderQuery, setCommanderQuery] = useState('')
  const [commanderResults, setCommanderResults] = useState<MagicCardSearchResult[]>([])
  const [searchingCommander, setSearchingCommander] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  function isLegendaryCreature(typeLine?: string): boolean {
    if (!typeLine) return false
    const lower = typeLine.toLowerCase()
    return lower.includes('legendary') && lower.includes('creature')
  }

  function handlePickCommander(result: MagicCardSearchResult) {
    if (!isLegendaryCreature(result.type)) {
      setSearchError(`"${result.name}" no se puede añadir como comandante: debe ser una criatura legendaria.`)
      return
    }
    setSearchError(null)
    setCommander(result.name)
    setCommanderColors(identityFromCard(result))
  }

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

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    try {
      const data = await getDeck(id)
      setName(data.name || '')
      setDescription(data.description || '')
      setCommander(data.commander || '')
      setCommanderColors(
        (data.commanderColors || []).filter((c): c is ManaColorCode =>
          (VALID_COLORS as string[]).includes(c),
        ),
      )
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No se pudo cargar el mazo.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await updateDeck(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        commander: commander.trim() || undefined,
        commanderColors: commanderColors.length > 0 ? commanderColors : undefined,
      })
      navigate(`/magic/mazos/${id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el mazo.')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-2xl mx-auto">
        <Spinner label="Cargando mazo…" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          title="No se pudo cargar el mazo"
          message={loadError}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/magic/mazos')}>
              Volver a mazos
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Editar mazo</h1>
          <p className="text-body text-slate">Actualiza los datos del mazo.</p>
        </div>
        <button
          className="btn-ghost !text-red-600 hover:!bg-red-50 hover:!border-red-200 shrink-0"
          onClick={() => setDeleting(true)}
        >
          Eliminar
        </button>
      </div>

      {deleteError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
          {deleteError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card flex flex-col gap-6 p-6 md:p-8">
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
          <span className="label">Comandante</span>
          {commander ? (
            <div className="flex items-center gap-4 p-3 rounded-xl bg-brand-soft/50 border border-brand/30">
              <div className="min-w-0 flex-1">
                <p className="font-display text-heading-sm text-ink line-clamp-1">{commander}</p>
                <p className="text-caption text-graphite">
                  Identidad: {commanderColors.length > 0 ? commanderColors.join(', ') : 'Incolora'}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5 shrink-0"
                onClick={() => { setCommander(''); setCommanderColors([]) }}
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
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
                  {searchError}
                </div>
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
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-silver/60">
          <Link className="btn-ghost" to={`/magic/mazos/${id}`}>
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={deleting}
        title="Eliminar mazo"
        message={`¿Seguro que quieres eliminar "${name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </div>
  )
}
