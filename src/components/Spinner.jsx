export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-slate-gray">
      <span className="w-8 h-8 rounded-full border-2 border-signal-orange/20 border-t-signal-orange animate-spin" />
      <span className="text-body">{label}</span>
    </div>
  )
}
