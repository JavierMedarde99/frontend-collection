export default function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center text-center gap-3 py-16">
      <h3 className="text-headline-md">{title}</h3>
      {message && <p className="text-body-md text-on-surface-variant max-w-md">{message}</p>}
      {action}
    </div>
  )
}
