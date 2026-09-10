import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createDeck } from '../api/deckApi'
import { MANA_COLOR_OPTIONS, type ManaColorCode } from '../constants/decks'

export default function DeckCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [commander, setCommander] = useState('')
  const [commanderColors, setCommanderColors] = useState<ManaColorCode[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleColor(color: ManaColorCode) {
    setCommanderColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
        commander: commander.trim() || undefined,
        commanderColors: commanderColors.length > 0 ? commanderColors : undefined,
      })
      navigate(`/magic/mazos/${created.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el mazo.'
      setError(message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display text-heading-lg mb-2">Nuevo mazo Commander</h1>
        <p className="text-body text-slate">
          Crea un mazo y después añade cartas desde su detalle.
        </p>
      </div>

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
          <Link className="btn-ghost" to="/magic/mazos">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear mazo'}
          </button>
        </div>
      </form>
    </div>
  )
}
