import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFunko, updateFunko, deleteFunko } from '../api/funkosApi'
import type { Funko, FunkoFormData } from '../types'
import FunkoForm from '../components/FunkoForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function FunkoEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [funko, setFunko] = useState<Funko | null>(null)
  usePageTitle(funko?.name ? `Editar ${funko.name}` : 'Editar Funko')
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

  async function handleSubmit(payload: FunkoFormData) {
    if (!id) return
    await updateFunko(id, payload)
    notify('Cambios guardados.')
    navigate('/figuras/funkopop', { replace: true })
  }

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

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.funkos.accent.spine, '--c': COLLECTIONS_BY_KEY.funkos.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Funko Pop', to: '/figuras/funkopop' },
          { label: funko?.name || 'Detalle', to: `/figuras/funkopop/${id}` },
          { label: 'Editar' },
        ]}
        eyebrow="Funko Pop"
        title="Editar Funko Pop"
        subtitle="Actualiza los datos de la pieza."
        actions={
          funko && !loading ? (
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
          <Spinner label="Cargando Funko Pop…" />
        ) : error ? (
          <EmptyState
            title="No se pudo cargar el Funko Pop"
            message={error}
            action={
              <button className="btn-primary mt-2" onClick={() => navigate('/figuras/funkopop')}>
                Volver a la colección
              </button>
            }
          />
        ) : (
          <FunkoForm initial={funko ?? undefined} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
        )}
      </CreateShell>

      <ConfirmDialog
        open={deleting}
        title="Eliminar Funko Pop"
        message={`¿Seguro que quieres eliminar "${funko?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
