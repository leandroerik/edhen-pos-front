export type TipoCliente = 'MAYORISTA' | 'MINORISTA' | 'OTRO'

export interface Cliente {
  id: number
  nombre: string
  apellido: string
  tipo: TipoCliente
  email?: string
  telefono: string
  dni?: string
  fechaRegistro: string
  activo: boolean
  esGenerico?: boolean
}
