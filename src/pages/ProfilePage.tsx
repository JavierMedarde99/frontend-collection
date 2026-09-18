import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileView from '../components/ProfileView'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'

/** Mi perfil: misma vista que el perfil público, con edición y borrado. */
export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!user) return <Navigate to="/login" replace />

  function openEditor() {
    setDisplayName(user.displayName || '')
    setBio(user.bio || '')
    setAvatarUrl(user.avatarUrl || '')
    setSaveError(null)
    setEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      })
      setEditing(false)
      setVersion((v) => v + 1)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await deleteAccount()
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo borrar la cuenta.')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn-ghost !px-4 !py-2"
          onClick={() => (editing ? setEditing(false) : openEditor())}
        >
          {editing ? 'Cancelar edición' : 'Editar perfil'}
        </button>
        <button
          type="button"
          className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
          onClick={() => setConfirmingDelete(true)}
        >
          Borrar cuenta
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="card p-6 md:p-8 flex flex-col gap-4">
          <h2 className="font-display text-heading">Editar perfil</h2>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="profile-display">
              Nombre a mostrar
            </label>
            <input
              id="profile-display"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              maxLength={100}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="profile-bio">
              Bio
            </label>
            <textarea
              id="profile-bio"
              className="input !h-auto !min-h-[80px] !py-3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos algo…"
              maxLength={500}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="profile-avatar">
              URL del avatar
            </label>
            <input
              id="profile-avatar"
              className="input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              maxLength={500}
            />
          </div>
          {saveError && <ErrorBanner message={saveError} />}
          <div className="flex justify-end">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {deleteError && <ErrorBanner message={deleteError} />}

      <ProfileView key={version} username={user.username} />

      <ConfirmDialog
        open={confirmingDelete}
        title="Borrar cuenta"
        message={`¿Seguro que quieres borrar tu cuenta? Se eliminarán tu perfil y todos tus elementos. Esta acción no se puede deshacer.`}
        confirmLabel="Borrar cuenta"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
        busy={deleteBusy}
      />
    </div>
  )
}
