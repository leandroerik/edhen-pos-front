import { apiClient } from './client'
import type { MovimientoStock } from '../types/movimientoStock'
import type { Producto, ProductoVariante } from '../types/producto'

export interface StockFiltro {
  bajoMinimo?: boolean
  categoriaId?: number
}

export async function listarStock(
  filtro: StockFiltro = {},
): Promise<Array<{ producto: Producto; variante: ProductoVariante }>> {
  const params = new URLSearchParams()
  if (filtro.bajoMinimo) params.append('bajoMinimo', 'true')
  if (filtro.categoriaId !== undefined) params.append('categoriaId', String(filtro.categoriaId))
  const res = await apiClient.get<Array<{ producto: Producto; variante: ProductoVariante }>>('/api/stock', {
    params,
  })
  return res.data
}

export interface AjusteStockInput {
  varianteId: number
  cantidad: number
  tipo: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'
  motivo?: string
}

export async function ajustarStock(input: AjusteStockInput): Promise<void> {
  await apiClient.post('/api/stock/ajuste', {
    varianteId: input.varianteId,
    cantidad: input.cantidad,
    tipo: input.tipo,
    motivo: input.motivo?.trim() || undefined,
  })
}

export interface AjusteStockLoteInput {
  tipo: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'
  motivo?: string
  items: Array<{ varianteId: number; cantidad: number }>
}

/**
 * Ajuste masivo de varias variantes en una sola transacción (recepción por grilla).
 * Es todo-o-nada en el backend: si una celda falla, no se aplica ninguna.
 */
export async function ajustarStockLote(input: AjusteStockLoteInput): Promise<MovimientoStock[]> {
  const res = await apiClient.post<MovimientoStock[]>('/api/stock/ajuste-lote', {
    tipo: input.tipo,
    motivo: input.motivo?.trim() || undefined,
    items: input.items.map((i) => ({ varianteId: i.varianteId, cantidad: i.cantidad })),
  })
  return res.data
}

export async function listarMovimientos(varianteId: number): Promise<MovimientoStock[]> {
  const res = await apiClient.get<MovimientoStock[]>(`/api/stock/${varianteId}/movimientos`)
  return res.data
}
