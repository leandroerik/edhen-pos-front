import { Link } from 'react-router-dom'
import type { Producto } from '../../../types/producto'
import type { Venta } from '../../../types/venta'
import { rankingProductos } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatPorcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

interface ProductosMasVendidosCardProps {
  ventas: Venta[]
  productos: Producto[]
}

export function ProductosMasVendidosCard({
  ventas,
  productos,
}: ProductosMasVendidosCardProps) {
  const datos = rankingProductos(ventas, productos, 10)
  const totalMonto = datos.reduce((acc, d) => acc + d.monto, 0)
  const max = Math.max(1, ...datos.map((d) => d.monto))

  function exportarDatos() {
    const headers = ['#', 'Producto', 'Categoría', 'Unidades', 'Facturación', '% del total']
    const rows = datos.map((d, i) => [
      i + 1,
      d.nombre,
      d.categoriaNombre,
      d.unidades,
      d.monto,
      totalMonto > 0 ? d.monto / totalMonto : 0,
    ])
    exportarCsv('productos-mas-vendidos.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Productos más vendidos
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Top {datos.length} · {formatPrecio.format(totalMonto)} total
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
        <div className="mt-4 space-y-1">
          {datos.map((item, i) => {
            const esPrimero = i === 0
            return (
              <Link
                key={item.productoId}
                to={`/productos/${item.productoId}`}
                className={`-mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50 ${
                  esPrimero ? 'bg-gray-50' : ''
                }`}
              >
                <span
                  className={`w-5 shrink-0 text-xs ${
                    esPrimero ? 'font-semibold text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm ${
                          esPrimero ? 'font-medium' : ''
                        } text-gray-900`}
                      >
                        {item.nombre}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.categoriaNombre}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-500">
                      {item.unidades} u. · {formatPrecio.format(item.monto)} ·{' '}
                      {formatPorcentaje.format(
                        totalMonto > 0 ? item.monto / totalMonto : 0,
                      )}{' '}
                      del total
                    </p>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                    <div
                      className={`h-1.5 rounded-full ${
                        esPrimero ? 'bg-gray-900' : 'bg-gray-300'
                      }`}
                      style={{ width: `${(item.monto / max) * 100}%` }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
