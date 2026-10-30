import type { Producto, ProductoVariante } from '../../../types/producto'
import type { Venta } from '../../../types/venta'
import { formatPrecio, formatPorcentaje } from '../../../shared/format'
import {
  agruparPorCanal,
  agruparPorMedioPago,
  calcularResumenEjecutivo,
} from '../lib/agregaciones'

interface ResumenEjecutivoModalProps {
  abierto: boolean
  desde: string
  hasta: string
  ventas: Venta[]
  productos: Producto[]
  stock: Array<{ producto: Producto; variante: ProductoVariante }>
  onCerrar: () => void
}

export function ResumenEjecutivoModal({
  abierto,
  desde,
  hasta,
  ventas,
  productos,
  stock,
  onCerrar,
}: ResumenEjecutivoModalProps) {
  if (!abierto) return null

  const resumen = calcularResumenEjecutivo(ventas, productos, stock)
  const porMedio = agruparPorMedioPago(ventas)
  const porCanal = agruparPorCanal(ventas)

  const fechaDesdeFormateada = new Date(desde + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const fechaHastaFormateada = new Date(hasta + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  function imprimir() {
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:static print:bg-white"
      onClick={onCerrar}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl print:max-h-none print:shadow-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de controles (se oculta al imprimir) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gray-50/95 px-6 py-3.5 backdrop-blur print:hidden">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Resumen Ejecutivo de Negocio
            </h2>
            <p className="text-xs text-gray-500">
              Período: {fechaDesdeFormateada} — {fechaHastaFormateada}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={imprimir}
              className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-gray-800"
            >
              <span>🖨️ Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Documento Imprimible */}
        <div className="p-8 text-gray-900 space-y-6">
          {/* Encabezado Formal */}
          <div className="border-b border-gray-300 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950">edhen POS</h1>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Informe Ejecutivo de Ventas y Rendimiento Comercial
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p className="font-semibold text-gray-700">
                  Rango: {fechaDesdeFormateada} al {fechaHastaFormateada}
                </p>
                <p>Generado el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
              </div>
            </div>
          </div>

          {/* 1. KPIs Principales de Facturación */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1 mb-3">
              1. Rendimiento Financiero
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <span className="text-[11px] font-medium text-gray-500">Facturación Bruta</span>
                <p className="text-lg font-bold text-gray-900">{formatPrecio.format(resumen.totalFacturado)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <span className="text-[11px] font-medium text-gray-500">Descuentos Otorgados</span>
                <p className="text-lg font-bold text-rose-700">{formatPrecio.format(resumen.totalDescuentos)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <span className="text-[11px] font-medium text-gray-500">Transacciones (Tickets)</span>
                <p className="text-lg font-bold text-gray-900">{resumen.cantidadVentas}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                <span className="text-[11px] font-medium text-gray-500">Ticket Promedio</span>
                <p className="text-lg font-bold text-gray-900">{formatPrecio.format(resumen.ticketPromedio)}</p>
              </div>
            </div>
          </div>

          {/* 2. Horarios y Días Clave */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1 mb-3">
              2. Horarios Pico y Días de Mayor Rentabilidad
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 text-xs">
                <span className="font-semibold text-indigo-900">⚡ Franja Horaria de Mayor Recaudación:</span>
                {resumen.horaPico ? (
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {resumen.horaPico.etiqueta} · {formatPrecio.format(resumen.horaPico.total)} ({resumen.horaPico.cantidad} ventas)
                  </p>
                ) : (
                  <p className="mt-1 text-gray-500">Sin datos</p>
                )}
              </div>

              <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-xs">
                <span className="font-semibold text-emerald-900">📅 Día de la Semana con Más Ventas:</span>
                {resumen.diaPico ? (
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {resumen.diaPico.diaNombre} · {formatPrecio.format(resumen.diaPico.total)} ({resumen.diaPico.cantidad} ventas)
                  </p>
                ) : (
                  <p className="mt-1 text-gray-500">Sin datos</p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Desglose de Medios de Pago y Canales */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1 mb-2">
                3. Cobranzas por Medio de Pago
              </h3>
              <div className="space-y-1.5 text-xs">
                {porMedio.map((m) => (
                  <div key={m.medio} className="flex items-center justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-700">{m.medio.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrecio.format(m.monto)}{' '}
                      <span className="text-[10px] font-normal text-gray-500">
                        ({formatPorcentaje.format(resumen.totalFacturado > 0 ? m.monto / resumen.totalFacturado : 0)})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1 mb-2">
                4. Ventas por Canal
              </h3>
              <div className="space-y-1.5 text-xs">
                {porCanal.map((c) => (
                  <div key={c.canal} className="flex items-center justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-700">{c.canal.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrecio.format(c.monto)}{' '}
                      <span className="text-[10px] font-normal text-gray-500">
                        ({formatPorcentaje.format(resumen.totalFacturado > 0 ? c.monto / resumen.totalFacturado : 0)})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Diagnóstico de Inventario & Ropa */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1 mb-3">
              5. Diagnóstico de Inventario y Rotación
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <span className="text-gray-500">Valor Total de Stock</span>
                <p className="mt-1 text-sm font-bold text-gray-900">{formatPrecio.format(resumen.stockValorTotal)}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <span className="text-amber-800 font-medium">Prendas a Reponer</span>
                <p className="mt-1 text-sm font-bold text-amber-900">{resumen.prendasCriticas} variantes críticas</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                <span className="text-rose-800 font-medium">Prendas Estancadas</span>
                <p className="mt-1 text-sm font-bold text-rose-900">{resumen.prendasEstancadas} sin ventas</p>
              </div>
            </div>
          </div>

          {/* Pie de página de cierre */}
          <div className="border-t border-gray-300 pt-4 text-center text-[11px] text-gray-400">
            edhen POS — Documento confidencial para gestión administrativa y comercial.
          </div>
        </div>
      </div>
    </div>
  )
}
