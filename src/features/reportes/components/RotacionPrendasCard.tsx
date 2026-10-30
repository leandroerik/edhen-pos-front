import { useState } from 'react'
import type { Producto, ProductoVariante } from '../../../types/producto'
import type { Venta } from '../../../types/venta'
import { formatPrecio } from '../../../shared/format'
import { calcularRotacionPrendas } from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

interface RotacionPrendasCardProps {
  ventas: Venta[]
  stock: Array<{ producto: Producto; variante: ProductoVariante }>
}

type TabRotacion = 'estrellas' | 'estancadas'

export function RotacionPrendasCard({ ventas, stock }: RotacionPrendasCardProps) {
  const [tab, setTab] = useState<TabRotacion>('estrellas')
  const [busqueda, setBusqueda] = useState('')

  const { estrellas, estancadas, valorCapitalEstancado, totalEstancadas, totalEstrellas } =
    calcularRotacionPrendas(ventas, stock)

  const listaActual = tab === 'estrellas' ? estrellas : estancadas
  const listaFiltrada = listaActual.filter(
    (p) =>
      p.nombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoriaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.colorNombre.toLowerCase().includes(busqueda.toLowerCase()),
  )

  function exportarEstrellas() {
    const headers = [
      'Producto',
      'Categoría',
      'Color',
      'Talle',
      'SKU',
      'Vendidas (Uds)',
      'Total Facturado ($)',
      'Stock Actual',
      'Stock Mínimo',
      'Alerta',
    ]
    const rows = estrellas.map((p) => [
      p.nombreProducto,
      p.categoriaNombre,
      p.colorNombre,
      p.tallaNombre,
      p.sku,
      p.unidadesVendidas,
      p.totalFacturado,
      p.stockActual,
      p.stockMinimo,
      p.stockActual <= 0 ? 'AGOTADO' : 'STOCK CRÍTICO',
    ])
    exportarCsv('prendas-estrella-reponer.csv', headers, rows)
  }

  function exportarEstancadas() {
    const headers = [
      'Producto',
      'Categoría',
      'Color',
      'Talle',
      'SKU',
      'Stock Parado',
      'Precio Lista',
      'Capital Inmovilizado ($)',
    ]
    const rows = estancadas.map((p) => [
      p.nombreProducto,
      p.categoriaNombre,
      p.colorNombre,
      p.tallaNombre,
      p.sku,
      p.stockActual,
      p.precioUnitario,
      p.stockActual * p.precioUnitario,
    ])
    exportarCsv('prendas-estancadas-liquidacion.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      {/* Header y Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Rotación de Ropa: Inteligencia de Inventario
          </h3>
          <p className="text-xs text-gray-500">
            Detecta qué prendas requieren reposición urgente y cuáles están inmovilizadas sin ventas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-gray-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTab('estrellas')}
              className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
                tab === 'estrellas'
                  ? 'bg-white text-amber-900 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>⭐ Prendas Estrella ({totalEstrellas})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('estancadas')}
              className={`flex items-center gap-1.5 rounded px-3 py-1 transition-colors ${
                tab === 'estancadas'
                  ? 'bg-white text-rose-900 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>⏳ Sin Rotación ({totalEstancadas})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={tab === 'estrellas' ? exportarEstrellas : exportarEstancadas}
            className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Tarjeta de Resumen según Tab activo */}
      {tab === 'estrellas' ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900">
          <div className="flex items-center justify-between font-medium">
            <span>🔥 Alta Demanda & Stock Crítico</span>
            <span className="rounded bg-amber-200/80 px-2 py-0.5 font-bold">
              {totalEstrellas} prenda{totalEstrellas === 1 ? '' : 's'} a reponer
            </span>
          </div>
          <p className="mt-1 text-amber-800/90 text-[11px]">
            Estas prendas se vendieron bien durante el período y tienen stock bajo o próximo a agotarse. 
            Te sugerimos encargar o fabricar reposición de estas variantes prioritariamente.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-900">
          <div className="flex items-center justify-between font-medium">
            <span>🧊 Capital Inmovilizado / Mercadería Parada</span>
            <span className="rounded bg-rose-200/80 px-2 py-0.5 font-bold">
              {formatPrecio.format(valorCapitalEstancado)} parados
            </span>
          </div>
          <p className="mt-1 text-rose-800/90 text-[11px]">
            Hay <strong>{totalEstancadas} variantes con stock</strong> que registraron 0 ventas en este período. 
            Sugerencia: Aplicar ofertas 2x1, descuentos en mostrador o destacarlas en percheros principales.
          </p>
        </div>
      )}

      {/* Buscador interno */}
      <div className="mt-3">
        <input
          type="text"
          placeholder="Buscar por prenda, categoría, color o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
        />
      </div>

      {/* Tabla de Resultados */}
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
        <div className="max-h-72 overflow-y-auto">
          {listaFiltrada.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              {tab === 'estrellas'
                ? 'No hay prendas en situación crítica de stock con ventas en el período.'
                : 'No se encontraron prendas estancadas con los filtros actuales.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 uppercase tracking-wide text-gray-500 text-[10px]">
                <tr>
                  <th className="px-3 py-2 font-medium">Prenda</th>
                  <th className="px-3 py-2 font-medium">Categoría</th>
                  <th className="px-3 py-2 font-medium">Color / Talle</th>
                  {tab === 'estrellas' ? (
                    <>
                      <th className="px-3 py-2 text-right font-medium">Vendidas</th>
                      <th className="px-3 py-2 text-right font-medium">Facturado</th>
                      <th className="px-3 py-2 text-right font-medium">Stock Restante</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2 text-right font-medium">Stock Parado</th>
                      <th className="px-3 py-2 text-right font-medium">Precio Unit.</th>
                      <th className="px-3 py-2 text-right font-medium">Valor Parado</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listaFiltrada.map((p) => (
                  <tr key={p.varianteId} className="hover:bg-gray-50/70">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {p.nombreProducto}
                      <span className="block font-mono text-[10px] text-gray-400">{p.sku}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{p.categoriaNombre}</td>
                    <td className="px-3 py-2 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        {p.colorHex && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full border border-gray-300"
                            style={{ backgroundColor: p.colorHex }}
                          />
                        )}
                        <span>{p.colorNombre} / Talle {p.tallaNombre}</span>
                      </div>
                    </td>

                    {tab === 'estrellas' ? (
                      <>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                          {p.unidadesVendidas} u.
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {formatPrecio.format(p.totalFacturado)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              p.stockActual <= 0
                                ? 'bg-red-100 text-red-800'
                                : p.stockActual <= p.stockMinimo
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {p.stockActual <= 0 ? 'AGOTADO' : `${p.stockActual} u. (Mín: ${p.stockMinimo})`}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 text-right font-semibold text-rose-700">
                          {p.stockActual} u.
                        </td>
                        <td className="px-3 py-2 text-right text-gray-500">
                          {formatPrecio.format(p.precioUnitario)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {formatPrecio.format(p.stockActual * p.precioUnitario)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
