export default function EmptyState({ title, message, action }) {
  return (
    <div className="card animate-fade-in flex flex-col items-center text-center gap-5 py-16 px-8 bg-gradient-to-b from-white to-brand-soft/50">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-brand-glow">
        <svg
          aria-hidden="true"
          className="w-10 h-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
          <path
            strokeLinecap="round"
            strokeWidth={1.8}
            d="M12 8.75v.01M12 12v.01M12 15.25v.01"
          />
        </svg>
      </div>
      <div>
        <h3 className="font-display text-heading text-ink mb-1.5">{title}</h3>
        {message && <p className="text-body text-slate max-w-md mx-auto">{message}</p>}
      </div>
      {action}
    </div>
  )
}