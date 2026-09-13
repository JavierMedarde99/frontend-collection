import { useId, useRef, useState } from 'react'
import { uploadImage, deleteImage, validateImageFile, uploadedFilename } from '../api/imagesApi'

interface ImageUploadProps {
  label: string
  /** URL actual de la imagen ('' = sin imagen). */
  value: string
  onChange: (url: string) => void
  /** Se llama al subir o quitar, para marcar el formulario como modificado. */
  onTouched?: () => void
  help?: string
}

/**
 * Subida de foto con vista previa: selecciona un archivo, lo sube a
 * POST /api/v1/images/upload y devuelve la URL pública vía onChange.
 * Al sustituir o quitar una imagen subida por nosotros, intenta borrarla.
 */
export default function ImageUpload({ label, value, onChange, onTouched, help }: ImageUploadProps) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function forget(url: string) {
    const filename = uploadedFilename(url)
    if (!filename) return
    try {
      await deleteImage(filename)
    } catch {
      /* la huérfana no bloquea al usuario */
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    const invalid = validateImageFile(file)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    setUploading(true)
    try {
      const uploaded = await uploadImage(file)
      if (value) await forget(value)
      onChange(uploaded.url)
      onTouched?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemove() {
    if (value) await forget(value)
    onChange('')
    onTouched?.()
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="label !mb-0">{label}</span>
      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt={`Vista previa de ${label}`}
            className="w-20 h-28 object-cover rounded-xl border border-silver/60 shadow-sm bg-paper shrink-0"
          />
        ) : (
          <div className="w-20 h-28 rounded-xl shrink-0 bg-brand-soft/50 border border-dashed border-stone/60 flex items-center justify-center text-caption text-graphite text-center px-1">
            Sin imagen
          </div>
        )}
        <div className="flex flex-col gap-2 min-w-0">
          <input
            id={inputId}
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            aria-label={label}
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              aria-disabled={uploading}
              className={`btn-ghost !px-3 !py-1.5 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {uploading ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
            </label>
            {value && !uploading && (
              <button type="button" className="btn-ghost !px-3 !py-1.5 !text-red-600 hover:!bg-red-50" onClick={handleRemove}>
                Quitar
              </button>
            )}
          </div>
          <p className="text-caption text-graphite">{help || 'JPEG, PNG, WebP o GIF de hasta 5 MB.'}</p>
        </div>
      </div>
      {error && (
        <p className="text-caption text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
