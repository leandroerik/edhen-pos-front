export type TallaTipo = 'ROPA' | 'CALZADO'

export interface Talla {
  id: number
  nombre: string
  tipo: TallaTipo
  orden: number
}
