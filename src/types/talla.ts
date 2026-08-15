export type TallaTipo = 'ROPA_SUPERIOR' | 'ROPA_INFERIOR' | 'CALZADO' | 'UNICO'

export interface Talla {
  id: number
  nombre: string
  tipo: TallaTipo
  orden: number
}
