import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriasMock } from './mocks/catalogos.mock'
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
        <Link
          to="/productos/nuevo"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Nuevo producto
        </Link>
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
          {categoriasMock.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
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
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Precio base
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variantes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!cargando && productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  No se encontraron productos.
                </td>
              </tr>
            )}

            {!cargando &&
              productos.map((producto) => {
                const totalStock = producto.variantes.reduce((acc, v) => acc + v.stock, 0)
                const variantesBajoMinimo = producto.variantes.filter(
                  (v) => v.stock < v.stockMinimo,
                ).length

                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{producto.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{producto.categoria.nombre}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      {formatPrecio.format(producto.precioBase)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {producto.variantes.length} · stock total {totalStock}
                      {variantesBajoMinimo > 0 && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {variantesBajoMinimo} bajo mínimo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          producto.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/productos/${producto.id}`}
                          className="font-medium text-gray-700 hover:text-gray-900"
                        >
                          Ver
                        </Link>
                        <Link
                          to={`/productos/${producto.id}/editar`}
                          className="font-medium text-gray-700 hover:text-gray-900"
                        >
                          Editar
                        </Link>
                        {producto.activo ? (
                          <button
                            type="button"
                            onClick={() => darDeBaja(producto.id)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Dar de baja
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => reactivar(producto.id)}
                            className="font-medium text-green-700 hover:text-green-900"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
