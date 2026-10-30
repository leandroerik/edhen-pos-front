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
      const catId = prod?.categoria?.id ?? 0
      const catNombre = prod?.categoria?.nombre ?? 'Sin categoría'
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
          categoriaNombre: prod?.categoria?.nombre ?? 'Sin categoría',
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
        categoria: prod?.categoria?.nombre ?? 'Sin categoría',
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
    const catId = producto.categoria?.id ?? 0
    const catNombre = producto.categoria?.nombre ?? 'Sin categoría'
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

// --- Horarios Pico y Días de Mayor Facturación ---

export interface HorarioVentas {
  hora: number
  etiqueta: string
  total: number
  cantidad: number
  ticketPromedio: number
  unidades: number
}

export function agruparPorHora(ventas: Venta[]): HorarioVentas[] {
  const mapa = new Map<number, { total: number; cantidad: number; unidades: number }>()

  // Inicializar franjas comerciales típicas (de 8 a 22 hs) o dinámicas
  for (let h = 8; h <= 22; h++) {
    mapa.set(h, { total: 0, cantidad: 0, unidades: 0 })
  }

  for (const v of ventas) {
    const fecha = new Date(v.fechaVenta)
    const hora = fecha.getHours()
    const unidadesVenta = v.detalles.reduce((acc, d) => acc + d.cantidad, 0)
    const existente = mapa.get(hora)
    if (existente) {
      existente.total += v.total
      existente.cantidad += 1
      existente.unidades += unidadesVenta
    } else {
      mapa.set(hora, { total: v.total, cantidad: 1, unidades: unidadesVenta })
    }
  }

  return [...mapa.entries()]
    .sort(([hA], [hB]) => hA - hB)
    .map(([hora, datos]) => ({
      hora,
      etiqueta: `${String(hora).padStart(2, '0')}:00 - ${String(hora).padStart(2, '0')}:59`,
      total: datos.total,
      cantidad: datos.cantidad,
      unidades: datos.unidades,
      ticketPromedio: datos.cantidad > 0 ? datos.total / datos.cantidad : 0,
    }))
}

export interface DiaSemanaVentas {
  diaNumero: number
  diaNombre: string
  diaCorto: string
  total: number
  cantidad: number
  ticketPromedio: number
  unidades: number
}

const NOMBRES_DIAS = [
  { numero: 1, nombre: 'Lunes', corto: 'Lun' },
  { numero: 2, nombre: 'Martes', corto: 'Mar' },
  { numero: 3, nombre: 'Miércoles', corto: 'Mié' },
  { numero: 4, nombre: 'Jueves', corto: 'Jue' },
  { numero: 5, nombre: 'Viernes', corto: 'Vie' },
  { numero: 6, nombre: 'Sábado', corto: 'Sáb' },
  { numero: 0, nombre: 'Domingo', corto: 'Dom' },
]

export function agruparPorDiaSemana(ventas: Venta[]): DiaSemanaVentas[] {
  const mapa = new Map<number, { total: number; cantidad: number; unidades: number }>()

  for (const { numero } of NOMBRES_DIAS) {
    mapa.set(numero, { total: 0, cantidad: 0, unidades: 0 })
  }

  for (const v of ventas) {
    const fecha = new Date(v.fechaVenta)
    const dia = fecha.getDay()
    const unidadesVenta = v.detalles.reduce((acc, d) => acc + d.cantidad, 0)
    const actual = mapa.get(dia)
    if (actual) {
      actual.total += v.total
      actual.cantidad += 1
      actual.unidades += unidadesVenta
    }
  }

  return NOMBRES_DIAS.map((d) => {
    const datos = mapa.get(d.numero) ?? { total: 0, cantidad: 0, unidades: 0 }
    return {
      diaNumero: d.numero,
      diaNombre: d.nombre,
      diaCorto: d.corto,
      total: datos.total,
      cantidad: datos.cantidad,
      unidades: datos.unidades,
      ticketPromedio: datos.cantidad > 0 ? datos.total / datos.cantidad : 0,
    }
  })
}

