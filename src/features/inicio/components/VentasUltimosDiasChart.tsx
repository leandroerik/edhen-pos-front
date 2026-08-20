import { useState } from 'react'
import { formatPrecio } from '../../../shared/format'

const formatDiaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const formatFechaTooltip = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

interface Punto {
  fecha: Date
  total: number
}

interface VentasUltimosDiasChartProps {
  datos: Punto[]
}

// Barra de 24px de ancho: el tope recomendado para que siga leyéndose como
// una barra fina y no un bloque — el resto del "más grande" sale de subir
// el alto del gráfico, no de engordar la barra.
const BAR_W = 24
const GAP = 12
const CHART_H = 120
const LABEL_H = 18
// Headroom reservado arriba de la barra más alta posible, para que el
// valor de "Hoy" (label directo, siempre visible) nunca quede pegado al
// borde del gráfico ni se recorte.
const HEADROOM = 30

// Bloque de barra con esquina superior redondeada y base cuadrada, creciendo
// desde la línea de base — no un <rect rx> (que redondea las cuatro
// esquinas).
function trazoBarra(x: number, alturaBarra: number): string {
  const r = Math.min(4, BAR_W / 2, alturaBarra)
  const y = CHART_H - alturaBarra
  return `M ${x} ${CHART_H} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${
    x + BAR_W - r
  } ${y} Q ${x + BAR_W} ${y} ${x + BAR_W} ${y + r} L ${x + BAR_W} ${CHART_H} Z`
}

// Una sola serie (total vendido por día) → un solo color gris, en línea con
// la paleta sobria del resto de la app en vez de introducir un acento de
// color nuevo. "Hoy" (la última barra) se destaca en gris oscuro con su
// valor directo arriba — es "emphasis": el día que importa hoy resaltado,
// el resto como contexto histórico — así el número más relevante se lee
// sin hover. El resto de los días siguen con tooltip al pasar el mouse o
// enfocar con teclado. Sin eje Y ni grilla — con solo 7 barras no hace
// falta la escala completa para orientarse.
export function VentasUltimosDiasChart({ datos }: VentasUltimosDiasChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const max = Math.max(1, ...datos.map((d) => d.total))
  const ancho = datos.length * BAR_W + (datos.length - 1) * GAP
  const indexHoy = datos.length - 1
  const totalSemana = datos.reduce((acc, d) => acc + d.total, 0)

  const barras = datos.map((punto, i) => {
    const proporcional = punto.total <= 0 ? 0 : (punto.total / max) * (CHART_H - HEADROOM)
    const alturaBarra = Math.max(proporcional, punto.total > 0 ? 3 : 2)
    return { punto, x: i * (BAR_W + GAP), alturaBarra, esHoy: i === indexHoy }
  })

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-gray-500">Ventas de los últimos 7 días</p>
        <p className="text-sm font-semibold text-gray-900">{formatPrecio.format(totalSemana)}</p>
      </div>

      <div className="relative mt-4" style={{ width: ancho, height: CHART_H + LABEL_H }}>
        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-sm text-white shadow-sm"
            style={{ left: hoverIndex * (BAR_W + GAP) + BAR_W / 2 }}
          >
            <span className="font-medium">{formatPrecio.format(datos[hoverIndex].total)}</span>
            <span className="ml-1 text-gray-400">
              {formatFechaTooltip.format(datos[hoverIndex].fecha)}
            </span>
          </div>
        )}

        {hoverIndex !== indexHoy && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-gray-900"
            style={{
              left: barras[indexHoy].x + BAR_W / 2,
              top: CHART_H - barras[indexHoy].alturaBarra - 20,
            }}
          >
            {formatPrecio.format(barras[indexHoy].punto.total)}
          </div>
        )}

        <svg width={ancho} height={CHART_H}>
          {barras.map(({ punto, x, alturaBarra, esHoy }, i) => (
            <path
              key={i}
              d={trazoBarra(x, alturaBarra)}
              className={hoverIndex === i || esHoy ? 'fill-gray-900' : 'fill-gray-300'}
              tabIndex={0}
              aria-label={`${formatFechaTooltip.format(punto.fecha)}: ${formatPrecio.format(punto.total)}`}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onFocus={() => setHoverIndex(i)}
              onBlur={() => setHoverIndex(null)}
            />
          ))}
        </svg>

        <div className="mt-1.5 flex">
          {datos.map((punto, i) => (
            <span
              key={i}
              className={`text-center text-xs ${
                i === indexHoy ? 'font-semibold text-gray-700' : 'capitalize text-gray-400'
              }`}
              style={{ width: BAR_W, marginRight: i < datos.length - 1 ? GAP : 0 }}
            >
              {i === indexHoy ? 'Hoy' : formatDiaCorto.format(punto.fecha)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
