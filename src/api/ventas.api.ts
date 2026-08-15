import { apiClient } from './client'
import type { TipoCliente } from '../types/cliente'
import type { EstadoVenta, MedioPago, Venta } from '../types/venta'

export interface ItemVentaInput {
  varianteId: number
  cantidad: number
  precioUnitario: number
  descuentoItem?: number
}

export interface PagoInput {
  medioPago: MedioPago
  monto: number
  cuotas?: number
}

export interface CrearVentaInput {
  cliente?: { id: number; nombre: string; apellido: string; tipo: TipoCliente }
  items: ItemVentaInput[]
  pagos: PagoInput[]
  descuentoTotal?: number
  observaciones?: string
}

export async function crearVenta(input: CrearVentaInput): Promise<Venta> {
  const payload = {
    clienteId: input.cliente?.id,
    tipoCompra: 'LOCAL_FISICO',
    descuentoTotal: input.descuentoTotal ?? 0,
    items: input.items,
    pagos: input.pagos,
    observaciones: input.observaciones,
  }
  const res = await apiClient.post<Venta>('/api/ventas', payload)
  return res.data
}

export async function crearPedido(input: CrearVentaInput): Promise<Venta> {
  const payload = {
    clienteId: input.cliente?.id,
    tipoCompra: 'LOCAL_FISICO',
    descuentoTotal: input.descuentoTotal ?? 0,
    items: input.items,
    pagos: input.pagos,
    observaciones: input.observaciones,
  }
  const res = await apiClient.post<Venta>('/api/ventas/pedido', payload)
  return res.data
}

export interface VentasFiltro {
  desde?: string
  hasta?: string
  estado?: EstadoVenta
}

export async function listarVentas(filtro: VentasFiltro = {}): Promise<Venta[]> {
  const params = new URLSearchParams()
  if (filtro.estado) params.append('estado', filtro.estado)
  if (filtro.desde) params.append('desde', filtro.desde)
  if (filtro.hasta) params.append('hasta', filtro.hasta)

  const res = await apiClient.get<Venta[]>('/api/ventas', { params })
  return res.data
}

export async function obtenerVenta(id: number): Promise<Venta | undefined> {
  try {
    const res = await apiClient.get<Venta>(`/api/ventas/${id}`)
    return res.data
  } catch {
    return undefined
  }
}

export async function buscarVentasParaEnvio(texto: string): Promise<Venta[]> {
  if (!texto.trim()) return []
  const res = await apiClient.get<Venta[]>('/api/ventas/buscar-envio', {
    params: { texto: texto.trim() },
  })
  return res.data
}

export async function completarPagoVenta(id: number, pagosNuevos: PagoInput[]): Promise<Venta> {
  const res = await apiClient.post<Venta>(`/api/ventas/${id}/completar-pago`, pagosNuevos)
  return res.data
}

export async function cancelarPedido(id: number): Promise<void> {
  await apiClient.post(`/api/ventas/${id}/cancelar`)
}

export async function anularVenta(id: number): Promise<void> {
  await apiClient.post(`/api/ventas/${id}/anular`)
}
