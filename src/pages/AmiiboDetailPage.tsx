import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getAmiibo, deleteAmiibo } from '../api/amiibosApi'
import { AmiiboStatus, type Amiibo } from '../types'
import FigureStatusBadge from '../components/FigureStatusBadge'
import { AMIIBO_TYPE_LABELS } from '../constants/figures'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import OwnerLine from '../components/OwnerLine'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import MetaList, { type MetaItem } from '../components/MetaList'
import { COLLECTIONS_BY_KEY } from '../constants/collections'

export default function AmiiboDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/figuras/amiibo')

  const [amiibo, setAmiibo] = useState<Amiibo | null>(null)
  usePageTitle(amiibo?.name || 'Amiibo')
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getAmiibo(id)
      setAmiibo(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el Amiibo.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function confirmDelete() {
    if (!id) return
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await deleteAmiibo(id)
      navigate('/figuras/amiibo', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el Amiibo.'
      setDeleteError(message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <Spinner label="Cargando Amiibo…" />
      </section>
    )
  }

  if (error || !amiibo) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <EmptyState
          title="No se pudo cargar el Amiibo"
          message={error || 'El Amiibo no existe.'}
          action={
            <button className="btn-primary mt-2" onClick={goBack}>
              Volver a la colección
            </button>
          }
        />
      </section>
    )
  }

  const typeLabel = amiibo.amiiboType
    ? AMIIBO_TYPE_LABELS[amiibo.amiiboType]
    : null
  const releaseDates = [
    amiibo.releaseDates?.na ? `EE. UU. ${amiibo.releaseDates.na}` : null,
    amiibo.releaseDates?.eu ? `Europa ${amiibo.releaseDates.eu}` : null,
    amiibo.releaseDates?.jp ? `Japón ${amiibo.releaseDates.jp}` : null,
    amiibo.releaseDates?.au ? `Australia ${amiibo.releaseDates.au}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const details: { label: string; value: string }[] = [
    ...(amiibo.character ? [{ label: 'Personaje', value: amiibo.character }] : []),
    ...(amiibo.amiiboSeries ? [{ label: 'Serie Amiibo', value: amiibo.amiiboSeries }] : []),
    ...(amiibo.gameSeries ? [{ label: 'Serie de juego', value: amiibo.gameSeries }] : []),
    ...(typeLabel ? [{ label: 'Tipo', value: typeLabel }] : []),
    ...(releaseDates ? [{ label: 'Lanzamiento', value: releaseDates }] : []),
    ...(amiibo.compatibleGames?.length
      ? [{ label: 'Juegos compatibles', value: amiibo.compatibleGames.join(', ') }]
      : []),
    ...(amiibo.dateAdded ? [{ label: 'En la colección desde', value: amiibo.dateAdded }] : []),
    ...(amiibo.acquisitionDate ? [{ label: 'Fecha de obtención', value: amiibo.acquisitionDate }] : []),
    // En la lista de deseos el precio no se rellena: no se muestra aunque quede uno guardado.
    ...(amiibo.acquisitionPrice !== undefined && amiibo.acquisitionPrice !== null && amiibo.status !== AmiiboStatus.WISHLIST
      ? [{ label: 'Precio de adquisición', value: `${amiibo.acquisitionPrice} €` }]
      : []),
  ]

  const metaItems: MetaItem[] = [...details]

  const canManage = isAuthenticated && (!amiibo.userOwned?.username || amiibo.userOwned.username === user?.username)

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.amiibos.accent.spine, '--c': COLLECTIONS_BY_KEY.amiibos.accent.niche } as CSSProperties}
    >
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Amiibo', to: '/figuras/amiibo' }, { label: amiibo.name }]} />
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver
        </button>
        {canManage && (
          <div className="flex items-center gap-2">
            <Link className="btn-ghost !px-4 !py-2" to={`/figuras/amiibo/${amiibo.id}/editar`}>
              Editar
            </Link>
            <button
              className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
              onClick={() => setDeleting(true)}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      <article className="card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            {amiibo.imageUrl ? (
              <img
                src={amiibo.imageUrl}
                alt={amiibo.name}
                className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-sm bg-paper"
              />
            ) : (
              <div className="w-full sm:w-48 h-72 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <PageHeader eyebrow="Amiibo" title={amiibo.name} />
            <OwnerLine owner={amiibo.userOwned} />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <FigureStatusBadge status={amiibo.status} />
              {typeLabel && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-brand-soft text-brand">
                  {typeLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {metaItems.length > 0 && (
          <div className="border-t border-silver/60 pt-5">
            <MetaList columns={2} items={metaItems} />
          </div>
        )}

        {amiibo.notes && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Notas personales</h2>
            <p className="text-body text-slate whitespace-pre-line">{amiibo.notes}</p>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={deleting}
        title="Eliminar Amiibo"
        message={`¿Seguro que quieres eliminar "${amiibo.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
