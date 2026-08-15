export type EstadoEnvio = 'PENDIENTE' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'

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
  transportista: string
  costoEnvio: number
  fechaSolicitud: string
  fechaEstimadaEntrega: string
  fechaRealEntrega?: string
  estadoEnvio: EstadoEnvio
}
