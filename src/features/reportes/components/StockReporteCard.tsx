import type { Producto, ProductoVariante } from '../../../types/producto'
import { agruparStockPorCategoria } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

interface StockReporteCardProps {
  stock: Array<{ producto: Producto; variante: ProductoVariante }>
}

export function StockReporteCard({ stock }: StockReporteCardProps) {
  const porCategoria = agruparStockPorCategoria(stock)
  const totalUnidades = stock.reduce((acc, { variante }) => acc + variante.stock, 0)
  const valorTotal = stock.reduce((acc, { producto, variante }) => {
    const precio = variante.precio ?? producto.precioBase
    return acc + variante.stock * precio
  }, 0)
  const bajoMinimo = stock.filter(({ variante }) => variante.stock < variante.stockMinimo).length
  const sinStock = stock.filter(({ variante }) => variante.stock === 0).length
  const maxCategoria = Math.max(1, ...porCategoria.map((c) => c.valorEstimado))

  const masStock = [...stock]
    .sort((a, b) => b.variante.stock - a.variante.stock)
    .slice(0, 10)

  const menosStock = [...stock]
    .filter(({ variante }) => variante.stock > 0)
    .sort((a, b) => a.variante.stock - b.variante.stock)
    .slice(0, 10)

  function exportarCategorias() {
    const headers = ['Categoría', 'Unidades', 'Valor estimado', 'Variantes', 'Bajo mínimo']
    const rows = porCategoria.map((c) => [
      c.categoriaNombre,
      c.unidades,
      c.valorEstimado,
      c.variantes,
      c.bajoMinimo,
    ])
    exportarCsv('stock-por-categoria.csv', headers, rows)
  }

  function exportarDetalles() {
    const headers = ['Producto', 'Color', 'Talle', 'SKU', 'Stock', 'Mínimo', 'Precio', 'Valor']
    const rows = stock.map(({ producto, variante }) => {
      const precio = variante.precio ?? producto.precioBase
      return [
        producto.nombre,
        variante.color.nombre,
        variante.talla.nombre,
        variante.sku,
        variante.stock,
        variante.stockMinimo,
        precio,
        variante.stock * precio,
      ]
    })
    exportarCsv('stock-detalle.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Stock y valorización</h3>
        <button
          onClick={exportarDetalles}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Total unidades</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">{totalUnidades}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Valor estimado</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {formatPrecio.format(valorTotal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Bajo mínimo</p>
          <p
            className={`mt-0.5 text-lg font-semibold ${
              bajoMinimo > 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {bajoMinimo}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Sin stock</p>
          <p
            className={`mt-0.5 text-lg font-semibold ${
              sinStock > 0 ? 'text-amber-600' : 'text-gray-900'
            }`}
          >
            {sinStock}
          </p>
        </div>
      </div>

      {/* Por categoría */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-500">Por categoría</h4>
          <button
            onClick={exportarCategorias}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            CSV
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {porCategoria.map((c) => (
            <div key={c.categoriaId} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs font-medium text-gray-700">
                {c.categoriaNombre}
              </span>
              <div className="min-w-0 flex-1">
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-gray-900"
                    style={{ width: `${(c.valorEstimado / maxCategoria) * 100}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-500">
                {c.unidades} u. · {formatPrecio.format(c.valorEstimado)} ·{' '}
                {c.variantes} variantes
                {c.bajoMinimo > 0 && (
                  <span className="ml-1 text-red-500">
                    · {c.bajoMinimo} bajo mín.
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top stock */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-medium text-gray-500">
            Mayor stock
          </h4>
          <div className="mt-2 space-y-1">
            {masStock.map(({ producto, variante }) => (
              <div
                key={variante.id}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full border border-gray-300"
                  style={{ backgroundColor: variante.color.codigoHex }}
                />
                <span className="truncate text-gray-700">
                  {producto.nombre}
                </span>
                <span className="text-gray-400">
                  {variante.color.nombre}/{variante.talla.nombre}
                </span>
                <span className="ml-auto font-semibold text-gray-900">
                  {variante.stock}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500">
            Menor stock (con disponible)
          </h4>
          <div className="mt-2 space-y-1">
            {menosStock.map(({ producto, variante }) => (
              <div
                key={variante.id}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full border border-gray-300"
                  style={{ backgroundColor: variante.color.codigoHex }}
                />
                <span className="truncate text-gray-700">
                  {producto.nombre}
                </span>
                <span className="text-gray-400">
                  {variante.color.nombre}/{variante.talla.nombre}
                </span>
                <span
                  className={`ml-auto font-semibold ${
                    variante.stock <= variante.stockMinimo
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}
                >
                  {variante.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
