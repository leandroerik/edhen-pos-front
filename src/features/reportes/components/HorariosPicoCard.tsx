import { useState } from 'react'
import type { Venta } from '../../../types/venta'
import { formatPrecio } from '../../../shared/format'
import { agruparPorDiaSemana, agruparPorHora } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

interface HorariosPicoCardProps {
  ventas: Venta[]
}

type Metrica = 'monto' | 'cantidad'
type Vista = 'horas' | 'dias'

export function HorariosPicoCard({ ventas }: HorariosPicoCardProps) {
  const [metrica, setMetrica] = useState<Metrica>('monto')
  const [vista, setVista] = useState<Vista>('horas')

  const datosHoras = agruparPorHora(ventas)
  const datosDias = agruparPorDiaSemana(ventas)

  const totalMonto = ventas.reduce((acc, v) => acc + v.total, 0)
  const totalCantidad = ventas.length

  // Encontrar picos
  const horasConVentas = datosHoras.filter((h) => (metrica === 'monto' ? h.total > 0 : h.cantidad > 0))
  const horaPico = horasConVentas.length > 0
    ? [...horasConVentas].sort((a, b) => (metrica === 'monto' ? b.total - a.total : b.cantidad - a.cantidad))[0]
    : null

  const diaPico = [...datosDias].sort((a, b) =>
    metrica === 'monto' ? b.total - a.total : b.cantidad - a.cantidad,
  )[0]

  const maxHora = Math.max(1, ...datosHoras.map((h) => (metrica === 'monto' ? h.total : h.cantidad)))
  const maxDia = Math.max(1, ...datosDias.map((d) => (metrica === 'monto' ? d.total : d.cantidad)))

  function exportarHoras() {
    const headers = ['Franja Horaria', 'Facturación Total ($)', 'Cantidad Ventas', 'Ticket Promedio', 'Unidades']
    const rows = datosHoras.map((h) => [
      h.etiqueta,
      h.total,
      h.cantidad,
      h.ticketPromedio,
      h.unidades,
    ])
    exportarCsv('ventas-por-horario.csv', headers, rows)
  }

  function exportarDias() {
    const headers = ['Día de la Semana', 'Facturación Total ($)', 'Cantidad Ventas', 'Ticket Promedio', 'Unidades']
    const rows = datosDias.map((d) => [
      d.diaNombre,
      d.total,
      d.cantidad,
      d.ticketPromedio,
      d.unidades,
    ])
    exportarCsv('ventas-por-dia-semana.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Horarios Pico y Días de Mayor Facturación
          </h3>
          <p className="text-xs text-gray-500">
            Identifica las franjas horarias y días donde el local genera mayor volumen de dinero y ventas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de vista (Horas vs Días) */}
          <div className="flex rounded-md bg-gray-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setVista('horas')}
              className={`rounded px-2.5 py-1 transition-colors ${
                vista === 'horas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Por Hora
            </button>
            <button
              type="button"
              onClick={() => setVista('dias')}
              className={`rounded px-2.5 py-1 transition-colors ${
                vista === 'dias' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Por Día
            </button>
          </div>

          {/* Toggle Métrica ($ vs #) */}
          <div className="flex rounded-md bg-gray-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMetrica('monto')}
              className={`rounded px-2.5 py-1 transition-colors ${
                metrica === 'monto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              $ Dinero
            </button>
            <button
              type="button"
              onClick={() => setMetrica('cantidad')}
              className={`rounded px-2.5 py-1 transition-colors ${
                metrica === 'cantidad' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              # Ventas
            </button>
          </div>

          <button
            type="button"
            onClick={vista === 'horas' ? exportarHoras : exportarDias}
            className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Tarjetas de Insights destacados */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-indigo-700">
              ⚡ Franja Horaria de Oro
            </span>
            {horaPico && (
              <span className="rounded-full bg-indigo-200/60 px-2 py-0.5 text-[11px] font-semibold text-indigo-800">
                {horaPico.cantidad} transacciones
              </span>
            )}
          </div>
          {horaPico ? (
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-gray-900">{horaPico.etiqueta}</span>
              <span className="text-sm font-semibold text-indigo-900">
                {formatPrecio.format(horaPico.total)}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Sin ventas en el período seleccionado.</p>
          )}
        </div>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              📅 Día de Mayor Facturación
            </span>
            {diaPico && diaPico.total > 0 && (
              <span className="rounded-full bg-emerald-200/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                {diaPico.cantidad} ventas
              </span>
            )}
          </div>
          {diaPico && diaPico.total > 0 ? (
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-gray-900">{diaPico.diaNombre}</span>
              <span className="text-sm font-semibold text-emerald-900">
                {formatPrecio.format(diaPico.total)}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Sin datos de ventas.</p>
          )}
        </div>
      </div>

      {/* Visualización por Hora */}
      {vista === 'horas' && (
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-medium text-gray-500">
            Distribución por franja horaria ({metrica === 'monto' ? 'Monto recaudado' : 'Cantidad de transacciones'})
          </h4>
          <div className="space-y-1.5">
            {datosHoras
              .filter((h) => h.total > 0 || (h.hora >= 9 && h.hora <= 21))
              .map((h) => {
                const valor = metrica === 'monto' ? h.total : h.cantidad
                const porcentajeMax = (valor / maxHora) * 100
                const esPico = horaPico?.hora === h.hora && valor > 0

                return (
                  <div key={h.hora} className="flex items-center gap-3">
                    <span
                      className={`w-28 shrink-0 font-mono text-xs ${
                        esPico ? 'font-bold text-indigo-700' : 'text-gray-600'
                      }`}
                    >
                      {String(h.hora).padStart(2, '0')}:00 - {String(h.hora).padStart(2, '0')}:59
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            esPico ? 'bg-indigo-600' : 'bg-gray-800'
                          }`}
                          style={{ width: `${porcentajeMax}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex w-36 shrink-0 items-center justify-end gap-2 text-right text-xs">
                      {metrica === 'monto' ? (
                        <>
                          <span className="font-medium text-gray-900">{formatPrecio.format(h.total)}</span>
                          <span className="text-[11px] text-gray-400">({h.cantidad} vtas)</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-gray-900">{h.cantidad} vtas</span>
                          <span className="text-[11px] text-gray-400">({formatPrecio.format(h.total)})</span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Visualización por Día de la Semana */}
      {vista === 'dias' && (
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-medium text-gray-500">
            Distribución por día ({metrica === 'monto' ? 'Monto recaudado' : 'Cantidad de transacciones'})
          </h4>
          <div className="space-y-2">
            {datosDias.map((d) => {
              const valor = metrica === 'monto' ? d.total : d.cantidad
              const porcentajeMax = (valor / maxDia) * 100
              const porcentajeTotal =
                metrica === 'monto'
                  ? totalMonto > 0 ? (d.total / totalMonto) * 100 : 0
                  : totalCantidad > 0 ? (d.cantidad / totalCantidad) * 100 : 0
              const esPico = diaPico?.diaNumero === d.diaNumero && valor > 0

              return (
                <div key={d.diaNumero} className="flex items-center gap-3">
                  <span
                    className={`w-24 shrink-0 text-xs ${
                      esPico ? 'font-bold text-emerald-700' : 'text-gray-700'
                    }`}
                  >
                    {d.diaNombre}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          esPico ? 'bg-emerald-600' : 'bg-gray-800'
                        }`}
                        style={{ width: `${porcentajeMax}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex w-44 shrink-0 items-center justify-end gap-2 text-right text-xs">
                    <span className="font-semibold text-gray-900">
                      {metrica === 'monto' ? formatPrecio.format(d.total) : `${d.cantidad} vtas`}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ({porcentajeTotal.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
