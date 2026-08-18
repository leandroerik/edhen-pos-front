export type EstadoEnvio = 'PENDIENTE' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'

export interface Transportista {
  id: number
  nombre: string
  telefono?: string
  email?: string
  costoEnvio: number
  esGenerico: boolean
}

export interface EnvioDetalleVenta {
  varianteId: number
  productoNombre: string
  colorNombre: string
  tallaNombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Envio {
  id: number
  codigoEnvio: string
  cliente: { id: number; nombre: string; apellido: string }
  direccion: {
    id: number
    direccion: string
    localidad: string
    provincia: string
    codigoPostal: string
  }
  ventaId?: number
  ventaCodigo?: string
  transportistaId?: number
  transportista: string
  costoEnvio: number
  fechaSolicitud: string
  fechaRealEntrega?: string
  estadoEnvio: EstadoEnvio
  observaciones?: string
  detallesVenta?: EnvioDetalleVenta[]
  totalVenta?: number
  totalPagado?: number
  saldoPendiente?: number
}
