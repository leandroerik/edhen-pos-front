import type { Envio } from '../../../types/envio'
import type { Producto, ProductoVariante } from '../../../types/producto'
import type { MedioPago, TipoCompra, Venta } from '../../../types/venta'

function claveDiaLocal(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function claveSemana(fecha: Date): string {
  const d = new Date(fecha)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  return claveDiaLocal(d)
}

export interface DiaVentas {
  clave: string
  fecha: Date
  total: number
  cantidad: number
}

export function agruparPorDia(ventas: Venta[]): DiaVentas[] {
  const mapa = new Map<string, DiaVentas>()
  for (const v of ventas) {
    const clave = claveDiaLocal(new Date(v.fechaVenta))
    const existente = mapa.get(clave)
    if (existente) {
      existente.total += v.total
      existente.cantidad += 1
    } else {
      const fecha = new Date(v.fechaVenta)
      fecha.setHours(0, 0, 0, 0)
      mapa.set(clave, { clave, fecha, total: v.total, cantidad: 1 })
    }
  }
  return [...mapa.values()].sort((a, b) => a.clave.localeCompare(b.clave))
}

export interface SemanaVentas {
  clave: string
  inicio: Date
  total: number
  cantidad: number
}

export function agruparPorSemana(ventas: Venta[]): SemanaVentas[] {
  const mapa = new Map<string, SemanaVentas>()
  for (const v of ventas) {
    const clave = claveSemana(new Date(v.fechaVenta))
    const existente = mapa.get(clave)
    if (existente) {
      existente.total += v.total
      existente.cantidad += 1
    } else {
      const inicio = new Date(clave)
      mapa.set(clave, { clave, inicio, total: v.total, cantidad: 1 })
    }
  }
  return [...mapa.values()].sort((a, b) => a.clave.localeCompare(b.clave))
}

export interface CategoriaVentas {
  categoriaId: number
  categoriaNombre: string
  unidades: number
  monto: number
}

export function agruparPorCategoria(
  ventas: Venta[],
  productos: Producto[],
): CategoriaVentas[] {
  const productoPorId = new Map(productos.map((p) => [p.id, p]))
  const mapa = new Map<number, CategoriaVentas>()
  for (const v of ventas) {
    for (const d of v.detalles) {
      const prod = productoPorId.get(d.producto.id)
      const catId = prod?.categoria.id ?? 0
      const catNombre = prod?.categoria.nombre ?? 'Sin categoría'
      const existente = mapa.get(catId)
      if (existente) {
        existente.unidades += d.cantidad
        existente.monto += d.subtotal
      } else {
        mapa.set(catId, {
          categoriaId: catId,
          categoriaNombre: catNombre,
          unidades: d.cantidad,
          monto: d.subtotal,
        })
      }
    }
  }
  return [...mapa.values()].sort((a, b) => b.monto - a.monto)
}

export interface MedioPagoVentas {
  medio: MedioPago
  monto: number
}

export function agruparPorMedioPago(ventas: Venta[]): MedioPagoVentas[] {
  const mapa = new Map<MedioPago, number>()
  for (const v of ventas) {
    for (const p of v.pagos) {
      mapa.set(p.medioPago, (mapa.get(p.medioPago) ?? 0) + p.monto)
    }
  }
  return [...mapa.entries()]
    .map(([medio, monto]) => ({ medio, monto }))
    .sort((a, b) => b.monto - a.monto)
}

export interface CanalVentas {
  canal: TipoCompra
  monto: number
}

export function agruparPorCanal(ventas: Venta[]): CanalVentas[] {
  const mapa = new Map<TipoCompra, number>()
  for (const v of ventas) {
    mapa.set(v.tipoCompra, (mapa.get(v.tipoCompra) ?? 0) + v.total)
  }
  return [...mapa.entries()]
    .map(([canal, monto]) => ({ canal, monto }))
    .sort((a, b) => b.monto - a.monto)
}

export interface ProductoRanking {
  productoId: number
  nombre: string
  categoriaNombre: string
  unidades: number
  monto: number
}

export function rankingProductos(
  ventas: Venta[],
  productos: Producto[],
  limit = 10,
): ProductoRanking[] {
  const productoPorId = new Map(productos.map((p) => [p.id, p]))
  const mapa = new Map<number, ProductoRanking>()
  for (const v of ventas) {
    for (const d of v.detalles) {
      const existente = mapa.get(d.producto.id)
      if (existente) {
        existente.unidades += d.cantidad
        existente.monto += d.subtotal
      } else {
        const prod = productoPorId.get(d.producto.id)
        mapa.set(d.producto.id, {
          productoId: d.producto.id,
          nombre: d.producto.nombre,
          categoriaNombre: prod?.categoria.nombre ?? 'Sin categoría',
          unidades: d.cantidad,
          monto: d.subtotal,
        })
      }
    }
  }
  return [...mapa.values()]
    .sort((a, b) => b.monto - a.monto)
    .slice(0, limit)
}

export interface ResumenVentas {
  totalFacturado: number
  cantidadVentas: number
  ticketPromedio: number
  ventaMinima: number
  ventaMaxima: number
}

export function calcularResumen(ventas: Venta[]): ResumenVentas {
  if (ventas.length === 0) {
    return { totalFacturado: 0, cantidadVentas: 0, ticketPromedio: 0, ventaMinima: 0, ventaMaxima: 0 }
  }
  const totales = ventas.map((v) => v.total)
  const totalFacturado = totales.reduce((a, b) => a + b, 0)
  return {
    totalFacturado,
    cantidadVentas: ventas.length,
    ticketPromedio: totalFacturado / ventas.length,
    ventaMinima: Math.min(...totales),
    ventaMaxima: Math.max(...totales),
  }
}

export interface DetalleItem {
  producto: string
  categoria: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  ventaCodigo: string
  fecha: string
}

export function desglosarDetalles(
  ventas: Venta[],
  productos: Producto[],
): DetalleItem[] {
  const productoPorId = new Map(productos.map((p) => [p.id, p]))
  const items: DetalleItem[] = []
  for (const v of ventas) {
    for (const d of v.detalles) {
      const prod = productoPorId.get(d.producto.id)
      items.push({
        producto: d.producto.nombre,
        categoria: prod?.categoria.nombre ?? 'Sin categoría',
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        descuento: d.descuentoItem,
        subtotal: d.subtotal,
        ventaCodigo: v.codigoVenta,
        fecha: new Date(v.fechaVenta).toLocaleDateString('es-AR'),
      })
    }
  }
  return items
}

// --- Variantes ---

export interface VarianteVentas {
  varianteId: number
  colorNombre: string
  colorHex: string
  tallaNombre: string
  sku: string
  unidades: number
  monto: number
}

export function agruparPorVariante(ventas: Venta[]): VarianteVentas[] {
  const mapa = new Map<number, VarianteVentas>()
  for (const v of ventas) {
    for (const d of v.detalles) {
      const existente = mapa.get(d.varianteId)
      if (existente) {
        existente.unidades += d.cantidad
        existente.monto += d.subtotal
      } else {
        mapa.set(d.varianteId, {
          varianteId: d.varianteId,
          colorNombre: d.variante.color.nombre,
          colorHex: d.variante.color.codigoHex,
          tallaNombre: d.variante.talla.nombre,
          sku: d.variante.sku,
          unidades: d.cantidad,
          monto: d.subtotal,
        })
      }
    }
  }
  return [...mapa.values()].sort((a, b) => b.monto - a.monto)
}

export interface ColorVentas {
  colorId: number
  nombre: string
  hex: string
  unidades: number
  monto: number
}

export function agruparPorColor(ventas: Venta[]): ColorVentas[] {
  const mapa = new Map<number, ColorVentas>()
  for (const v of ventas) {
    for (const d of v.detalles) {
      const existente = mapa.get(d.variante.color.id)
      if (existente) {
        existente.unidades += d.cantidad
        existente.monto += d.subtotal
      } else {
        mapa.set(d.variante.color.id, {
          colorId: d.variante.color.id,
          nombre: d.variante.color.nombre,
          hex: d.variante.color.codigoHex,
          unidades: d.cantidad,
          monto: d.subtotal,
        })
      }
    }
  }
  return [...mapa.values()].sort((a, b) => b.monto - a.monto)
}

export interface TallaVentas {
  tallaId: number
  nombre: string
  unidades: number
  monto: number
}

export function agruparPorTalla(ventas: Venta[]): TallaVentas[] {
  const mapa = new Map<number, TallaVentas>()
  for (const v of ventas) {
    for (const d of v.detalles) {
      const existente = mapa.get(d.variante.talla.id)
      if (existente) {
        existente.unidades += d.cantidad
        existente.monto += d.subtotal
      } else {
        mapa.set(d.variante.talla.id, {
          tallaId: d.variante.talla.id,
          nombre: d.variante.talla.nombre,
          unidades: d.cantidad,
          monto: d.subtotal,
        })
      }
    }
  }
  return [...mapa.values()].sort((a, b) => b.monto - a.monto)
}

// --- Comparación de períodos ---

export interface Variacion {
  actual: number
  anterior: number
  diferencia: number
  porcentaje: number
  direccion: 'sube' | 'baja' | 'igual'
}

export function calcularVariacion(actual: number, anterior: number): Variacion {
  const diferencia = actual - anterior
  const porcentaje = anterior !== 0 ? diferencia / Math.abs(anterior) : 0
  return {
    actual,
    anterior,
    diferencia,
    porcentaje,
    direccion: diferencia > 0 ? 'sube' : diferencia < 0 ? 'baja' : 'igual',
  }
}

// --- Stock ---

export interface StockCategoria {
  categoriaId: number
  categoriaNombre: string
  unidades: number
  valorEstimado: number
  variantes: number
  bajoMinimo: number
}

export function agruparStockPorCategoria(
  stock: Array<{ producto: Producto; variante: ProductoVariante }>,
): StockCategoria[] {
  const mapa = new Map<number, StockCategoria>()
  for (const { producto, variante } of stock) {
    const catId = producto.categoria.id
    const catNombre = producto.categoria.nombre
    const precio = variante.precio ?? producto.precioBase
    const existente = mapa.get(catId)
    if (existente) {
      existente.unidades += variante.stock
      existente.valorEstimado += variante.stock * precio
      existente.variantes += 1
      if (variante.stock < variante.stockMinimo) existente.bajoMinimo += 1
    } else {
      mapa.set(catId, {
        categoriaId: catId,
        categoriaNombre: catNombre,
        unidades: variante.stock,
        valorEstimado: variante.stock * precio,
        variantes: 1,
        bajoMinimo: variante.stock < variante.stockMinimo ? 1 : 0,
      })
    }
  }
  return [...mapa.values()].sort((a, b) => b.valorEstimado - a.valorEstimado)
}

// --- Envíos ---

export interface EnviosTransportista {
  transportista: string
  total: number
  costoTotal: number
  costoPromedio: number
  entregados: number
}

export function agruparEnviosPorTransportista(
  envios: Envio[],
): EnviosTransportista[] {
  const mapa = new Map<string, { total: number; costoTotal: number; entregados: number }>()
  for (const e of envios) {
    const existente = mapa.get(e.transportista)
    if (existente) {
      existente.total += 1
      existente.costoTotal += e.costoEnvio
      if (e.estadoEnvio === 'ENTREGADO') existente.entregados += 1
    } else {
      mapa.set(e.transportista, {
        total: 1,
        costoTotal: e.costoEnvio,
        entregados: e.estadoEnvio === 'ENTREGADO' ? 1 : 0,
      })
    }
  }
  return [...mapa.entries()]
    .map(([transportista, datos]) => ({
      transportista,
      total: datos.total,
      costoTotal: datos.costoTotal,
      costoPromedio: datos.total > 0 ? datos.costoTotal / datos.total : 0,
      entregados: datos.entregados,
    }))
    .sort((a, b) => b.total - a.total)
}

export interface EnviosEstado {
  estado: string
  cantidad: number
}

export function agruparEnviosPorEstado(envios: Envio[]): EnviosEstado[] {
  const mapa = new Map<string, number>()
  for (const e of envios) {
    mapa.set(e.estadoEnvio, (mapa.get(e.estadoEnvio) ?? 0) + 1)
  }
  return [...mapa.entries()]
    .map(([estado, cantidad]) => ({ estado, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
}
