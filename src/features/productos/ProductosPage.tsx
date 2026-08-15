import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoriasModal } from './components/CategoriasModal'
import { useCatalogos } from './hooks/useCatalogos'
import { useProductos } from './hooks/useProductos'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

export function ProductosPage() {
  const [texto, setTexto] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | 'todas'>('todas')
  const [estado, setEstado] = useState<FiltroEstado>('activos')
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)

  const { categorias, recargar: recargarCatalogos } = useCatalogos()

  const filtro = useMemo(
    () => ({
      texto: texto || undefined,
      categoriaId: categoriaId === 'todas' ? undefined : categoriaId,
      activo: estado === 'todos' ? undefined : estado === 'activos',
    }),
    [texto, categoriaId, estado],
  )

  const { productos, cargando, error, darDeBaja, reactivar } = useProductos(filtro)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalCategoriasAbierto(true)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            🏷️ Categorías
          </button>
          <Link
            to="/productos/nuevo"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Nuevo producto
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.activo === false ? '(Inactiva)' : ''}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as FiltroEstado)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Precio base
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variantes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cargando ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                  Cargando productos...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                const totalStock = p.variantes.reduce((acc, v) => acc + v.stock, 0)
                const totalReservado = p.variantes.reduce((acc, v) => acc + v.stockReservado, 0)

                return (
                  <tr key={p.id} className={!p.activo ? 'bg-gray-50 text-gray-400' : undefined}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/productos/${p.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {p.nombre}
                      </Link>
                      {p.codigoBarras && (
                        <span className="ml-2 font-mono text-xs text-gray-400">
                          {p.codigoBarras}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.categoria.nombre}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatPrecio.format(p.precioBase)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.variantes.length}{' '}
                      {p.variantes.length === 1 ? 'variante' : 'variantes'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-gray-900">{totalStock}</span>
                      {totalReservado > 0 && (
                        <span className="ml-1 text-xs text-amber-600">
                          ({totalReservado} reserv.)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/productos/${p.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/productos/${p.id}/editar`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        {p.activo ? (
                          <button
                            type="button"
                            onClick={() => darDeBaja(p.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Dar de baja
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => reactivar(p.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Gestión de Categorías */}
      <CategoriasModal
        abierto={modalCategoriasAbierto}
        onCerrar={() => setModalCategoriasAbierto(false)}
        onActualizado={recargarCatalogos}
      />
    </div>
  )
}
