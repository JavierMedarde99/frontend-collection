import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDeck, updateDeck, deleteDeck } from '../api/deckApi'
import { MANA_COLOR_OPTIONS, type ManaColorCode } from '../constants/decks'
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
          MANA_COLOR_OPTIONS.some((o) => o.value === c),
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

  function toggleColor(color: ManaColorCode) {
    setCommanderColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    )
  }

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

        <div className="flex flex-col gap-1.5">
          <label className="label" htmlFor="deck-commander">
            Comandante
          </label>
          <input
            id="deck-commander"
            className="input"
            value={commander}
            onChange={(e) => setCommander(e.target.value)}
            placeholder="Nombre del comandante"
          />
        </div>

        <fieldset>
          <legend className="label">Colores del comandante</legend>
          <div className="flex flex-wrap gap-2">
            {MANA_COLOR_OPTIONS.map((color) => {
              const active = commanderColors.includes(color.value)
              return (
                <button
                  key={color.value}
                  type="button"
                  aria-pressed={active}
                  title={color.label}
                  onClick={() => toggleColor(color.value)}
                  className={`w-10 h-10 rounded-full font-bold text-body transition-all duration-200 ${
                    active
                      ? 'bg-brand text-white shadow-brand-glow'
                      : 'bg-brand-soft text-brand hover:bg-brand hover:text-white'
                  }`}
                >
                  {color.value}
                </button>
              )
            })}
          </div>
        </fieldset>

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
