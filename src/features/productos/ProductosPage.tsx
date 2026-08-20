import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { formatPrecio } from '../../shared/format'
import { useDebounce } from '../../shared/hooks/useDebounce'
import { CategoriasModal } from './components/CategoriasModal'
import { useCatalogos } from '../../shared/hooks/useCatalogos'
import { useProductos } from './hooks/useProductos'

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

export function ProductosPage() {
  const [texto, setTexto] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | 'todas'>('todas')
  const [estado, setEstado] = useState<FiltroEstado>('activos')
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [confirmBaja, setConfirmBaja] = useState<number | null>(null)
  const [bajandoId, setBajandoId] = useState<number | null>(null)

  const textoDebounced = useDebounce(texto, 300)

  const { categorias, recargar: recargarCatalogos } = useCatalogos()

  const filtro = useMemo(
    () => ({
      texto: textoDebounced || undefined,
      categoriaId: categoriaId === 'todas' ? undefined : categoriaId,
      activo: estado === 'todos' ? undefined : estado === 'activos',
    }),
    [textoDebounced, categoriaId, estado],
  )

  const { productos, cargando, error, darDeBaja, reactivar } = useProductos(filtro)

  const [errorBaja, setErrorBaja] = useState<string | null>(null)

  const handleDarDeBaja = async (id: number) => {
    setBajandoId(id)
    setErrorBaja(null)
    try {
      await darDeBaja(id)
    } catch (err) {
      setErrorBaja(err instanceof Error ? err.message : 'No se pudo desactivar el producto')
    } finally {
      setBajandoId(null)
      setConfirmBaja(null)
    }
  }

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
            Categorías
          </button>
          <Link
            to="/productos/nuevo"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Nuevo producto
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar..."
          className="w-48 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
        {(['todos', 'activos', 'inactivos'] as const).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEstado(e)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              estado === e
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {e === 'todos' ? 'Todos' : e === 'activos' ? 'Activos' : 'Inactivos'}
          </button>
        ))}
        <span className="h-4 w-px bg-gray-200" />
        <button
          type="button"
          onClick={() => setCategoriaId('todas')}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            categoriaId === 'todas'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoriaId(c.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              categoriaId === c.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {c.nombre}
          </button>
        ))}
        {(texto || categoriaId !== 'todas' || estado !== 'activos') && (
          <>
            <span className="h-4 w-px bg-gray-200" />
            <button
              type="button"
              onClick={() => { setTexto(''); setCategoriaId('todas'); setEstado('activos') }}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Limpiar
            </button>
          </>
        )}
        {!cargando && (
          <span className="ml-auto text-[11px] text-gray-400">
            {productos.length}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {errorBaja && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorBaja}</p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[35%] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Producto
              </th>
              <th className="w-[15%] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Categoría
              </th>
              <th className="w-[12%] px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Precio
              </th>
              <th className="w-[10%] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Var.
              </th>
              <th className="w-[10%] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock
              </th>
              <th className="w-[10%] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="w-[8%] px-4 py-2.5" />
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
                    <td className="px-4 py-2.5">
                      <Link
                        to={`/productos/${p.id}`}
                        className="block truncate font-medium text-gray-900 hover:underline"
                        title={p.nombre}
                      >
                        {p.nombre}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.categoria.nombre}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">
                      {formatPrecio.format(p.precioBase)}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm text-gray-600">
                      {p.variantes.length}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm">
                      <span className="font-medium text-gray-900">{totalStock}</span>
                      {totalReservado > 0 && (
                        <span className="ml-0.5 text-[10px] text-amber-600">+{totalReservado}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => p.activo ? setConfirmBaja(p.id) : reactivar(p.id)}
                        disabled={bajandoId === p.id}
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                          p.activo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to={`/productos/${p.id}/editar`}
                        className="text-xs font-medium text-gray-600 hover:text-gray-900"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <CategoriasModal
        abierto={modalCategoriasAbierto}
        onCerrar={() => setModalCategoriasAbierto(false)}
        onActualizado={recargarCatalogos}
      />

      <ConfirmModal
        abierto={confirmBaja !== null}
        titulo="Desactivar producto"
        mensaje="¿Desactivar este producto? No aparecerá en búsquedas ni para ventas."
        textoAccion="Desactivar"
        variant="danger"
        cargando={bajandoId !== null}
        onConfirmar={() => { if (confirmBaja !== null) void handleDarDeBaja(confirmBaja) }}
        onCancelar={() => { setConfirmBaja(null); setBajandoId(null) }}
      />
    </div>
  )
}