// --- Análisis de Rotación de Ropa (Estrellas vs. Estancadas) ---

export interface PrendaRotacion {
  productoId: number
  varianteId: number
  nombreProducto: string
  categoriaNombre: string
  colorNombre: string
  colorHex?: string
  tallaNombre: string
  sku: string
  unidadesVendidas: number
  totalFacturado: number
  stockActual: number
  stockMinimo: number
  precioUnitario: number
  estadoRotacion: 'ESTRELLA' | 'ESTANCADA' | 'NORMAL'
}

export interface AnalisisRotacion {
  estrellas: PrendaRotacion[]
  estancadas: PrendaRotacion[]
  valorCapitalEstancado: number
  totalEstancadas: number
  totalEstrellas: number
}

export function calcularRotacionPrendas(
  ventas: Venta[],
  stock: Array<{ producto: Producto; variante: ProductoVariante }>,
): AnalisisRotacion {
  // 1. Mapear ventas por varianteId
  const ventasPorVariante = new Map<number, { unidades: number; monto: number }>()
  for (const v of ventas) {
    for (const d of v.detalles) {
      const actual = ventasPorVariante.get(d.varianteId) ?? { unidades: 0, monto: 0 }
      actual.unidades += d.cantidad
      actual.monto += d.subtotal
      ventasPorVariante.set(d.varianteId, actual)
    }
  }

  const todasLasPrendas: PrendaRotacion[] = stock.map(({ producto, variante }) => {
    const vInfo = ventasPorVariante.get(variante.id) ?? { unidades: 0, monto: 0 }
    const precio = variante.precio ?? producto.precioBase

    let estadoRotacion: 'ESTRELLA' | 'ESTANCADA' | 'NORMAL' = 'NORMAL'

    // Estrella: Vendió bien (> 0) y le queda poco stock (<= stockMinimo o stock < 3)
    if (vInfo.unidades >= 2 && variante.stock <= Math.max(variante.stockMinimo, 3)) {
      estadoRotacion = 'ESTRELLA'
    } else if (vInfo.unidades === 0 && variante.stock > 0) {
      // Estancada: Tiene stock acumulado pero 0 ventas en el período
      estadoRotacion = 'ESTANCADA'
    }

    return {
      productoId: producto.id,
      varianteId: variante.id,
      nombreProducto: producto.nombre,
      categoriaNombre: producto.categoria?.nombre ?? 'Sin categoría',
      colorNombre: variante.color?.nombre ?? 'Sin color',
      colorHex: variante.color?.codigoHex,
      tallaNombre: variante.talla?.nombre ?? 'U',
      sku: variante.sku,
      unidadesVendidas: vInfo.unidades,
      totalFacturado: vInfo.monto,
      stockActual: variante.stock,
      stockMinimo: variante.stockMinimo,
      precioUnitario: precio,
      estadoRotacion,
    }
  })

  // Ordenar estrellas por mayor cantidad vendida primero
  const estrellas = todasLasPrendas
    .filter((p) => p.estadoRotacion === 'ESTRELLA' || (p.unidadesVendidas > 0 && p.stockActual <= p.stockMinimo))
    .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)

  // Ordenar estancadas por mayor stock inmovilizado primero
  const estancadas = todasLasPrendas
    .filter((p) => p.estadoRotacion === 'ESTANCADA')
    .sort((a, b) => b.stockActual * b.precioUnitario - a.stockActual * a.precioUnitario)

  const valorCapitalEstancado = estancadas.reduce(
    (acc, p) => acc + p.stockActual * p.precioUnitario,
    0,
  )

  return {
    estrellas,
    estancadas,
    valorCapitalEstancado,
    totalEstancadas: estancadas.length,
    totalEstrellas: estrellas.length,
  }
}

// --- Resumen Ejecutivo Consolidado ---

