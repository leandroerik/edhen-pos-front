import { Fragment, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarStock } from '../../api/stock.api'
import { useCatalogos } from '../../shared/hooks/useCatalogos'
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
  const [searchParams] = useSearchParams()
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(() => searchParams.get('bajoMinimo') === '1')
  const [categoriaId, setCategoriaId] = useState<number | 'todas'>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [productoExpandidoId, setProductoExpandidoId] = useState<number | null>(null)
  const [seleccion, setSeleccion] = useState<Fila | null>(null)

  const { categorias } = useCatalogos()

  const clave = JSON.stringify({ soloBajoMinimo, categoriaId, reloadToken })

  useEffect(() => {
    let cancelado = false
    listarStock({
      bajoMinimo: soloBajoMinimo || undefined,
      categoriaId: categoriaId === 'todas' ? undefined : categoriaId,
    }).then((datos) => {
      if (cancelado) return
      setResultado({ clave, filas: datos })
    })
    return () => {
      cancelado = true
    }
  }, [soloBajoMinimo, categoriaId, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const filasCargadas = resultado?.clave === clave ? resultado.filas : []

  const texto = busqueda.trim().toLowerCase()
  const filasBuscadas = texto
    ? filasCargadas.filter(
        ({ producto, variante }) =>
          producto.nombre.toLowerCase().includes(texto) ||
          variante.sku.toLowerCase().includes(texto) ||
          (variante.color?.nombre ?? '').toLowerCase().includes(texto) ||
          (variante.talla?.nombre ?? '').toLowerCase().includes(texto),
      )
    : []

  const mostrarBusqueda = texto.length > 0

  const grupos: GrupoProducto[] = []
  for (const { producto, variante } of filasCargadas) {
    let grupo = grupos.find((g) => g.producto.id === producto.id)
    if (!grupo) {
      grupo = { producto, variantes: [], stockTotal: 0, bajoMinimoCount: 0 }
      grupos.push(grupo)
    }
    grupo.variantes.push(variante)
    grupo.stockTotal += variante.stock
    if (variante.stock < variante.stockMinimo) grupo.bajoMinimoCount += 1
  }

  const filtrosActivos = soloBajoMinimo || categoriaId !== 'todas'

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Stock</h1>

      {/* Barra de búsqueda */}
      <div className="mt-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, SKU, color o talle..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-gray-500 focus:outline-none"
          autoFocus
        />
      </div>

      {/* Filtros secundarios */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoriaId('todas')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoriaId === 'todas'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoriaId(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoriaId === c.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={soloBajoMinimo}
            onChange={(e) => setSoloBajoMinimo(e.target.checked)}
          />
          Bajo mínimo
        </label>
        {filtrosActivos && (
          <button
            type="button"
            onClick={() => { setCategoriaId('todas'); setSoloBajoMinimo(false) }}
            className="text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {mostrarBusqueda && (
        <div className="mt-4">
          {cargando ? (
            <p className="text-sm text-gray-500">Buscando...</p>
          ) : filasBuscadas.length === 0 ? (
            <p className="text-sm text-gray-500">No se encontraron variantes para "{busqueda}".</p>
          ) : (
            <>
              <p className="mb-2 text-xs text-gray-400">
                {filasBuscadas.length} {filasBuscadas.length === 1 ? 'variante' : 'variantes'} encontradas
              </p>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Producto
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Variante
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Stock
                      </th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filasBuscadas.map(({ producto, variante }) => {
                      const bajoMinimo = variante.stock < variante.stockMinimo
                      const sinStock = variante.stock === 0
                      return (
                        <tr key={variante.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300"
                                style={{ backgroundColor: variante.color?.codigoHex }}
                              />
                              {variante.color?.nombre} / {variante.talla?.nombre}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`text-sm font-semibold ${
                              sinStock ? 'text-red-600' : bajoMinimo ? 'text-amber-600' : 'text-gray-900'
                            }`}>
                              {variante.stock}
                            </span>
                            <span className="ml-1 text-xs text-gray-400">/ mín {variante.stockMinimo}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSeleccion({ producto, variante })}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all active:scale-95"
                            >
                              Ajustar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Vista agrupada (sin búsqueda) */}
      {!mostrarBusqueda && (
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
                          <span className="ml-2 text-xs text-gray-400">{grupo.producto.categoria.nombre}</span>
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
                                  const sinStock = variante.stock === 0
                                  return (
                                    <tr key={variante.id}>
                                      <td className="py-2 pr-3">
                                        <span className="inline-flex items-center gap-2 text-gray-700">
                                          <span
                                            className="h-2.5 w-2.5 rounded-full border border-gray-300"
                                            style={{ backgroundColor: variante.color?.codigoHex }}
                                          />
                                          {variante.color?.nombre}/{variante.talla?.nombre}
                                        </span>
                                      </td>
                                      <td className="py-2 pr-3 font-mono text-xs text-gray-500">
                                        {variante.sku}
                                      </td>
                                      <td
                                        className={`py-2 pr-3 text-right font-semibold ${
                                          sinStock ? 'text-red-600' : bajoMinimo ? 'text-amber-600' : 'text-gray-900'
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
                                          Ajustar
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
      )}

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
