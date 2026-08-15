import { apiClient } from './client'
import type { MovimientoStock } from '../types/movimientoStock'
import type { Producto, ProductoVariante } from '../types/producto'

export interface StockFiltro {
  bajoMinimo?: boolean
}

export async function listarStock(
  filtro: StockFiltro = {},
): Promise<Array<{ producto: Producto; variante: ProductoVariante }>> {
  const res = await apiClient.get<Array<{ producto: Producto; variante: ProductoVariante }>>('/api/stock', {
    params: { bajoMinimo: filtro.bajoMinimo ?? false },
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

export async function listarMovimientos(varianteId: number): Promise<MovimientoStock[]> {
  const res = await apiClient.get<MovimientoStock[]>(`/api/stock/${varianteId}/movimientos`)
  return res.data
}
