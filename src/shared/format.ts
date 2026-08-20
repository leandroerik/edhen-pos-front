export const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const formatPorcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

export function toInputDate(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Convierte un string "YYYY-MM-DD" a las 00:00:00 de esa fecha
 * en la timezone local (evita que UTC-3 genere el día anterior).
 */
export function inicioDelDiaLocal(fechaStr: string): string {
  const [y, m, d] = fechaStr.split('-').map(Number)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00`
}

/**
 * Convierte un string "YYYY-MM-DD" a las 23:59:59 de esa fecha
 * en la timezone local (para filtros "hasta").
 */
export function finDelDiaLocal(fechaStr: string): string {
  const [y, m, d] = fechaStr.split('-').map(Number)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T23:59:59`
}
