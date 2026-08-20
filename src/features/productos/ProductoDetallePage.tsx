import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { editarVariante, obtenerProducto } from '../../api/productos.api'
import { formatPrecio } from '../../shared/format'
import { useColaEtiquetas } from './context/useColaEtiquetas'
import type { Color } from '../../types/color'
import type { Producto, ProductoVariante } from '../../types/producto'

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}

export function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [coloresExpandidos, setColoresExpandidos] = useState<number[]>([])
  const { items: colaItems, agregar } = useColaEtiquetas()

  useEffect(() => {
    let cancelado = false
    obtenerProducto(Number(id)).then((resultado) => {
      if (cancelado) return
      setProducto(resultado ?? null)
      setCargando(false)
    })
    return () => { cancelado = true }
  }, [id])

  if (cargando) {
    return <p className="text-sm text-gray-500">Cargando...</p>
  }

  if (!producto) {
    return (
      <div>
        <p className="text-sm text-gray-500">No se encontró el producto.</p>
        <Link to="/productos" className="mt-2 inline-block text-sm font-medium text-gray-700 hover:text-gray-900">
          ← Volver a productos
        </Link>
      </div>
    )
  }

  const variantesActivas = producto.variantes.filter((v) => v.activo)
  const variantesInactivas = producto.variantes.filter((v) => !v.activo)
  const coloresUsados = [...new Map(variantesActivas.filter((v) => v.color).map((v) => [v.color!.id, v.color!])).values()]
  const tallesUsados = [...new Map(variantesActivas.filter((v) => v.talla).map((v) => [v.talla!.id, v.talla!])).values()]
  const stockTotal = producto.variantes.reduce((acc, v) => acc + v.stock, 0)
  const stockDisponible = producto.variantes.reduce((acc, v) => acc + v.stockDisponible, 0)
  const stockReservado = stockTotal - stockDisponible
  const variantesBajoMinimo = variantesActivas.filter((v) => v.stock < v.stockMinimo)

  const gruposPorColor: Array<{ color: Color; variantes: ProductoVariante[] }> = [
    ...new Map(producto.variantes.filter((v) => v.color).map((v) => [v.color!.id, v.color!])).values(),
  ].map((color) => ({
    color,
    variantes: producto.variantes.filter((v) => v.color?.id === color.id),
  }))

  const toggleColorExpandido = (colorId: number) => {
    setColoresExpandidos((actual) =>
      actual.includes(colorId) ? actual.filter((cid) => cid !== colorId) : [...actual, colorId],
    )
  }

  const toggleActivo = async (variante: ProductoVariante) => {
    await editarVariante(variante.id, {
      colorId: variante.color?.id,
      tallaId: variante.talla?.id,
      codigoBarras: variante.codigoBarras,
      precio: variante.precio ?? 0,
      stockMinimo: variante.stockMinimo,
      activo: !variante.activo,
    })
    setProducto((actual) =>
      actual
        ? {
            ...actual,
            variantes: actual.variantes.map((v) =>
              v.id === variante.id ? { ...v, activo: !v.activo } : v,
            ),
          }
        : actual,
    )
  }

  const cantidadEnCola = (itemId: string) => colaItems.find((i) => i.id === itemId)?.cantidad ?? 0

  const agregarVarianteACola = (variante: ProductoVariante) => {
    const detalle = [variante.color?.nombre, variante.talla?.nombre].filter(Boolean).join(' / ')
    agregar({
      id: `variante-${variante.id}`,
      nombreProducto: producto.nombre,
      detalle,
      codigoBarras: variante.codigoBarras ?? '',
    })
  }

  const agregarColorACola = (variantes: ProductoVariante[]) => {
    for (const variante of variantes) {
      if (variante.activo) agregarVarianteACola(variante)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/productos" className="text-xs text-gray-400 hover:text-gray-600">
            ← Productos
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{producto.nombre}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                producto.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {producto.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{producto.categoria.nombre}</p>
        </div>
        <Link
          to={`/productos/${producto.id}/editar`}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Editar
        </Link>
      </div>

      {/* Info + Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Info card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="flex gap-5">
            {producto.imagenUrl && (
              <img
                src={producto.imagenUrl}
                alt={producto.nombre}
                className="h-40 w-40 shrink-0 rounded-lg border border-gray-200 object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              {producto.descripcion && (
                <p className="text-sm text-gray-600">{producto.descripcion}</p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-gray-400">Precio base</dt>
                  <dd className="font-medium text-gray-900">{formatPrecio.format(producto.precioBase)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Código de barras</dt>
                  <dd className="flex items-center gap-2 font-medium text-gray-900">
                    {producto.codigoBarras || '—'}
                    {producto.codigoBarras && (
                      <span className="flex items-center gap-2">
                        <Link
                          to={`/productos/${producto.id}/etiqueta`}
                          className="text-xs font-medium text-gray-400 hover:text-gray-700"
                        >
                          Imprimir
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            agregar({
                              id: `producto-${producto.id}`,
                              nombreProducto: producto.nombre,
                              codigoBarras: producto.codigoBarras!,
                            })
                          }
                          className="text-xs font-medium text-gray-400 hover:text-gray-700"
                        >
                          {cantidadEnCola(`producto-${producto.id}`) > 0
                            ? `✓ Cola (${cantidadEnCola(`producto-${producto.id}`)})`
                            : '+ Cola'}
                        </button>
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Creado</dt>
                  <dd className="text-gray-700">{formatDateTime(producto.creadoEn)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Última modificación</dt>
                  <dd className="text-gray-700">{formatDateTime(producto.actualizadoEn)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Resumen</h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">Stock total</span>
              <span className="text-lg font-semibold text-gray-900">{stockTotal}</span>
            </div>
            {stockReservado > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">Reservado</span>
                <span className="text-sm font-medium text-amber-600">{stockReservado}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">Variantes</span>
                <span className="text-sm font-medium text-gray-900">
                  {variantesActivas.length} activas
                  {variantesInactivas.length > 0 && (
                    <span className="text-gray-400"> · {variantesInactivas.length} inactivas</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">Colores</span>
              <span className="text-sm font-medium text-gray-900">{coloresUsados.length}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-500">Talles</span>
              <span className="text-sm font-medium text-gray-900">{tallesUsados.length}</span>
            </div>
            {variantesBajoMinimo.length > 0 && (
              <div className="rounded-md bg-red-50 px-3 py-2">
                <p className="text-xs font-medium text-red-700">
                  {variantesBajoMinimo.length} variante{variantesBajoMinimo.length > 1 ? 's' : ''} bajo mínimo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variantes */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Variantes y stock</h2>
        <div className="mt-2 space-y-2">
          {gruposPorColor.map(({ color, variantes }) => {
            const expandido = coloresExpandidos.includes(color.id)
            const stockColor = variantes.reduce((acc, v) => acc + v.stock, 0)
            const activasColor = variantes.filter((v) => v.activo)
            const bajoMinimo = variantes.some((v) => v.activo && v.stock < v.stockMinimo)

            return (
              <div key={color.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => toggleColorExpandido(color.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.codigoHex }}
                    />
                    <span className="text-sm font-medium text-gray-900">{color.nombre}</span>
                    <span className="text-xs text-gray-400">
                      {activasColor.length} talles · {stockColor} uds.
                    </span>
                    {bajoMinimo && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        bajo mínimo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); agregarColorACola(variantes) }}
                      className="text-xs text-gray-400 hover:text-gray-700"
                    >
                      + Cola
                    </button>
                    <span className="text-gray-300">{expandido ? '▴' : '▾'}</span>
                  </div>
                </button>

                {expandido && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="px-4 py-2 font-medium">Talle</th>
                          <th className="px-4 py-2 font-medium">Precio</th>
                          <th className="px-4 py-2 font-medium">Stock</th>
                          <th className="px-4 py-2 font-medium">Mín.</th>
                          <th className="px-4 py-2 font-medium">Estado</th>
                          <th className="px-4 py-2 text-right font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {variantes.map((variante) => {
                          const stockBajo = variante.activo && variante.stock < variante.stockMinimo
                          return (
                            <tr
                              key={variante.id}
                              className={`${variante.activo ? '' : 'bg-gray-50 text-gray-400'}`}
                            >
                              <td className="px-4 py-2 font-medium text-gray-900">
                                {variante.talla?.nombre ?? 'Único'}
                              </td>
                              <td className="px-4 py-2 text-gray-700">
                                {formatPrecio.format(variante.precio ?? producto.precioBase)}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`font-semibold ${stockBajo ? 'text-red-600' : 'text-gray-900'}`}>
                                  {variante.stock}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-500">{variante.stockMinimo}</td>
                              <td className="px-4 py-2">
                                <button
                                  type="button"
                                  onClick={() => toggleActivo(variante)}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    variante.activo
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                >
                                  {variante.activo ? 'Activa' : 'Inactiva'}
                                </button>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <Link
                                    to={`/productos/${producto.id}/variantes/${variante.id}/etiqueta`}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                                  >
                                    Imprimir
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => agregarVarianteACola(variante)}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                                  >
                                    {cantidadEnCola(`variante-${variante.id}`) > 0
                                      ? `✓ En cola (${cantidadEnCola(`variante-${variante.id}`)})`
                                      : '+ Cola'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
