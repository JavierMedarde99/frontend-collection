export default function EmptyState({ title, message, action }) {
  return (
    <div className="card flex flex-col items-center text-center gap-4 py-16 px-8">
      <div className="w-14 h-14 rounded-2xl bg-paper border border-silver/60 flex items-center justify-center">
        <svg
          aria-hidden="true"
          className="w-7 h-7 text-stone"
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
        </svg>
      </div>
      <div>
        <h3 className="font-display text-heading mb-1">{title}</h3>
        {message && <p className="text-body text-slate max-w-md mx-auto">{message}</p>}
      </div>
      {action}
    </div>
  )
}