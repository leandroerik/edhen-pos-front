import { apiClient } from './client'
import type { Categoria } from '../types/categoria'
import type { Color } from '../types/color'
import type { Talla, TallaTipo } from '../types/talla'

export async function listarCategorias(): Promise<Categoria[]> {
  const res = await apiClient.get<Categoria[]>('/api/categorias')
  return res.data
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
