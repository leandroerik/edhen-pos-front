import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarEnvios } from '../../api/envios.api'
import { listarStock } from '../../api/stock.api'
import { listarVentas } from '../../api/ventas.api'
import type { MedioPago } from '../../types/venta'
import { PanoramaHoy } from './components/PanoramaHoy'
import { ProductosMasVendidos, type ProductoVendido } from './components/ProductosMasVendidos'
import { VentasUltimosDiasChart } from './components/VentasUltimosDiasChart'

const formatFecha = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function saludo(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// Clave por día en huso horario local (no UTC) — así "hoy" y los buckets
// del gráfico de 7 días coinciden con lo que el cajero considera "hoy",
// sin el corrimiento que da comparar fechaVenta (ISO en UTC) contra un
// límite calculado a partir de la medianoche local.
function claveDiaLocal(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ultimosNDias(n: number): Date[] {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Array.from({ length: n }, (_, i) => {
    const dia = new Date(hoy)
    dia.setDate(dia.getDate() - (n - 1 - i))
    return dia
  })
}

interface Resumen {
  ventasHoyCantidad: number
  ventasHoyTotal: number
  ventasAyerTotal: number
  medioPagoPrincipal: { medio: MedioPago; porcentaje: number } | null
  pedidosPendientes: number
  stockBajoMinimo: number
  enviosPendientes: number
  ventasUltimos7Dias: Array<{ fecha: Date; total: number }>
  productosMasVendidos: ProductoVendido[]
}

const ACCESOS_RAPIDOS = [
  { to: '/ventas', titulo: 'Nueva venta', descripcion: 'Cobrar en el mostrador' },
  { to: '/productos/nuevo', titulo: 'Agregar producto', descripcion: 'Alta con variantes' },
  { to: '/clientes/nuevo', titulo: 'Nuevo cliente', descripcion: 'Cargar datos y dirección' },
  { to: '/envios/nuevo', titulo: 'Preparar envío', descripcion: 'Desde un pedido pendiente' },
  { to: '/stock', titulo: 'Ver stock', descripcion: 'Consultar y ajustar' },
]

// Pantalla de inicio: bienvenida + accesos rápidos a las acciones más
// frecuentes + una foto del día (ventas de hoy, qué necesita atención).
// Los tres datos de "atención" (pendientes, bajo mínimo, envíos) enlazan
// directo a la vista ya filtrada correspondiente (?estado=, ?bajoMinimo=)
// en vez de mandar a la lista general — el objetivo es que desde acá se
// llegue en un clic a lo que hay que resolver hoy, no solo mostrar un
// número.
export function InicioPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null)

  useEffect(() => {
    let cancelado = false
    const dias = ultimosNDias(7)
    Promise.all([
      listarVentas({ desde: dias[0].toISOString(), estado: 'COMPLETADA' }),
      listarVentas({ estado: 'PENDIENTE' }),
      listarStock({ bajoMinimo: true }),
      listarStock(),
      listarEnvios(),
    ]).then(([ventasUltimaSemana, pedidosPendientes, stockBajo, stockCompleto, envios]) => {
      if (cancelado) return

      // Stock actual por producto (sumando todas sus variantes) — para el
      // % vendido de "Productos más vendidos": es a nivel modelo, no por
      // variante suelta.
      const stockPorProducto = new Map<number, number>()
      for (const { producto, variante } of stockCompleto) {
        stockPorProducto.set(producto.id, (stockPorProducto.get(producto.id) ?? 0) + variante.stock)
      }

      const totalPorDia = new Map(dias.map((dia) => [claveDiaLocal(dia), 0]))
      for (const venta of ventasUltimaSemana) {
        const clave = claveDiaLocal(new Date(venta.fechaVenta))
        totalPorDia.set(clave, (totalPorDia.get(clave) ?? 0) + venta.total)
      }

      const claveHoy = claveDiaLocal(new Date())
      const ventasHoy = ventasUltimaSemana.filter(
        (venta) => claveDiaLocal(new Date(venta.fechaVenta)) === claveHoy,
      )
      const ventasAyerTotal = totalPorDia.get(claveDiaLocal(dias[dias.length - 2])) ?? 0

      const montoPorMedio = new Map<MedioPago, number>()
      for (const venta of ventasHoy) {
        for (const pago of venta.pagos) {
          montoPorMedio.set(pago.medioPago, (montoPorMedio.get(pago.medioPago) ?? 0) + pago.monto)
        }
      }
      const totalPagosHoy = [...montoPorMedio.values()].reduce((acc, m) => acc + m, 0)
      let medioPagoPrincipal: Resumen['medioPagoPrincipal'] = null
      if (totalPagosHoy > 0) {
        const [medio, monto] = [...montoPorMedio.entries()].sort((a, b) => b[1] - a[1])[0]
        medioPagoPrincipal = { medio, porcentaje: monto / totalPagosHoy }
      }

      const porProducto = new Map<number, ProductoVendido>()
      for (const venta of ventasUltimaSemana) {
        for (const detalle of venta.detalles) {
          const acumulado = porProducto.get(detalle.producto.id)
          if (acumulado) {
            acumulado.cantidad += detalle.cantidad
            acumulado.monto += detalle.subtotal
          } else {
            porProducto.set(detalle.producto.id, {
              productoId: detalle.producto.id,
              nombre: detalle.producto.nombre,
              cantidad: detalle.cantidad,
              monto: detalle.subtotal,
              stockActual: stockPorProducto.get(detalle.producto.id) ?? 0,
            })
          }
        }
      }
      const productosMasVendidos = [...porProducto.values()]
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5)

      setResumen({
        ventasHoyCantidad: ventasHoy.length,
        ventasHoyTotal: ventasHoy.reduce((acc, v) => acc + v.total, 0),
        ventasAyerTotal,
        medioPagoPrincipal,
        pedidosPendientes: pedidosPendientes.length,
        stockBajoMinimo: stockBajo.length,
        enviosPendientes: envios.filter(
          (e) => e.estadoEnvio !== 'ENTREGADO' && e.estadoEnvio !== 'CANCELADO',
        ).length,
        ventasUltimos7Dias: dias.map((dia) => ({
          fecha: dia,
          total: totalPorDia.get(claveDiaLocal(dia)) ?? 0,
        })),
        productosMasVendidos,
      })
    })
    return () => {
      cancelado = true
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{saludo()}</h1>
      <p className="mt-1 text-sm capitalize text-gray-500">{formatFecha.format(new Date())}</p>

      <h2 className="mt-6 text-sm font-semibold text-gray-900">Accesos rápidos</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACCESOS_RAPIDOS.map((acceso) => (
          <Link
            key={acceso.to}
            to={acceso.to}
            className="rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-900">{acceso.titulo}</p>
            <p className="mt-0.5 text-xs text-gray-500">{acceso.descripcion}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-6 text-sm font-semibold text-gray-900">Panorama de hoy</h2>
      <div className="mt-2">
        {resumen === null ? (
          <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500">
            Cargando...
          </div>
        ) : (
          <PanoramaHoy
            totalHoy={resumen.ventasHoyTotal}
            cantidadHoy={resumen.ventasHoyCantidad}
            totalAyer={resumen.ventasAyerTotal}
            medioPagoPrincipal={resumen.medioPagoPrincipal}
          />
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          to="/ventas/historial?estado=PENDIENTE"
          className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:bg-gray-50"
        >
          <p className="text-xs text-gray-500">Pedidos pendientes</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              resumen !== null && resumen.pedidosPendientes > 0 ? 'text-amber-600' : 'text-gray-900'
            }`}
          >
            {resumen === null ? '—' : resumen.pedidosPendientes}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Esperan pago o retiro</p>
        </Link>

        <Link
          to="/stock?bajoMinimo=1"
          className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:bg-gray-50"
        >
          <p className="text-xs text-gray-500">Stock bajo mínimo</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              resumen !== null && resumen.stockBajoMinimo > 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {resumen === null ? '—' : resumen.stockBajoMinimo}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Variantes para reponer</p>
        </Link>

        <Link
          to="/envios"
          className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:bg-gray-50"
        >
          <p className="text-xs text-gray-500">Envíos pendientes</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {resumen === null ? '—' : resumen.enviosPendientes}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Sin entregar todavía</p>
        </Link>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-gray-900">Tendencia</h2>
      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {resumen === null ? (
          <>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
              Cargando...
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
              Cargando...
            </div>
          </>
        ) : (
          <>
            <VentasUltimosDiasChart datos={resumen.ventasUltimos7Dias} />
            <ProductosMasVendidos datos={resumen.productosMasVendidos} />
          </>
        )}
      </div>
    </div>
  )
}
