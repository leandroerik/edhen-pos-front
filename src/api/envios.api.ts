import { apiClient } from './client'
import type { Envio, EstadoEnvio, Transportista } from '../types/envio'

export interface EnvioInput {
  clienteId: number
  direccionId: number
  ventaId?: number
  transportistaId?: number
  transportista?: string
}

export async function crearEnvio(input: EnvioInput): Promise<Envio> {
  const res = await apiClient.post<Envio>('/api/envios', input)
  return res.data
}

export interface EnviosFiltro {
  estado?: EstadoEnvio
  desde?: string
  hasta?: string
}

export async function listarEnvios(filtro: EnviosFiltro = {}): Promise<Envio[]> {
  const params = new URLSearchParams()
  if (filtro.estado) params.append('estado', filtro.estado)
  if (filtro.desde) params.append('desde', filtro.desde)
  if (filtro.hasta) params.append('hasta', filtro.hasta)

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

export async function listarTransportistas(): Promise<Transportista[]> {
  const res = await apiClient.get<Transportista[]>('/api/transportistas')
  return res.data
}

export async function crearTransportista(input: { nombre: string; telefono?: string; email?: string }): Promise<Transportista> {
  const res = await apiClient.post<Transportista>('/api/transportistas', input)
  return res.data
}
