import { createContext, useContext } from 'react'

export interface ItemColaEtiqueta {
  // `variante-{id}` o `producto-{id}` — determina, junto al resto de los
  // campos, que agregar la misma etiqueta dos veces sume cantidad en vez
  // de duplicar la fila.
  id: string
  nombreProducto: string
  // Sin detalle = etiqueta genérica de producto. Con detalle ("Negro /
  // M") = etiqueta de una variante puntual.
  detalle?: string
  codigoBarras: string
}

export interface ItemConCantidad extends ItemColaEtiqueta {
  cantidad: number
}

export interface ColaEtiquetasContextValue {
  items: ItemConCantidad[]
  agregar: (item: ItemColaEtiqueta) => void
  quitar: (id: string) => void
  cambiarCantidad: (id: string, cantidad: number) => void
  vaciar: () => void
  totalEtiquetas: number
}

export const ColaEtiquetasContext = createContext<ColaEtiquetasContextValue | null>(null)

export function useColaEtiquetas(): ColaEtiquetasContextValue {
  const ctx = useContext(ColaEtiquetasContext)
  if (!ctx) throw new Error('useColaEtiquetas debe usarse dentro de <ColaEtiquetasProvider>')
  return ctx
}
