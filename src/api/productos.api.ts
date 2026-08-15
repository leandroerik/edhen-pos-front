import { apiClient } from './client'
import type { Categoria } from '../types/categoria'
import type { Color } from '../types/color'
import type { MovimientoStock } from '../types/movimientoStock'
import type { Producto, ProductoVariante } from '../types/producto'
import type { Talla } from '../types/talla'

export interface ProductosFiltro {
  texto?: string
  categoriaId?: number
  activo?: boolean
}

export interface ProductoInput {
  categoria: Categoria
  codigoBarras?: string
  nombre: string
  descripcion?: string
  precioBase: number
  imagenUrl?: string
}

export interface VarianteCrearInput {
  color: Color
  talla: Talla
  codigoBarras?: string
  precio?: number
  stock: number
  stockMinimo: number
}

export interface VarianteEditarInput {
  color: Color
  talla: Talla
  codigoBarras?: string
  precio?: number
  stockMinimo: number
  activo: boolean
}

export async function listarProductos(filtro: ProductosFiltro = {}): Promise<Producto[]> {
  const params = new URLSearchParams()
  if (filtro.texto) params.append('texto', filtro.texto)
  if (filtro.categoriaId !== undefined) params.append('categoriaId', String(filtro.categoriaId))
  if (filtro.activo !== undefined) params.append('activo', String(filtro.activo))

  const res = await apiClient.get<Producto[]>('/api/productos', { params })
  return res.data
}

export async function obtenerProducto(id: number): Promise<Producto | undefined> {
  try {
    const res = await apiClient.get<Producto>(`/api/productos/${id}`)
    return res.data
  } catch {
    return undefined
  }
}

export async function contarUsoCatalogo(): Promise<{
  colores: Record<number, number>
  tallas: Record<number, number>
}> {
  try {
    const res = await apiClient.get<{ colores: Record<number, number>; tallas: Record<number, number> }>(
      '/api/productos/catalogo-uso',
    )
    return res.data
  } catch {
    return { colores: {}, tallas: {} }
  }
}

export async function crearProducto(input: ProductoInput): Promise<Producto> {
  const res = await apiClient.post<Producto>('/api/productos', {
    ...input,
    categoriaId: input.categoria?.id,
  })
  return res.data
}

export async function editarProducto(id: number, input: ProductoInput): Promise<Producto> {
  const res = await apiClient.put<Producto>(`/api/productos/${id}`, {
    ...input,
    categoriaId: input.categoria?.id,
  })
  return res.data
}

export async function eliminarProducto(id: number): Promise<void> {
  await apiClient.delete(`/api/productos/${id}`)
}

export async function reactivarProducto(id: number): Promise<void> {
  await apiClient.put(`/api/productos/${id}/reactivar`)
}

export async function crearVariante(
  productoId: number,
  input: VarianteCrearInput,
): Promise<ProductoVariante> {
  const res = await apiClient.post<ProductoVariante>(`/api/productos/${productoId}/variantes`, {
    ...input,
    colorId: input.color?.id,
    tallaId: input.talla?.id,
  })
  return res.data
}

export async function editarVariante(
  varianteId: number,
  input: VarianteEditarInput,
): Promise<ProductoVariante> {
  const res = await apiClient.put<ProductoVariante>(`/api/variantes/${varianteId}`, {
    ...input,
    colorId: input.color?.id,
    tallaId: input.talla?.id,
  })
  return res.data
}

export async function listarVariantesConStock(
  filtro: { bajoMinimo?: boolean } = {},
): Promise<Array<{ producto: Producto; variante: ProductoVariante }>> {
  const res = await apiClient.get<Array<{ producto: Producto; variante: ProductoVariante }>>('/api/stock', {
    params: { bajoMinimo: filtro.bajoMinimo ?? false },
  })
  return res.data
}

export async function listarMovimientosVariante(varianteId: number): Promise<MovimientoStock[]> {
  const res = await apiClient.get<MovimientoStock[]>(`/api/stock/${varianteId}/movimientos`)
  return res.data
}

export async function buscarVariantesParaVenta(
  texto: string,
): Promise<Array<{ producto: Producto; variante: ProductoVariante }>> {
  if (!texto.trim()) return []
  const res = await apiClient.get<Array<{ producto: Producto; variante: ProductoVariante }>>(
    '/api/variantes/buscar',
    { params: { texto: texto.trim() } },
  )
  return res.data
}
