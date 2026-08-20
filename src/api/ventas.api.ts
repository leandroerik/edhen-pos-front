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
  const res = await apiClient.post<Venta>('/api/ventas', construirPayload(input))
  return res.data
}

export async function crearPedido(input: CrearVentaInput): Promise<Venta> {
  const res = await apiClient.post<Venta>('/api/ventas/pedido', construirPayload(input))
  return res.data
}

function construirPayload(input: CrearVentaInput) {
  return {
    clienteId: input.cliente?.id,
    tipoCompra: 'LOCAL_FISICO',
    descuentoTotal: input.descuentoTotal ?? 0,
    items: input.items,
    pagos: input.pagos,
    observaciones: input.observaciones,
  }
}

export interface VentasFiltro {
  desde?: string
  hasta?: string
  estado?: EstadoVenta
  page?: number
  size?: number
}

export interface PaginatedVentas {
  items: Venta[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export async function listarVentas(filtro: Omit<VentasFiltro, 'page' | 'size'> = {}): Promise<Venta[]> {
  const params = new URLSearchParams()
  if (filtro.estado) params.append('estado', filtro.estado)
  if (filtro.desde) params.append('desde', filtro.desde)
  if (filtro.hasta) params.append('hasta', filtro.hasta)

  const res = await apiClient.get<Venta[]>('/api/ventas', { params })
  return res.data
}

export async function listarVentasPaginadas(filtro: VentasFiltro): Promise<PaginatedVentas> {
  const params = new URLSearchParams()
  if (filtro.estado) params.append('estado', filtro.estado)
  if (filtro.desde) params.append('desde', filtro.desde)
  if (filtro.hasta) params.append('hasta', filtro.hasta)
  if (filtro.page !== undefined) params.append('page', String(filtro.page))
  if (filtro.size !== undefined) params.append('size', String(filtro.size))

  const res = await apiClient.get<PaginatedVentas>('/api/ventas', { params })
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

export async function pedidosSinEnvio(): Promise<Venta[]> {
  const res = await apiClient.get<Venta[]>('/api/ventas/pendientes-sin-envio')
  return res.data
}

export async function anularVenta(id: number): Promise<void> {
  await apiClient.post(`/api/ventas/${id}/anular`)
}

export async function descargarComprobante(id: number): Promise<Blob> {
  const res = await apiClient.get(`/api/ventas/${id}/comprobante`, { responseType: 'blob' })
  return res.data
}
