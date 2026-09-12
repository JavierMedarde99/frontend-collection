import { useContext, useEffect } from 'react'
import { useBlocker, UNSAFE_DataRouterContext as DataRouterContext } from 'react-router-dom'

interface UnsavedGuard {
  showPrompt: boolean
  confirmNavigation: () => void
  cancelNavigation: () => void
}

const idle: UnsavedGuard = {
  showPrompt: false,
  confirmNavigation: () => {},
  cancelNavigation: () => {},
}

/**
 * Avisa al navegar con cambios sin guardar (enlaces, atrás del
 * navegador y cierre de pestaña). Llamar con dirty=false tras guardar.
 *
 * Nota: useBlocker exige un data router. La app usa createBrowserRouter;
 * fuera de él (p. ej. tests) solo se cubre el cierre de pestaña.
 * La llamada condicional es estable porque cada árbol o siempre tiene
 * router o nunca lo tiene.
 */
export function useUnsavedGuard(dirty: boolean): UnsavedGuard {
  const inDataRouter = useContext(DataRouterContext) != null
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const blocker = inDataRouter ? useBlocker(dirty) : null

  useEffect(() => {
    if (!dirty) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  if (!blocker) return idle
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
