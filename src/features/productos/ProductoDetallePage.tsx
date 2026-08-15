import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { editarVariante, obtenerProducto } from '../../api/productos.api'
import { useColaEtiquetas } from './context/useColaEtiquetas'
import type { Color } from '../../types/color'
import type { Producto, ProductoVariante } from '../../types/producto'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

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
    return () => {
      cancelado = true
    }
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

  // Resumen informativo de colores/talles en uso — no es un campo propio
  // del producto, se deriva de sus variantes activas (pedido explícito:
  // ver de un vistazo qué tan variado está cargado sin contar filas).
  const variantesActivas = producto.variantes.filter((v) => v.activo)
  const coloresUsados = [...new Map(variantesActivas.map((v) => [v.color.id, v.color])).values()]
  const tallesUsados = [...new Map(variantesActivas.map((v) => [v.talla.id, v.talla])).values()]

  // Agrupado por color (todas las variantes, activas e inactivas — nada
  // desaparece del todo, solo se atenúa) para poder desplegar/plegar cada
  // color por separado en vez de una tabla plana larga — pedido
  // explícito para productos con muchas combinaciones.
  const gruposPorColor: Array<{ color: Color; variantes: ProductoVariante[] }> = [
    ...new Map(producto.variantes.map((v) => [v.color.id, v.color])).values(),
  ].map((color) => ({
    color,
    variantes: producto.variantes.filter((v) => v.color.id === color.id),
  }))

  const toggleColorExpandido = (colorId: number) => {
    setColoresExpandidos((actual) =>
      actual.includes(colorId) ? actual.filter((id) => id !== colorId) : [...actual, colorId],
    )
  }

  // Toggle rápido activa/desactiva desde el detalle, sin ir al formulario
  // de edición completo (pedido explícito). `editarVariante` pide el
  // input completo (mismo contrato que el form), así que se arma con los
  // valores actuales de la variante y solo se pisa `activo`.
  const toggleActivo = async (variante: ProductoVariante) => {
    await editarVariante(variante.id, {
      color: variante.color,
      talla: variante.talla,
      codigoBarras: variante.codigoBarras,
      precio: variante.precio,
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
    agregar({
      id: `variante-${variante.id}`,
      nombreProducto: producto.nombre,
      detalle: `${variante.color.nombre} / ${variante.talla.nombre}`,
      codigoBarras: variante.codigoBarras ?? '',
    })
  }

  const agregarColorACola = (variantes: ProductoVariante[]) => {
    for (const variante of variantes) {
      if (variante.activo) agregarVarianteACola(variante)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <Link to="/productos" className="text-sm text-gray-500 hover:text-gray-700">
            ← Productos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">{producto.nombre}</h1>
          <p className="mt-1 text-sm text-gray-500">{producto.categoria.nombre}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              producto.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {producto.activo ? 'Activo' : 'Inactivo'}
          </span>
          <Link
            to={`/productos/${producto.id}/editar`}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-3">
        {producto.imagenUrl && (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="h-32 w-32 rounded-md border border-gray-200 object-cover"
          />
        )}
        <div className="sm:col-span-2">
          <p className="text-sm text-gray-700">{producto.descripcion || 'Sin descripción.'}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-400">Precio base</dt>
              <dd className="text-gray-900">{formatPrecio.format(producto.precioBase)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Código de barras (producto)</dt>
              <dd className="text-gray-900">
                {producto.codigoBarras || '—'}
                {producto.codigoBarras && (
                  <>
                    <Link
                      to={`/productos/${producto.id}/etiqueta`}
                      className="ml-2 text-xs font-medium text-gray-500 hover:text-gray-900"
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
                      title="Agregar a la cola de etiquetas"
                      className="ml-2 text-xs font-medium text-gray-500 hover:text-gray-900"
                    >
                      {cantidadEnCola(`producto-${producto.id}`) > 0
                        ? `✓ En cola (${cantidadEnCola(`producto-${producto.id}`)})`
                        : '+ Cola'}
                    </button>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Variantes</dt>
              <dd className="text-gray-900">{producto.variantes.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Colores</dt>
              <dd className="text-gray-900">
                {coloresUsados.length > 0
                  ? `${coloresUsados.map((c) => c.nombre).join(', ')} (${coloresUsados.length})`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Talles</dt>
              <dd className="text-gray-900">
                {tallesUsados.length > 0
                  ? `${tallesUsados.map((t) => t.nombre).join(', ')} (${tallesUsados.length})`
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-gray-900">Variantes y stock</h2>
      <div className="mt-2 space-y-2">
        {gruposPorColor.map(({ color, variantes }) => {
          const expandido = coloresExpandidos.includes(color.id)
          const stockTotal = variantes.reduce((acc, v) => acc + v.stock, 0)
          const hayBajoMinimo = variantes.some((v) => v.activo && v.stock < v.stockMinimo)
          const hayInactivas = variantes.some((v) => !v.activo)
          return (
            <div key={color.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex w-full items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50">
                <button
                  type="button"
                  onClick={() => toggleColorExpandido(color.id)}
                  className="flex flex-1 flex-wrap items-center gap-2 text-left text-sm"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.codigoHex }}
                  />
                  <span className="font-medium text-gray-900">{color.nombre}</span>
                  <span className="text-xs text-gray-400">
                    {variantes.length} {variantes.length === 1 ? 'talle' : 'talles'} · {stockTotal} en
                    stock
                  </span>
                  {hayBajoMinimo && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      bajo mínimo
                    </span>
                  )}
                  {hayInactivas && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      con inactivas
                    </span>
                  )}
                </button>
                <span className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => agregarColorACola(variantes)}
                    title="Agregar todos los talles activos de este color a la cola de etiquetas"
                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    + Cola (todas)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleColorExpandido(color.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandido ? '▴' : '▾'}
                  </button>
                </span>
              </div>

              {expandido && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {variantes.map((variante) => {
                    const stockBajo = variante.stock < variante.stockMinimo
                    const idEnCola = `variante-${variante.id}`
                    const enCola = cantidadEnCola(idEnCola)
                    return (
                      <div
                        key={variante.id}
                        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 ${
                          variante.activo ? '' : 'bg-gray-50'
                        }`}
                      >
                        <div className={variante.activo ? 'text-gray-700' : 'text-gray-400'}>
                          <p className="text-sm font-medium">{variante.talla.nombre}</p>
                          <p className="text-xs">
                            {variante.sku} · {variante.codigoBarras || 'sin código'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={variante.activo ? 'text-gray-900' : 'text-gray-400'}>
                            {formatPrecio.format(variante.precio ?? producto.precioBase)}
                          </span>
                          <span
                            className={`font-semibold ${
                              !variante.activo ? 'text-gray-400' : stockBajo ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {variante.stock}
                            <span className="ml-1 text-xs font-normal text-gray-400">
                              / mín {variante.stockMinimo}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleActivo(variante)}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              variante.activo
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {variante.activo ? 'Activa' : 'Inactiva'}
                          </button>
                          <Link
                            to={`/productos/${producto.id}/variantes/${variante.id}/etiqueta`}
                            className="font-medium text-gray-700 hover:text-gray-900"
                          >
                            Imprimir
                          </Link>
                          <button
                            type="button"
                            onClick={() => agregarVarianteACola(variante)}
                            title="Agregar a la cola de etiquetas"
                            className="font-medium text-gray-500 hover:text-gray-900"
                          >
                            {enCola > 0 ? `✓ En cola (${enCola})` : '+ Cola'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
