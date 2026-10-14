import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getFunko, deleteFunko } from '../api/funkosApi'
import type { Funko } from '../types'
import FigureStatusBadge from '../components/FigureStatusBadge'
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

export default function FunkoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/figuras/funkopop')

  const [funko, setFunko] = useState<Funko | null>(null)
  usePageTitle(funko?.name || 'Funko Pop')
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
      const data = await getFunko(id)
      setFunko(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el Funko Pop.'
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
      await deleteFunko(id)
      navigate('/figuras/funkopop', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el Funko Pop.'
      setDeleteError(message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <Spinner label="Cargando Funko…" />
      </section>
    )
  }

  if (error || !funko) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <EmptyState
          title="No se pudo cargar el Funko"
          message={error || 'El Funko no existe.'}
          action={
            <button className="btn-primary mt-2" onClick={goBack}>
              Volver a la colección
            </button>
          }
        />
      </section>
    )
  }

  const details: { label: string; value: string }[] = [
    ...(funko.series ? [{ label: 'Serie', value: funko.series }] : []),
    ...(funko.number ? [{ label: 'Número', value: funko.number }] : []),
    ...(funko.category ? [{ label: 'Categoría', value: funko.category }] : []),
    ...(funko.franchise ? [{ label: 'Franquicia', value: funko.franchise }] : []),
    ...(funko.popType ? [{ label: 'Tipo', value: funko.popType }] : []),
    ...(funko.exclusive ? [{ label: 'Exclusivo', value: funko.exclusive }] : []),
    ...(funko.vaulted !== undefined ? [{ label: 'Vaulted', value: funko.vaulted ? 'Sí' : 'No' }] : []),
    ...(funko.releaseYear !== undefined ? [{ label: 'Año', value: `${funko.releaseYear}` }] : []),
    ...(funko.rarityScore !== undefined && funko.rarityScore !== null
      ? [{ label: 'Rareza', value: `${funko.rarityScore}` }]
      : []),
    ...(funko.dateAdded ? [{ label: 'En la colección desde', value: funko.dateAdded }] : []),
    ...(funko.acquisitionDate ? [{ label: 'Fecha de obtención', value: funko.acquisitionDate }] : []),
    ...(funko.acquisitionPrice !== undefined && funko.acquisitionPrice !== null
      ? [{ label: 'Precio de adquisición', value: `${funko.acquisitionPrice} €` }]
      : []),
  ]

  const metaItems: MetaItem[] = [...details]

  const canManage = isAuthenticated && (!funko.userOwned?.username || funko.userOwned.username === user?.username)

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.funkos.accent.spine, '--c': COLLECTIONS_BY_KEY.funkos.accent.niche } as CSSProperties}
    >
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Funko Pop', to: '/figuras/funkopop' }, { label: funko.name }]} />
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver
        </button>
        {canManage && (
          <div className="flex items-center gap-2">
            <Link className="btn-ghost !px-4 !py-2" to={`/figuras/funkopop/${funko.id}/editar`}>
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
            {funko.imageUrl ? (
              <img
                src={funko.imageUrl}
                alt={funko.name}
                className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-sm bg-paper"
              />
            ) : (
              <div className="w-full sm:w-48 h-72 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <PageHeader eyebrow="Funko Pop" title={funko.name} />
            <OwnerLine owner={funko.userOwned} />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <FigureStatusBadge status={funko.status} />
              {funko.rarityScore !== undefined && funko.rarityScore !== null && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-brand-soft text-brand">
                  Rareza {funko.rarityScore}
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

        {funko.notes && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Notas personales</h2>
            <p className="text-body text-slate whitespace-pre-line">{funko.notes}</p>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={deleting}
        title="Eliminar Funko Pop"
        message={`¿Seguro que quieres eliminar "${funko.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
