interface FieldErrorProps {
  /** id del mensaje; debe coincidir con el aria-describedby del input. */
  id: string
  message?: string
}

/**
 * Mensaje de error de un campo concreto. No lleva role="alert" (evita el
 * doble anuncio con aria-describedby); el foco al campo inválido se encarga
 * de que el lector de pantalla lo lea.
 */
export default function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null
  return (
    <p id={id} className="text-body-sm text-red-700 dark:text-red-300 mt-1">
      {message}
    </p>
  )
}
