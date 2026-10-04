import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getMagicCard, deleteMagicCard } from '../api/magicApi'
import type { MagicCardResponse } from '../types'
import { MAGIC_CONDITIONS } from '../constants/magic'
import ConfirmDialog from '../components/ConfirmDialog'
import SkeletonGrid from '../components/Skeleton'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import OwnerLine from '../components/OwnerLine'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import MetaList from '../components/MetaList'
import { COLLECTIONS_BY_KEY } from '../constants/collections'

export default function MagicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/magic')
  const [card, setCard] = useState<MagicCardResponse | null>(null)
  usePageTitle(card?.name || 'Magic')
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMagicCard(id)
      setCard(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar la carta.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

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
      <div className="max-w-4xl mx-auto">
        <SkeletonGrid count={2} />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 flex flex-col items-center gap-4">
        <ErrorBanner message={error || 'Carta no encontrada'} />
        <Link className="btn-primary" to="/magic">
          Volver al listado
        </Link>
      </div>
    )
  }

  const imgSrc = card.imageLargeUrl || card.imageUrl
  const isCreature = /\bCreature\b/i.test(card.type || '')

  const infoItems: { label: string; value: string }[] = [
    ...(card.type ? [{ label: 'Tipo', value: card.type }] : []),
    ...(card.setName
      ? [{ label: 'Set / Edición', value: `${card.setName}${card.setCode ? ` (${card.setCode})` : ''}` }]
      : []),
    ...(card.artist ? [{ label: 'Artista', value: card.artist }] : []),
    ...(isCreature && (card.power !== undefined || card.toughness !== undefined)
      ? [{ label: 'Fuerza / Resistencia', value: `${card.power || '0'} / ${card.toughness || '0'}` }]
      : []),
    ...(card.priceUsd || card.priceEur
      ? [
          {
            label: 'Precio estimado',
            value: `${card.priceUsd ? `$${card.priceUsd} USD` : ''}${card.priceUsd && card.priceEur ? ' ' : ''}${card.priceEur ? `€${card.priceEur} EUR` : ''}`,
          },
        ]
      : []),
  ]

  return (
    <section
      className="max-w-5xl mx-auto flex flex-col gap-10"
      style={{ '--sc': COLLECTIONS_BY_KEY.magic.accent.spine, '--c': COLLECTIONS_BY_KEY.magic.accent.niche } as CSSProperties}
    >
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Magic", to: "/magic" }, { label: card?.name || 'Detalle' }]} />
      <div className="flex items-center justify-between">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver al listado
        </button>
        {isAuthenticated && (!card.userOwned?.username || card.userOwned.username === user?.username) && (
        <div className="flex items-center gap-3">
          <button
            className="btn-ghost text-red-600 hover:bg-red-50 hover:border-red-200"
            onClick={() => setShowConfirm(true)}
          >
            Eliminar
          </button>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-10 items-start">
        <div className="cover-frame shrink-0">
          {imgSrc ? (
            <img src={imgSrc} alt={card.name} className="w-full h-auto object-contain" />
          ) : (
            <div className="w-full aspect-[5/7] rounded-[4px_10px_10px_4px] bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <PageHeader eyebrow="Magic" title={card.name} />
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {card.rarity && (
                <span className="px-3 py-1 rounded-full text-caption font-semibold bg-brand-soft text-brand uppercase">
                  {card.rarity}
                </span>
              )}
              {card.isFoil && (
                <span className="px-3 py-1 rounded-full text-caption font-semibold bg-amber-100 text-amber-800">
                  Foil ✨
                </span>
              )}
              {card.condition && (
                <span className="px-3 py-1 rounded-full text-caption font-semibold bg-slate-100 text-slate-700">
                  Condición: {MAGIC_CONDITIONS[card.condition] || card.condition}
                </span>
              )}
              {card.quantity !== undefined && card.quantity > 0 && (
                <span className="px-3 py-1 rounded-full text-caption font-semibold bg-emerald-100 text-emerald-800">
                  Cantidad: x{card.quantity}
                </span>
              )}
            </div>
            <OwnerLine owner={card.userOwned} />
            {card.manaCost && (
              <p className="text-body-lg font-mono text-graphite mt-1">Coste de maná: {card.manaCost}</p>
            )}
          </div>

          {infoItems.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface border border-silver/60">
              <MetaList columns={2} items={infoItems} />
            </div>
          )}

          {card.text && (
            <div className="p-5 rounded-2xl bg-paper border border-silver/60">
              <span className="text-caption text-stone block mb-1">Texto de la carta</span>
              <p className="text-body text-slate whitespace-pre-line font-serif italic">{card.text}</p>
            </div>
          )}

          {card.notes && (
            <div className="p-5 rounded-2xl bg-paper border border-silver/60">
              <span className="text-caption text-stone block mb-1">Notas personales</span>
              <p className="text-body text-slate">{card.notes}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar carta"
        message={`¿Estás seguro de que deseas eliminar "${card.name}" de tu colección? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        busy={deleting}
      />
    </section>
  )
}
