import { useCallback, useEffect, useState, type FormEvent, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDeck, updateDeck, deleteDeck } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'
import type { MagicCardSearchResult } from '../types'
import { MANA_COLORS, type ManaColorCode } from '../constants/decks'

const VALID_COLORS = Object.keys(MANA_COLORS) as ManaColorCode[]

const IDENT_DOT_BG: Record<ManaColorCode, string> = {
  W: '#f5efe0',
  U: '#105f9e',
  B: '#24201d',
  R: '#c33a20',
  G: '#2e7d32',
}

function identityFromCard(result: MagicCardSearchResult): ManaColorCode[] {
  const identity = result.colorIdentity ?? result.colors ?? []
  return identity.filter((c): c is ManaColorCode =>
    (VALID_COLORS as string[]).includes(c),
  )
}
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'
import ErrorBanner from '../components/ErrorBanner'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function DeckEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState('')
  usePageTitle((name ? `Editar ${name}` : 'Editar mazo'))
  const [description, setDescription] = useState('')
  const [commander, setCommander] = useState('')
  const [commanderColors, setCommanderColors] = useState<ManaColorCode[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)
  const deckAccent = {
    '--sc': COLLECTIONS_BY_KEY.decks.accent.spine,
    '--c': COLLECTIONS_BY_KEY.decks.accent.niche,
  } as CSSProperties
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
      // Fallback: algunas cartas (p. ej. planeswalkers) pueden ser
      // comandante si su texto lo indica ("can be your commander").
      if (!result.text || !/can be your commander/i.test(result.text)) {
        setSearchError(`"${result.name}" no se puede añadir como comandante: debe ser una criatura legendaria o indicarlo en su texto.`)
        return
      }
    }
    setSearchError(null)
    setDirty(true)
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
    setDirty(false)
    setError(null)
    try {
      await updateDeck(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        commander: commander.trim() || undefined,
        commanderColors: commanderColors.length > 0 ? commanderColors : undefined,
      })
      navigate(`/magic/mazos/${id}`, { replace: true })
      notify('Cambios guardados.')
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
      <section className="max-w-2xl mx-auto flex flex-col gap-12" style={deckAccent}>
        <Spinner label="Cargando mazo…" />
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="max-w-2xl mx-auto flex flex-col gap-12" style={deckAccent}>
        <EmptyState
          title="No se pudo cargar el mazo"
          message={loadError}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/magic/mazos')}>
              Volver a mazos
            </button>
          }
        />
      </section>
    )
  }

  return (
    <section
      className="max-w-2xl mx-auto flex flex-col gap-12"
      style={deckAccent}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Magic", to: "/magic" }, { label: "Mazos", to: "/magic/mazos" }, { label: name || 'Editar', to: `/magic/mazos/${id}` }, { label: "Editar" }]}
        eyebrow="Mazos"
        title="Editar mazo"
        subtitle="Actualiza los datos del mazo."
        actions={
          <button
            className="btn-ghost !text-red-600 hover:!bg-red-50 hover:!border-red-200 shrink-0"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        }
      >
        {deleteError && (
          <ErrorBanner message={deleteError} />
        )}

        <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="flex flex-col gap-6">
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
              <div className="picked-commander">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-heading-sm text-ink line-clamp-1">{commander}</p>
                  <p className="text-caption text-graphite flex items-center gap-1.5 mt-1">
                    <span>Identidad:</span>
                    {commanderColors.length > 0 ? (
                      commanderColors.map((code) => (
                        <span key={code} className="flex items-center gap-1 capitalize">
                          <span
                            className="ident-dot"
                            style={{ backgroundColor: IDENT_DOT_BG[code] }}
                            aria-hidden="true"
                          />
                          {MANA_COLORS[code]}
                        </span>
                      ))
                    ) : (
                      'Incolora'
                    )}
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
                  <ErrorBanner message={searchError} />
                )}
                {commanderResults.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                    {commanderResults.map((result) => (
                      <div key={result.scryfallId || result.name} className="result-card items-center gap-3">
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

          <div className="form-actions">
            <Link className="btn-ghost" to={`/magic/mazos/${id}`}>
              Cancelar
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </CreateShell>

      <ConfirmDialog
        open={guard.showPrompt}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. ¿Seguro que quieres salir? Se perderán."
        confirmLabel="Salir sin guardar"
        onConfirm={guard.confirmNavigation}
        onCancel={guard.cancelNavigation}
      />

      <ConfirmDialog
        open={deleting}
        title="Eliminar mazo"
        message={`¿Seguro que quieres eliminar "${name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
