export default function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center text-center gap-3 py-16">
      <h3 className="text-h3-card">{title}</h3>
      {message && <p className="text-body text-slate-gray max-w-md">{message}</p>}
      {action}
    </div>
  )
}
