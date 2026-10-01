/**
 * Utilidades de fecha compartidas por los formularios de las colecciones.
 */

/** Fecha de hoy en formato ISO corto (YYYY-MM-DD), el que espera `<input type="date">`. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Valida una fecha de seguimiento (adquirido, empezar, terminado, última jugada).
 * Estas fechas son obligatorias: si el usuario afirma que ya tiene el libro o que
 * lo terminó, la fecha es parte de la afirmación y no puede quedar vacía.
 *
 * Devuelve el mensaje de error, o `null` si la fecha está puesta.
 *
 * @param label La fecha tal como aparece en el formulario, con su artículo
 *   ("La fecha de obtención"), para que el mensaje encaje con la interfaz.
 */
export function missingRequiredDate(value: string | undefined, label: string): string | null {
  return value ? null : `${label} es obligatoria.`
}
