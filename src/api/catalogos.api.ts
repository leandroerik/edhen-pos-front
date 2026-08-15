import { apiClient } from './client'
import type { Categoria } from '../types/categoria'
import type { Color } from '../types/color'
import type { Talla, TallaTipo } from '../types/talla'

export interface CategoriasFiltro {
  activo?: boolean
}

export async function listarCategorias(filtro?: CategoriasFiltro): Promise<Categoria[]> {
  const params = new URLSearchParams()
  if (filtro?.activo !== undefined) {
    params.append('activo', String(filtro.activo))
  }
  const res = await apiClient.get<Categoria[]>('/api/categorias', { params })
  return res.data
}

export async function obtenerCategoria(id: number): Promise<Categoria> {
  const res = await apiClient.get<Categoria>(`/api/categorias/${id}`)
  return res.data
}

export interface CategoriaInput {
  nombre: string
  descripcion?: string
  activo?: boolean
}

export async function crearCategoria(input: CategoriaInput): Promise<Categoria> {
  const res = await apiClient.post<Categoria>('/api/categorias', {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion?.trim() || undefined,
  })
  return res.data
}

export async function actualizarCategoria(id: number, input: CategoriaInput): Promise<Categoria> {
  const res = await apiClient.put<Categoria>(`/api/categorias/${id}`, {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion?.trim() || undefined,
    activo: input.activo,
  })
  return res.data
}

export async function activarCategoria(id: number): Promise<Categoria> {
  const res = await apiClient.put<Categoria>(`/api/categorias/${id}/activar`)
  return res.data
}

export async function desactivarCategoria(id: number): Promise<Categoria> {
  const res = await apiClient.put<Categoria>(`/api/categorias/${id}/desactivar`)
  return res.data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await apiClient.delete(`/api/categorias/${id}`)
}

export async function listarColores(): Promise<Color[]> {
  const res = await apiClient.get<Color[]>('/api/colores')
  return res.data
}

export async function listarTallas(): Promise<Talla[]> {
  const res = await apiClient.get<Talla[]>('/api/tallas')
  return res.data
}

export interface ColorInput {
  nombre: string
  codigoHex: string
}

export async function crearColor(input: ColorInput): Promise<Color> {
  const res = await apiClient.post<Color>('/api/colores', input)
  return res.data
}

export interface TallaInput {
  nombre: string
  tipo: TallaTipo
}

export async function crearTalla(input: TallaInput): Promise<Talla> {
  const res = await apiClient.post<Talla>('/api/tallas', input)
  return res.data
}
