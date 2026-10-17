interface ErrorBannerProps {
  message: string
  /** Clases extra (p. ej. márgenes) sin perder las base. */
  className?: string
}

/** Banner de error canónico de la app: role="alert" + soporte dark mode. */
export default function ErrorBanner({ message, className = '' }: ErrorBannerProps) {
  if (!message) return null
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 ${className}`}
      role="alert"
    >
      {message}
    </div>
  )
}
