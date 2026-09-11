import { useEffect, useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMagicCard, updateMagicCard, deleteMagicCard } from '../api/magicApi'
import type { MagicCardRequest, MagicCondition, MagicLanguage } from '../types'
import { MAGIC_CONDITIONS, MAGIC_LANGUAGES } from '../constants/magic'
import ConfirmDialog from '../components/ConfirmDialog'
import SkeletonGrid from '../components/Skeleton'
import ErrorBanner from '../components/ErrorBanner'

export default function MagicEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [language, setLanguage] = useState<MagicLanguage>('ENGLISH')
  const [manaCost, setManaCost] = useState('')
  const [type, setType] = useState('')
  const [text, setText] = useState('')
  const [power, setPower] = useState('')
  const [toughness, setToughness] = useState('')
  const [rarity, setRarity] = useState('')
  const [setNameVal, setSetNameVal] = useState('')
  const [artist, setArtist] = useState('')
  const [condition, setCondition] = useState<MagicCondition>('NEAR_MINT')
  const [isFoil, setIsFoil] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [originalCard, setOriginalCard] = useState<MagicCardRequest | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getMagicCard(id)
        setOriginalCard(data)
        setName(data.name || '')
        setLanguage(data.language || 'ENGLISH')
        setManaCost(data.manaCost || '')
        setType(data.type || '')
        setText(data.text || '')
        setPower(data.power || '')
        setToughness(data.toughness || '')
        setRarity(data.rarity || '')
        setSetNameVal(data.setName || '')
        setArtist(data.artist || '')
        setCondition(data.condition || 'NEAR_MINT')
        setIsFoil(!!data.isFoil)
        setQuantity(data.quantity || 1)
        setNotes(data.notes || '')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar la carta.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!id || !originalCard) return
    setSubmitting(true)
    setError(null)
    try {
      await updateMagicCard(id, {
        ...originalCard,
        name,
        language,
        manaCost,
        type,
        text,
        power,
        toughness,
        rarity,
        setName: setNameVal,
        artist,
        condition,
        isFoil,
        quantity,
        notes,
      })
      navigate(`/magic/${id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar la carta.'
      setError(message)
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    try {
      await deleteMagicCard(id)
      navigate('/magic')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la carta.'
      setError(message)
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <SkeletonGrid count={2} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Editar carta Magic</h1>
          <p className="text-body text-slate">Modifica los detalles de tu carta.</p>
        </div>
        <Link className="btn-ghost" to={`/magic/${id}`}>
          Cancelar
        </Link>
      </div>

      {error && (
        <ErrorBanner message={error} />
      )}

      <form onSubmit={handleSubmit} className="card flex flex-col gap-6 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Nombre</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Idioma</label>
            <select
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value as MagicLanguage)}
            >
              {Object.entries(MAGIC_LANGUAGES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Coste de maná</label>
            <input
              className="input"
              value={manaCost}
              onChange={(e) => setManaCost(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Tipo</label>
            <input
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Fuerza</label>
            <input
              className="input"
              value={power}
              onChange={(e) => setPower(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Resistencia</label>
            <input
              className="input"
              value={toughness}
              onChange={(e) => setToughness(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Rareza</label>
            <input
              className="input"
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Set / Edición</label>
            <input
              className="input"
              value={setNameVal}
              onChange={(e) => setSetNameVal(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Artista</label>
            <input
              className="input"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <label className="text-caption font-semibold text-ink">Cantidad</label>
            <input
              type="number"
              min="1"
              className="input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isFoilEdit"
              checked={isFoil}
              onChange={(e) => setIsFoil(e.target.checked)}
              className="w-5 h-5 rounded border-silver text-brand focus:ring-brand"
            />
            <label htmlFor="isFoilEdit" className="text-body font-medium text-ink">¿Es Foil (brillante)? ✨</label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-caption font-semibold text-ink">Texto de la carta</label>
          <textarea
            className="input min-h-[100px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-caption font-semibold text-ink">Notas personales</label>
          <textarea
            className="input min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-silver/60">
          <button
            type="button"
            className="btn-ghost text-red-600 hover:bg-red-50 hover:border-red-200"
            onClick={() => setShowConfirm(true)}
          >
            Eliminar carta
          </button>
          <div className="flex items-center gap-3">
            <Link className="btn-ghost" to={`/magic/${id}`}>
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Eliminar carta"
        message="¿Estás seguro de que deseas eliminar esta carta de tu colección? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  )
}
