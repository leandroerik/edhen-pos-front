import { useState } from 'react'
import type { Venta } from '../../../types/venta'
import { formatPrecio } from '../../../shared/format'
import { agruparPorDia, agruparPorSemana } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

const formatDiaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const formatFechaCorta = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
})

const BAR_W = 24
const GAP = 8
const CHART_H = 140
const LABEL_H = 18
const HEADROOM = 30

function trazoBarra(x: number, alturaBarra: number): string {
  const r = Math.min(4, BAR_W / 2, alturaBarra)
  const y = CHART_H - alturaBarra
  return `M ${x} ${CHART_H} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${
    x + BAR_W - r
  } ${y} Q ${x + BAR_W} ${y} ${x + BAR_W} ${y + r} L ${x + BAR_W} ${CHART_H} Z`
}

interface VentasPorPeriodoCardProps {
  ventas: Venta[]
}

export function VentasPorPeriodoCard({ ventas }: VentasPorPeriodoCardProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const agrupadoDia = agruparPorDia(ventas)
  const agrupadoSemana = agruparPorSemana(ventas)
  const usarSemanas = agrupadoDia.length > 40
  const datos = usarSemanas ? agrupadoSemana : agrupadoDia

  const total = datos.reduce((acc, d) => acc + d.total, 0)
  const max = Math.max(1, ...datos.map((d) => d.total))
  const ancho = datos.length * BAR_W + (datos.length - 1) * GAP

  const barras = datos.map((punto, i) => {
    const proporcional = punto.total <= 0 ? 0 : (punto.total / max) * (CHART_H - HEADROOM)
    const alturaBarra = Math.max(proporcional, punto.total > 0 ? 3 : 2)
    return { punto, x: i * (BAR_W + GAP), alturaBarra }
  })

  function formatoLabel(punto: { clave: string; fecha?: Date; inicio?: Date }): string {
    const fecha = punto.fecha ?? punto.inicio
    if (!fecha) return punto.clave
    if (usarSemanas) return formatFechaCorta.format(fecha)
    return formatDiaCorto.format(fecha)
  }

  function exportarDatos() {
    const headers = ['Fecha', 'Total', 'Cantidad de ventas']
    const rows = datos.map((d) => [
      d.clave,
      d.total,
      d.cantidad,
    ])
    exportarCsv('ventas-por-periodo.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Ventas por {usarSemanas ? 'semana' : 'día'}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {datos.length} {usarSemanas ? 'semanas' : 'días'} ·{' '}
            {formatPrecio.format(total)} total
          </p>
        </div>
        <button
          onClick={exportarDatos}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      {datos.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Sin ventas en este período.</p>
      ) : (
        <>
          <div className="relative mt-4" style={{ width: '100%', height: CHART_H + LABEL_H }}>
            {hoverIndex !== null && hoverIndex < datos.length && (
              <div
                className="pointer-events-none absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-sm text-white shadow-sm"
                style={{ left: hoverIndex * (BAR_W + GAP) + BAR_W / 2 }}
              >
                <span className="font-medium">
                  {formatPrecio.format(datos[hoverIndex].total)}
                </span>
                <span className="ml-1 text-gray-400">
                  {formatoLabel(datos[hoverIndex])}
                </span>
              </div>
            )}

            <svg
              width={ancho}
              height={CHART_H}
              style={{ maxWidth: '100%', overflow: 'visible' }}
            >
              {barras.map(({ punto, x, alturaBarra }, i) => (
                <path
                  key={i}
                  d={trazoBarra(x, alturaBarra)}
                  className={
                    hoverIndex === i
                      ? 'fill-gray-900'
                      : 'fill-gray-300 hover:fill-gray-400'
                  }
                  tabIndex={0}
                  aria-label={`${formatoLabel(punto)}: ${formatPrecio.format(punto.total)}`}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onFocus={() => setHoverIndex(i)}
                  onBlur={() => setHoverIndex(null)}
                />
              ))}
            </svg>

            <div className="mt-1.5 flex" style={{ width: ancho }}>
              {datos.map((punto, i) => (
                <span
                  key={i}
                  className="text-center text-[10px] capitalize text-gray-400"
                  style={{ width: BAR_W, marginRight: i < datos.length - 1 ? GAP : 0 }}
                >
                  {formatoLabel(punto)}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
