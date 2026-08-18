import type { Venta } from '../../../types/venta'
import { calcularResumen, calcularVariacion } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'
import { SelectorPeriodo } from './SelectorPeriodo'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatPorcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const ATAJOS_COMPARACION = [
  { clave: 'semana', label: 'Esta semana', desde: inicioSemana(), hasta: new Date() },
  { clave: 'mes', label: 'Este mes', desde: inicioMes(), hasta: new Date() },
  { clave: 'trim', label: 'Trimestre', desde: inicioTrimestre(), hasta: new Date() },
]

function inicioSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function inicioMes(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function inicioTrimestre(): Date {
  const d = new Date()
  const quarter = Math.floor(d.getMonth() / 3)
  d.setMonth(quarter * 3, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function toInputDate(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface ComparacionPeriodosControlProps {
  desdeA: string
  hastaA: string
  atajoA: string | null
  desdeB: string
  hastaB: string
  atajoB: string | null
  onChangeA: (desde: string, hasta: string, atajo: string | null) => void
  onChangeB: (desde: string, hasta: string, atajo: string | null) => void
}

export function ComparacionPeriodosControl({
  desdeA,
  hastaA,
  atajoA,
  desdeB,
  hastaB,
  atajoB,
  onChangeA,
  onChangeB,
}: ComparacionPeriodosControlProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <SelectorPeriodo
        label="Período A (actual)"
        desde={desdeA}
        hasta={hastaA}
        atajoActivo={atajoA}
        atajos={ATAJOS_COMPARACION}
        onChange={onChangeA}
      />
      <SelectorPeriodo
        label="Período B (anterior)"
        desde={desdeB}
        hasta={hastaB}
        atajoActivo={atajoB}
        atajos={ATAJOS_COMPARACION}
        onChange={onChangeB}
      />
    </div>
  )
}

interface ComparacionPeriodosCardProps {
  ventasA: Venta[]
  ventasB: Venta[]
}

export function ComparacionPeriodosCard({
  ventasA,
  ventasB,
}: ComparacionPeriodosCardProps) {
  const resA = calcularResumen(ventasA)
  const resB = calcularResumen(ventasB)

  const unidadesA = ventasA.reduce(
    (acc, v) => acc + v.detalles.reduce((a, d) => a + d.cantidad, 0),
    0,
  )
  const unidadesB = ventasB.reduce(
    (acc, v) => acc + v.detalles.reduce((a, d) => a + d.cantidad, 0),
    0,
  )

  const filas = [
    {
      label: 'Total facturado',
      variacion: calcularVariacion(resA.totalFacturado, resB.totalFacturado),
      formato: formatPrecio,
    },
    {
      label: 'Cantidad de ventas',
      variacion: calcularVariacion(resA.cantidadVentas, resB.cantidadVentas),
      formato: { format: (v: number) => String(v) },
    },
    {
      label: 'Ticket promedio',
      variacion: calcularVariacion(resA.ticketPromedio, resB.ticketPromedio),
      formato: formatPrecio,
    },
    {
      label: 'Unidades vendidas',
      variacion: calcularVariacion(unidadesA, unidadesB),
      formato: { format: (v: number) => String(v) },
    },
  ]

  function exportarDatos() {
    const headers = ['Métrica', 'Período A', 'Período B', 'Variación %']
    const rows = filas.map((f) => [
      f.label,
      f.variacion.actual,
      f.variacion.anterior,
      f.variacion.porcentaje,
    ])
    exportarCsv('comparacion-periodos.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Comparación de períodos
        </h3>
        <button
          onClick={exportarDatos}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Período A (actual)</p>
          <p className="mt-0.5 text-xl font-semibold text-gray-900">
            {formatPrecio.format(resA.totalFacturado)}
          </p>
          <p className="text-xs text-gray-400">
            {resA.cantidadVentas} ventas · {unidadesA} unidades
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Período B (anterior)</p>
          <p className="mt-0.5 text-xl font-semibold text-gray-900">
            {formatPrecio.format(resB.totalFacturado)}
          </p>
          <p className="text-xs text-gray-400">
            {resB.cantidadVentas} ventas · {unidadesB} unidades
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Métrica
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Período A
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Período B
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filas.map((fila) => (
              <tr key={fila.label}>
                <td className="px-4 py-2.5 text-sm text-gray-700">{fila.label}</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">
                  {fila.formato.format(fila.variacion.actual)}
                </td>
                <td className="px-4 py-2.5 text-right text-sm text-gray-600">
                  {fila.formato.format(fila.variacion.anterior)}
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-medium">
                  {fila.variacion.direccion === 'igual' ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <span
                      className={
                        fila.variacion.direccion === 'sube'
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }
                    >
                      {fila.variacion.direccion === 'sube' ? '↑' : '↓'}{' '}
                      {formatPorcentaje.format(Math.abs(fila.variacion.porcentaje))}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
