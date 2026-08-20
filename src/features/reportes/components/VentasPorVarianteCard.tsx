import type { Venta } from '../../../types/venta'
import { formatPrecio, formatPorcentaje } from '../../../shared/format'
import {
  agruparPorColor,
  agruparPorTalla,
  agruparPorVariante,
} from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

interface VentasPorVarianteCardProps {
  ventas: Venta[]
}

export function VentasPorVarianteCard({ ventas }: VentasPorVarianteCardProps) {
  const variantes = agruparPorVariante(ventas).slice(0, 15)
  const colores = agruparPorColor(ventas)
  const tallas = agruparPorTalla(ventas)
  const totalMonto = variantes.reduce((acc, v) => acc + v.monto, 0)
  const maxVariante = Math.max(1, ...variantes.map((v) => v.monto))
  const maxColor = Math.max(1, ...colores.map((c) => c.monto))
  const maxTalla = Math.max(1, ...tallas.map((t) => t.monto))

  function exportarVariantes() {
    const headers = ['#', 'Color', 'Talle', 'SKU', 'Unidades', 'Facturación', '% del total']
    const rows = variantes.map((v, i) => [
      i + 1,
      v.colorNombre,
      v.tallaNombre,
      v.sku,
      v.unidades,
      v.monto,
      totalMonto > 0 ? v.monto / totalMonto : 0,
    ])
    exportarCsv('ventas-por-variante.csv', headers, rows)
  }

  function exportarColores() {
    const headers = ['Color', 'Unidades', 'Facturación', '% del total']
    const rows = colores.map((c) => [
      c.nombre,
      c.unidades,
      c.monto,
      totalMonto > 0 ? c.monto / totalMonto : 0,
    ])
    exportarCsv('ventas-por-color.csv', headers, rows)
  }

  function exportarTallas() {
    const headers = ['Talle', 'Unidades', 'Facturación', '% del total']
    const rows = tallas.map((t) => [
      t.nombre,
      t.unidades,
      t.monto,
      totalMonto > 0 ? t.monto / totalMonto : 0,
    ])
    exportarCsv('ventas-por-talla.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Ventas por variante
        </h3>
        <button
          onClick={exportarVariantes}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      {variantes.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Sin ventas en este período.</p>
      ) : (
        <>
          {/* Ranking de variantes */}
          <div className="mt-4 space-y-1">
            {variantes.map((v, i) => (
              <div key={v.varianteId} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-xs text-gray-400">{i + 1}</span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                  style={{ backgroundColor: v.colorHex }}
                />
                <span className="w-16 shrink-0 truncate text-xs text-gray-600">
                  {v.colorNombre}
                </span>
                <span className="w-10 shrink-0 text-xs text-gray-500">
                  {v.tallaNombre}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-gray-900"
                      style={{ width: `${(v.monto / maxVariante) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {v.unidades} u. · {formatPrecio.format(v.monto)} ·{' '}
                  {formatPorcentaje.format(totalMonto > 0 ? v.monto / totalMonto : 0)}
                </span>
              </div>
            ))}
          </div>

          {/* Por color y por talle */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-500">Por color</h4>
                <button
                  onClick={exportarColores}
                  className="text-[11px] text-gray-400 hover:text-gray-600"
                >
                  CSV
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {colores.map((c) => (
                  <div key={c.colorId} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="w-20 shrink-0 truncate text-xs text-gray-600">
                      {c.nombre}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-gray-300"
                          style={{ width: `${(c.monto / maxColor) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] text-gray-500">
                      {c.unidades} u. · {formatPorcentaje.format(totalMonto > 0 ? c.monto / totalMonto : 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-500">Por talle</h4>
                <button
                  onClick={exportarTallas}
                  className="text-[11px] text-gray-400 hover:text-gray-600"
                >
                  CSV
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {tallas.map((t) => (
                  <div key={t.tallaId} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 truncate text-xs text-gray-600">
                      {t.nombre}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full bg-gray-300"
                          style={{ width: `${(t.monto / maxTalla) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] text-gray-500">
                      {t.unidades} u. · {formatPorcentaje.format(totalMonto > 0 ? t.monto / totalMonto : 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
