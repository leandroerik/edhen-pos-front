import { apiClient } from './client'
import type { Cliente, TipoCliente } from '../types/cliente'
import type { Direccion } from '../types/direccion'

export interface ClientesFiltro {
  texto?: string
  tipo?: TipoCliente
  activo?: boolean
}

export interface ClienteInput {
  nombre: string
  apellido: string
  tipo: TipoCliente
  email?: string
  telefono: string
  dni?: string
}

export async function listarClientes(filtro: ClientesFiltro = {}): Promise<Cliente[]> {
  const params = new URLSearchParams()
  if (filtro.texto) params.append('texto', filtro.texto)
  if (filtro.tipo) params.append('tipo', filtro.tipo)
  if (filtro.activo !== undefined) params.append('activo', String(filtro.activo))

  const res = await apiClient.get<Cliente[]>('/api/clientes', { params })
  return res.data
}

export async function obtenerCliente(id: number): Promise<Cliente | undefined> {
  try {
    const res = await apiClient.get<Cliente>(`/api/clientes/${id}`)
    return res.data
  } catch {
    return undefined
  }
}

export async function crearCliente(input: ClienteInput): Promise<Cliente> {
  const res = await apiClient.post<Cliente>('/api/clientes', input)
  return res.data
}

export async function editarCliente(id: number, input: ClienteInput): Promise<Cliente> {
  const res = await apiClient.put<Cliente>(`/api/clientes/${id}`, input)
  return res.data
}

export async function eliminarCliente(id: number): Promise<void> {
  await apiClient.delete(`/api/clientes/${id}`)
}

export async function reactivarCliente(id: number): Promise<void> {
  await apiClient.put(`/api/clientes/${id}/reactivar`)
}

export async function buscarClientesParaVenta(texto: string): Promise<Cliente[]> {
  if (!texto.trim()) return []
  const res = await apiClient.get<Cliente[]>('/api/clientes/buscar', {
    params: { texto: texto.trim() },
  })
  return res.data
}

// --- Direcciones (Cliente 1─N Direccion) ---

export interface DireccionInput {
  direccion: string
  localidad: string
  provincia: string
  codigoPostal: string
  observaciones?: string
  esPrincipal: boolean
}

export async function listarDirecciones(clienteId: number): Promise<Direccion[]> {
  const res = await apiClient.get<Direccion[]>(`/api/clientes/${clienteId}/direcciones`)
  return res.data
}

export async function crearDireccion(clienteId: number, input: DireccionInput): Promise<Direccion> {
  const res = await apiClient.post<Direccion>(`/api/clientes/${clienteId}/direcciones`, input)
  return res.data
}

export async function editarDireccion(direccionId: number, input: DireccionInput): Promise<Direccion> {
  const res = await apiClient.put<Direccion>(`/api/clientes/direcciones/${direccionId}`, input)
  return res.data
}

export async function eliminarDireccion(direccionId: number): Promise<void> {
  await apiClient.delete(`/api/clientes/direcciones/${direccionId}`)
}
