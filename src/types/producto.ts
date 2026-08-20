import type { Categoria } from './categoria'
import type { Color } from './color'
import type { Talla } from './talla'

export interface Producto {
  id: number
  categoria: Categoria
  codigoBarras?: string
  nombre: string
  descripcion?: string
  precioBase: number
  imagenUrl?: string
  activo: boolean
  creadoEn?: string
  actualizadoEn?: string
  variantes: ProductoVariante[]
}

export interface ProductoVariante {
  id: number
  productoId: number
  color: Color | null
  talla: Talla | null
  sku: string
  codigoBarras?: string
  precio?: number
  stock: number
  stockReservado: number
  stockDisponible: number
  stockMinimo: number
  activo: boolean
}
