import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAmiibo, updateAmiibo, deleteAmiibo } from '../api/amiibosApi'
import type { Amiibo, AmiiboFormData } from '../types'
import AmiiboForm from '../components/AmiiboForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function AmiiboEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [amiibo, setAmiibo] = useState<Amiibo | null>(null)
  usePageTitle(amiibo?.name ? `Editar ${amiibo.name}` : 'Editar Amiibo')
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

  async function handleSubmit(payload: AmiiboFormData) {
    if (!id) return
    await updateAmiibo(id, payload)
    notify('Cambios guardados.')
    navigate('/figuras/amiibo', { replace: true })
  }

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

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.amiibos.accent.spine, '--c': COLLECTIONS_BY_KEY.amiibos.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Amiibo', to: '/figuras/amiibo' },
          { label: amiibo?.name || 'Detalle', to: `/figuras/amiibo/${id}` },
          { label: 'Editar' },
        ]}
        eyebrow="Amiibo"
        title="Editar Amiibo"
        subtitle="Actualiza los datos de la pieza."
        actions={
          amiibo && !loading ? (
            <button
              className="btn-ghost !text-red-600 hover:!bg-red-50 hover:!border-red-200"
              onClick={() => setDeleting(true)}
            >
              Eliminar
            </button>
          ) : undefined
        }
      >
        {deleteError && <ErrorBanner message={deleteError} />}

        {loading ? (
          <Spinner label="Cargando Amiibo…" />
        ) : error ? (
          <EmptyState
            title="No se pudo cargar el Amiibo"
            message={error}
            action={
              <button className="btn-primary mt-2" onClick={() => navigate('/figuras/amiibo')}>
                Volver a la colección
              </button>
            }
          />
        ) : (
          <AmiiboForm initial={amiibo ?? undefined} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
        )}
      </CreateShell>

      <ConfirmDialog
        open={deleting}
        title="Eliminar Amiibo"
        message={`¿Seguro que quieres eliminar "${amiibo?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
