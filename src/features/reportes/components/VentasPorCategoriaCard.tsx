import type { Producto } from '../../../types/producto'
import type { Venta } from '../../../types/venta'
import { formatPrecio, formatPorcentaje } from '../../../shared/format'
import { agruparPorCategoria } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

interface VentasPorCategoriaCardProps {
  ventas: Venta[]
  productos: Producto[]
}

export function VentasPorCategoriaCard({
  ventas,
  productos,
}: VentasPorCategoriaCardProps) {
  const datos = agruparPorCategoria(ventas, productos)
  const totalMonto = datos.reduce((acc, d) => acc + d.monto, 0)
  const max = Math.max(1, ...datos.map((d) => d.monto))

  function exportarDatos() {
    const headers = ['Categoría', 'Unidades vendidas', 'Facturación', '% del total']
    const rows = datos.map((d) => [
      d.categoriaNombre,
      d.unidades,
      d.monto,
      totalMonto > 0 ? d.monto / totalMonto : 0,
    ])
    exportarCsv('ventas-por-categoria.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Ventas por categoría</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {datos.length} categorías · {formatPrecio.format(totalMonto)} total
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
        <div className="mt-4 space-y-2">
          {datos.map((d) => {
            const esPrimero = d.monto === max
            return (
              <div key={d.categoriaId} className="flex items-center gap-3">
                <span
                  className={`w-40 shrink-0 truncate text-xs ${
                    esPrimero ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {d.categoriaNombre}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className={`h-1.5 rounded-full ${
                        esPrimero ? 'bg-gray-900' : 'bg-gray-300'
                      }`}
                      style={{ width: `${(d.monto / max) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {d.unidades} u. · {formatPrecio.format(d.monto)} ·{' '}
                  {formatPorcentaje.format(totalMonto > 0 ? d.monto / totalMonto : 0)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
