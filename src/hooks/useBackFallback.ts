import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Vuelve atrás en el historial si hay de dónde venir;
 * si se entró por URL directa, va a la lista indicada.
 */
export function useBackFallback(listPath: string): () => void {
  const navigate = useNavigate()
  return useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(listPath, { replace: true })
    }
  }, [navigate, listPath])
}
