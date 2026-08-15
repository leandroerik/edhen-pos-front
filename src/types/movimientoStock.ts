export type TipoMovimientoStock =
  | 'INGRESO'
  | 'VENTA'
  | 'DEVOLUCION'
  | 'RESERVA'
  | 'LIBERA_RESERVA'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO'

export interface MovimientoStock {
  id: number
  varianteId: number
  tipo: TipoMovimientoStock
  cantidad: number
  fecha: string
  referenciaVentaId?: number
  motivo?: string
}
