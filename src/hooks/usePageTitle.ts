import { useEffect } from 'react'

/** Fija document.title como "[Page] — Collection" y lo restaura al salir. */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} — Collection`
    return () => {
      document.title = previous
    }
  }, [title])
}
