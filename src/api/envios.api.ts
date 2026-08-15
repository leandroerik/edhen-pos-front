import { apiClient } from './client'
import type { Envio, EstadoEnvio } from '../types/envio'

export interface EnvioInput {
  clienteId: number
  direccionId: number
  ventaId?: number
  transportista: string
  costoEnvio: number
  fechaEstimadaEntrega: string
}

export async function crearEnvio(input: EnvioInput): Promise<Envio> {
  const res = await apiClient.post<Envio>('/api/envios', input)
  return res.data
}

export interface EnviosFiltro {
  estado?: EstadoEnvio
}

export async function listarEnvios(filtro: EnviosFiltro = {}): Promise<Envio[]> {
  const params = new URLSearchParams()
  if (filtro.estado) params.append('estado', filtro.estado)

  const res = await apiClient.get<Envio[]>('/api/envios', { params })
  return res.data
}

export async function obtenerEnvio(id: number): Promise<Envio | undefined> {
  try {
    const res = await apiClient.get<Envio>(`/api/envios/${id}`)
    return res.data
  } catch {
    return undefined
  }
}

export async function avanzarEstadoEnvio(id: number): Promise<void> {
  await apiClient.put(`/api/envios/${id}/avanzar`)
}

export async function cancelarEnvio(id: number): Promise<void> {
  await apiClient.put(`/api/envios/${id}/cancelar`)
}
