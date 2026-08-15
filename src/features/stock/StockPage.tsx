import { Fragment, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarStock } from '../../api/stock.api'
import { StockVarianteModal } from './components/StockVarianteModal'
import type { Producto, ProductoVariante } from '../../types/producto'

interface Fila {
  producto: Producto
  variante: ProductoVariante
}

interface Resultado {
  clave: string
  filas: Fila[]
}

interface GrupoProducto {
  producto: Producto
  variantes: ProductoVariante[]
  stockTotal: number
  bajoMinimoCount: number
}

export function StockPage() {
  // Permite entrar ya filtrado desde un acceso rápido (ej. Inicio → "Stock
  // bajo mínimo"), vía /stock?bajoMinimo=1.
  const [searchParams] = useSearchParams()
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(() => searchParams.get('bajoMinimo') === '1')
  const [busqueda, setBusqueda] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [productoExpandidoId, setProductoExpandidoId] = useState<number | null>(null)
  const [seleccion, setSeleccion] = useState<Fila | null>(null)

  const clave = JSON.stringify({ soloBajoMinimo, reloadToken })

  useEffect(() => {
    let cancelado = false
    listarStock({ bajoMinimo: soloBajoMinimo || undefined }).then((datos) => {
      if (cancelado) return
      setResultado({ clave, filas: datos })
    })
    return () => {
      cancelado = true
    }
  }, [soloBajoMinimo, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const filasCargadas = resultado?.clave === clave ? resultado.filas : []

  const texto = busqueda.trim().toLowerCase()
  const filas = texto
    ? filasCargadas.filter(
        ({ producto, variante }) =>
          producto.nombre.toLowerCase().includes(texto) || variante.sku.toLowerCase().includes(texto),
      )
    : filasCargadas

  const grupos: GrupoProducto[] = []
  for (const { producto, variante } of filas) {
    let grupo = grupos.find((g) => g.producto.id === producto.id)
    if (!grupo) {
      grupo = { producto, variantes: [], stockTotal: 0, bajoMinimoCount: 0 }
      grupos.push(grupo)
    }
    grupo.variantes.push(variante)
    grupo.stockTotal += variante.stock
    if (variante.stock < variante.stockMinimo) grupo.bajoMinimoCount += 1
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Stock</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={soloBajoMinimo}
            onChange={(e) => setSoloBajoMinimo(e.target.checked)}
          />
          Solo stock bajo mínimo
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variantes
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock total
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && grupos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No se encontraron variantes.
                </td>
              </tr>
            )}
            {!cargando &&
              grupos.map((grupo) => {
                const expandido = productoExpandidoId === grupo.producto.id
                return (
                  <Fragment key={grupo.producto.id}>
                    <tr
                      onClick={() => setProductoExpandidoId(expandido ? null : grupo.producto.id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <span className="text-gray-400">{expandido ? '▾' : '▸'}</span> {grupo.producto.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {grupo.variantes.length}
                        {grupo.bajoMinimoCount > 0 && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            {grupo.bajoMinimoCount} bajo mínimo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {grupo.stockTotal}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                    {expandido && (
                      <tr>
                        <td colSpan={4} className="bg-gray-50 px-4 py-2">
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-200">
                              {grupo.variantes.map((variante) => {
                                const bajoMinimo = variante.stock < variante.stockMinimo
                                return (
                                  <tr key={variante.id}>
                                    <td className="py-2 pr-3">
                                      <span className="inline-flex items-center gap-2 text-gray-700">
                                        <span
                                          className="h-2.5 w-2.5 rounded-full border border-gray-300"
                                          style={{ backgroundColor: variante.color.codigoHex }}
                                        />
                                        {variante.color.nombre}/{variante.talla.nombre}
                                      </span>
                                    </td>
                                    <td className="py-2 pr-3 font-mono text-xs text-gray-500">
                                      {variante.sku}
                                    </td>
                                    <td
                                      className={`py-2 pr-3 text-right font-semibold ${
                                        bajoMinimo ? 'text-red-600' : 'text-gray-900'
                                      }`}
                                    >
                                      {variante.stock}
                                      <span className="ml-1 text-xs font-normal text-gray-400">
                                        / mín {variante.stockMinimo}
                                      </span>
                                    </td>
                                    <td className="py-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => setSeleccion({ producto: grupo.producto, variante })}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                                      >
                                        + / − Stock
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
          </tbody>
        </table>
      </div>

      {seleccion && (
        <StockVarianteModal
          producto={seleccion.producto}
          variante={seleccion.variante}
          onCerrar={() => setSeleccion(null)}
          onAjustado={() => setReloadToken((v) => v + 1)}
        />
      )}
    </div>
  )
}
