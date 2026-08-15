import type { Color } from './color'
import type { TipoCliente } from './cliente'
import type { Talla } from './talla'

// MedioPago refleja el enum completo del Documento 2. Hoy el negocio solo
// cobra en efectivo o transferencia (ver docs/07-proceso-de-venta.md) — el
// resto queda tipado para cuando se habiliten sin tener que tocar el modelo.
export type MedioPago =
  | 'EFECTIVO'
  | 'TARJETA_DEBITO'
  | 'TARJETA_CREDITO'
  | 'TRANSFERENCIA'
  | 'MERCADO_PAGO'
  | 'CUENTA_CORRIENTE'

export type TipoCompra = 'LOCAL_FISICO' | 'WHATSAPP' | 'WEB' | 'MARKETPLACE' | 'TELEFONO'

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA'

export interface Pago {
  id: number
  medioPago: MedioPago
  monto: number
  cuotas?: number
}

export interface VentaDetalle {
  id: number
  varianteId: number
  producto: { id: number; nombre: string }
  variante: { id: number; sku: string; color: Color; talla: Talla }
  cantidad: number
  precioUnitario: number
  descuentoItem: number
  subtotal: number
}

export interface Venta {
  id: number
  codigoVenta: string
  fechaVenta: string
  // Snapshot del cliente al momento de la venta (mismo criterio que
  // VentaDetalle.producto/variante) — nullable: venta mostrador sin cliente
  // registrado, tal como lo permite el Documento 2.
  cliente?: { id: number; nombre: string; apellido: string; tipo: TipoCliente }
  tipoCompra: TipoCompra
  subtotal: number
  descuentoTotal: number
  total: number
  estadoVenta: EstadoVenta
  detalles: VentaDetalle[]
  pagos: Pago[]
  observaciones?: string
}
