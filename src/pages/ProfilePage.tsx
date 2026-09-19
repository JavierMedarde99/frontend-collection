import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileView from '../components/ProfileView'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import ImageUpload from '../components/ImageUpload'

/** Mi perfil: misma vista que el perfil público, con edición y borrado. */
export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [steamId, setSteamId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) setEditing(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, saving])

  if (!user) return <Navigate to="/login" replace />

  function openEditor() {
    setDisplayName(user.displayName || '')
    setBio(user.bio || '')
    setAvatarUrl(user.avatarUrl || '')
    setSteamId(user.steamId || '')
    setSaveError(null)
    setEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaveError(null)
    const sid = steamId.trim()
    if (sid && !/^\d{17}$/.test(sid)) {
      setSaveError('El Steam ID debe tener 17 dígitos.')
      return
    }
    setSaving(true)
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        steamId: sid || undefined,
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
          onClick={openEditor}
        >
          Editar perfil
        </button>
        <button
          type="button"
          className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
          onClick={() => setConfirmingDelete(true)}
        >
          Borrar cuenta
        </button>
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      <ProfileView key={version} username={user.username} />

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
          onClick={() => {
            if (!saving) setEditing(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Editar perfil"
            className="modal w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-heading-sm">Editar perfil</h3>
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5"
                onClick={() => setEditing(false)}
                disabled={saving}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
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
              <ImageUpload
                label="Foto de avatar"
                value={avatarUrl}
                onChange={setAvatarUrl}
              />
              <div className="flex flex-col gap-1.5">
                <label className="label" htmlFor="profile-steam">
                  Steam ID
                </label>
                <input
                  id="profile-steam"
                  className="input"
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  placeholder="17 dígitos, opcional"
                  inputMode="numeric"
                  maxLength={17}
                />
              </div>
              {saveError && <ErrorBanner message={saveError} />}
              <div className="flex justify-end gap-3 border-t border-silver/60 pt-4">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