export interface ResumenEjecutivoData {
  totalFacturado: number
  totalDescuentos: number
  totalNeto: number
  cantidadVentas: number
  unidadesVendidas: number
  ticketPromedio: number
  horaPico: { etiqueta: string; total: number; cantidad: number } | null
  diaPico: { diaNombre: string; total: number; cantidad: number } | null
  medioPagoPrincipal: { medio: MedioPago; monto: number; porcentaje: number } | null
  canalPrincipal: { canal: TipoCompra; monto: number; porcentaje: number } | null
  topCategoria: { nombre: string; monto: number; unidades: number } | null
  topProducto: { nombre: string; monto: number; unidades: number } | null
  stockValorTotal: number
  prendasCriticas: number
  prendasEstancadas: number
}

export function calcularResumenEjecutivo(
  ventas: Venta[],
  productos: Producto[],
  stock: Array<{ producto: Producto; variante: ProductoVariante }>,
): ResumenEjecutivoData {
  const totalFacturado = ventas.reduce((acc, v) => acc + v.total, 0)
  const totalDescuentos = ventas.reduce((acc, v) => acc + (v.descuentoTotal ?? 0), 0)
  const unidadesVendidas = ventas.reduce(
    (acc, v) => acc + v.detalles.reduce((accD, d) => accD + d.cantidad, 0),
    0,
  )
  const cantidadVentas = ventas.length
  const ticketPromedio = cantidadVentas > 0 ? totalFacturado / cantidadVentas : 0

  // Horario pico
  const porHora = agruparPorHora(ventas).filter((h) => h.total > 0)
  const horaPico = porHora.length > 0
    ? [...porHora].sort((a, b) => b.total - a.total)[0]
    : null

  // Día pico
  const porDia = agruparPorDiaSemana(ventas).filter((d) => d.total > 0)
  const diaPico = porDia.length > 0
    ? [...porDia].sort((a, b) => b.total - a.total)[0]
    : null

  // Medio de pago principal
  const porMedio = agruparPorMedioPago(ventas)
  const medioPagoPrincipal = porMedio.length > 0
    ? {
        medio: porMedio[0].medio,
        monto: porMedio[0].monto,
        porcentaje: totalFacturado > 0 ? porMedio[0].monto / totalFacturado : 0,
      }
    : null

  // Canal principal
  const porCanal = agruparPorCanal(ventas)
  const canalPrincipal = porCanal.length > 0
    ? {
        canal: porCanal[0].canal,
        monto: porCanal[0].monto,
        porcentaje: totalFacturado > 0 ? porCanal[0].monto / totalFacturado : 0,
      }
    : null

  // Categoría top
  const porCat = agruparPorCategoria(ventas, productos)
  const topCategoria = porCat.length > 0
    ? {
        nombre: porCat[0].categoriaNombre,
        monto: porCat[0].monto,
        unidades: porCat[0].unidades,
      }
    : null

  // Producto top
  const ranking = rankingProductos(ventas, productos, 1)
  const topProducto = ranking.length > 0
    ? {
        nombre: ranking[0].nombre,
        monto: ranking[0].monto,
        unidades: ranking[0].unidades,
      }
    : null

  // Stock
  const stockValorTotal = stock.reduce((acc, { producto, variante }) => {
    const p = variante.precio ?? producto.precioBase
    return acc + variante.stock * p
  }, 0)

  const rotacion = calcularRotacionPrendas(ventas, stock)

  return {
    totalFacturado,
    totalDescuentos,
    totalNeto: totalFacturado,
    cantidadVentas,
    unidadesVendidas,
    ticketPromedio,
    horaPico: horaPico ? { etiqueta: horaPico.etiqueta, total: horaPico.total, cantidad: horaPico.cantidad } : null,
    diaPico: diaPico ? { diaNombre: diaPico.diaNombre, total: diaPico.total, cantidad: diaPico.cantidad } : null,
    medioPagoPrincipal,
    canalPrincipal,
    topCategoria,
    topProducto,
    stockValorTotal,
    prendasCriticas: rotacion.totalEstrellas,
    prendasEstancadas: rotacion.totalEstancadas,
  }
}
