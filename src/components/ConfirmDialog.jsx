export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
  busy = false,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
      <div role="dialog" aria-modal="true" className="card w-full max-w-md">
        <h3 className="font-display text-heading-sm mb-2">{title}</h3>
        <p className="text-body text-slate mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
