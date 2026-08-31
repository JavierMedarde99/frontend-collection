export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-on-surface-variant">
      <span className="w-8 h-8 rounded-full border-2 border-digital-blue/20 border-t-digital-blue animate-spin" />
      <span className="text-body-md">{label}</span>
    </div>
  )
}
