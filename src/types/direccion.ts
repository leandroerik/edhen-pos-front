export interface Direccion {
  id: number
  clienteId: number
  direccion: string
  localidad: string
  provincia: string
  codigoPostal: string
  esPrincipal: boolean
  observaciones?: string
}
