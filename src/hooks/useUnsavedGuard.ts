import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

interface UnsavedGuard {
  showPrompt: boolean
  confirmNavigation: () => void
  cancelNavigation: () => void
}

/**
 * Avisa al navegar con cambios sin guardar (enlaces, atrás del
 * navegador y cierre de pestaña). Llamar con dirty=false tras guardar.
 */
export function useUnsavedGuard(dirty: boolean): UnsavedGuard {
  const blocker = useBlocker(dirty)

  useEffect(() => {
    if (!dirty) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  return {
    showPrompt: blocker.state === 'blocked',
    confirmNavigation: () => {
      if (blocker.state === 'blocked') blocker.proceed()
    },
    cancelNavigation: () => {
      if (blocker.state === 'blocked') blocker.reset()
    },
  }
}
