export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate">
      <span className="w-9 h-9 rounded-full border-[3px] border-silver border-t-ink animate-spin" role="status" />
      <span className="text-body" role="status" aria-live="polite">{label}</span>
    </div>
  )
}