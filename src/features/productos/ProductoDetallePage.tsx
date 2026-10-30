import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { editarVariante, obtenerProducto, cambiarActivoProducto } from '../../api/productos.api'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageSkeleton } from '../../shared/components/Skeleton'
import { formatPrecio } from '../../shared/format'
import { compararTallas } from '../../shared/tallas'
import { useColaEtiquetas } from './context/useColaEtiquetas'
import type { Producto, ProductoVariante } from '../../types/producto'
function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}
const TH_CLASS = 'px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400'
const BTN_LABEL =
  'rounded-md border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900'
function StockValor({ stock, minimo }: { stock: number; minimo: number }) {
  const bajo = stock < minimo
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-semibold tabular-nums ${bajo ? 'text-red-600' : 'text-gray-900'}`}
      >
        {stock}
      </span>
      {bajo && (
        <span className="whitespace-nowrap rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
          mín {minimo}
        </span>
      )}
    </div>
  )
}
export function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardandoId, setGuardandoId] = useState<number | null>(null)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [coloresAbiertos, setColoresAbiertos] = useState<Set<number | string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const { items: colaItems, agregar } = useColaEtiquetas()
  // Carga inicial. El setState va dentro del .then (no del cuerpo del effect) porque
  // setState síncrono en un effect dispara renders en cascada (react-hooks/set-state-in-effect).
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
  // Única mutación permitida desde acá: activar/desactivar variante.
  const toggleActivo = useCallback(
    async (variante: ProductoVariante) => {
      setGuardandoId(variante.id)
      setError(null)
      const precioSeguro =
        variante.precio != null && variante.precio > 0 ? variante.precio : producto?.precioBase
      if (precioSeguro == null || precioSeguro <= 0) {
        setGuardandoId(null)
        setError('La variante no tiene un precio válido. Corregilo desde Editar.')
        return
      }
      try {
        const actualizada = await editarVariante(variante.id, {
          colorId: variante.color?.id,
          tallaId: variante.talla?.id,
          codigoBarras: variante.codigoBarras,
          precio: precioSeguro,
          stockMinimo: variante.stockMinimo,
          activo: !variante.activo,
        })
        setProducto((actual) =>
          actual
            ? {
                ...actual,
                variantes: actual.variantes.map((v) =>
                  v.id === variante.id ? { ...v, activo: actualizada.activo ?? !v.activo } : v,
                ),
              }
            : actual,
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar la variante')
      } finally {
        setGuardandoId(null)
      }
    },
    [producto],
  )
  const toggleProductoActivo = useCallback(async () => {
    if (!producto) return
    setGuardandoProducto(true)
    setError(null)
    try {
      const actualizado = await cambiarActivoProducto(producto.id, !producto.activo)
      setProducto((actual) =>
        actual ? { ...actual, activo: actualizado.activo ?? !actual.activo } : actual,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el producto')
    } finally {
      setGuardandoProducto(false)
    }
  }, [producto])
  // `agregar` suma cantidad en vez de duplicar la fila, así que agregar a lo
  // bruto una segunda vez imprimiría dos copias de cada etiqueta. Por eso solo
  // se encolan las variantes que aún no están. Este useMemo va arriba de los
  // early returns para no violar rules-of-hooks.
  const idsEnCola = useMemo(() => new Set(colaItems.map((i) => i.id)), [colaItems])
  if (cargando) {
    return <PageSkeleton />
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
  const variantes = [...producto.variantes].sort(
    (a, b) =>
      (a.color?.nombre ?? '').localeCompare(b.color?.nombre ?? '') ||
      compararTallas(a.talla, b.talla),
  )
  const stockTotal = variantes.reduce((acc, v) => acc + v.stock, 0)
  const stockReservado = variantes.reduce((acc, v) => acc + v.stockReservado, 0)
  const variantesActivas = variantes.filter((v) => v.activo)
  const coloresUsados = new Set(variantesActivas.map((v) => v.color?.id).filter(Boolean))
  const bajoMinimo = variantes.filter((v) => v.activo && v.stock < v.stockMinimo)
  const conPrecioPropio = variantes.filter(
    (v) => v.precio != null && Number(v.precio) !== Number(producto.precioBase),
  )
  const gruposColor: {
    clave: number | string
    color: ProductoVariante['color']
    items: ProductoVariante[]
  }[] = []
  const gruposTalla = new Map<string, { talla: (typeof variantes)[number]['talla']; uds: number }>()
  for (const v of variantes) {
    const claveColor = v.color?.id ?? 'sin-color'
    const ultimo = gruposColor[gruposColor.length - 1]
    if (ultimo && ultimo.clave === claveColor) ultimo.items.push(v)
    else gruposColor.push({ clave: claveColor, color: v.color, items: [v] })
    const claveTalla = v.talla ? String(v.talla.id) : 'sin-talla'
    const grupo = gruposTalla.get(claveTalla)
    if (grupo) grupo.uds += v.stock
    else gruposTalla.set(claveTalla, { talla: v.talla, uds: v.stock })
  }
  const totalesPorTalla = [...gruposTalla.values()].sort((a, b) =>
    compararTallas(a.talla, b.talla),
  )
  const cantidadEnCola = (itemId: string) => colaItems.find((i) => i.id === itemId)?.cantidad ?? 0
  const alternarColor = (clave: number | string) =>
    setColoresAbiertos((actual) => {
      const siguiente = new Set(actual)
      if (siguiente.has(clave)) siguiente.delete(clave)
      else siguiente.add(clave)
      return siguiente
    })
  const agregarVarianteACola = (variante: ProductoVariante) => {
    agregar({
      id: `variante-${variante.id}`,
      nombreProducto: producto.nombre,
      detalle: [variante.color?.nombre, variante.talla?.nombre].filter(Boolean).join(' / '),
      codigoBarras: variante.codigoBarras ?? '',
    })
  }
  const pendientesDeCola = variantesActivas.filter((v) => !idsEnCola.has(`variante-${v.id}`))
  const todasEnCola = pendientesDeCola.length === 0
  // Etiqueta genérica del producto (sin color/talla): es el código que escanea
  // el POS para vender cualquier variante del modelo.
  const idProductoEnCola = `producto-${producto.id}`
  const productoEnCola = idsEnCola.has(idProductoEnCola)
  const agregarProductoACola = () => {
    if (!producto.codigoBarras) return
    agregar({
      id: idProductoEnCola,
      nombreProducto: producto.nombre,
      codigoBarras: producto.codigoBarras,
    })
  }
  const agregarTodasACola = () => {
    for (const v of pendientesDeCola) agregarVarianteACola(v)
  }
  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div>
        <Link to="/productos" className="text-xs text-gray-400 hover:text-gray-600">
          ← Productos
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-xl font-semibold text-gray-900">{producto.nombre}</h1>
          <span className="text-xs text-gray-400">{producto.categoria?.nombre ?? 'Sin categoría'}</span>
          <button
            type="button"
            onClick={toggleProductoActivo}
            disabled={guardandoProducto}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-50 ${
              producto.activo
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
          >
            {producto.activo ? 'Activo' : 'Inactivo'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={`/productos/${producto.id}/etiqueta`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Etiqueta
            </Link>
            <Link
              to={`/productos/${producto.id}/editar`}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              Editar
            </Link>
          </div>
        </div>
        {producto.descripcion && <p className="mt-1 text-sm text-gray-500">{producto.descripcion}</p>}
      </div>
      {/* Métricas en una línea */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-y border-gray-100 py-2.5 text-sm">
        <span className="text-gray-500">
          <span className="font-semibold tabular-nums text-gray-900">{stockTotal}</span> uds
          {stockReservado > 0 && (
            <span className="ml-1.5 text-xs text-amber-600">({stockReservado} res.)</span>
          )}
        </span>
        <span className="text-gray-500">
          <span className="font-semibold tabular-nums text-gray-900">{variantes.length}</span> variantes
        </span>
        <span className="text-gray-500">
          <span className="font-semibold tabular-nums text-gray-900">{coloresUsados.size}</span> colores
        </span>
        <span className="text-gray-500">
          Base{' '}
          <span className="font-semibold tabular-nums text-gray-900">
            {formatPrecio.format(producto.precioBase)}
          </span>
        </span>
        {conPrecioPropio.length > 0 && (
          <span className="text-xs text-gray-500">{conPrecioPropio.length} con precio propio</span>
        )}
        {bajoMinimo.length > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {bajoMinimo.length} bajo mínimo
          </span>
        )}
      </div>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {/* Carga masiva de stock por grilla */}
      {/* Tabla informativa de variantes */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Stock por variante
          </h2>
          <div className="flex items-center gap-3">
            {producto.codigoBarras && (
              <button
                type="button"
                onClick={agregarProductoACola}
                disabled={productoEnCola}
                title={
                  productoEnCola
                    ? 'La etiqueta genérica ya está en la cola'
                    : `Agregar la etiqueta genérica (${producto.codigoBarras})`
                }
                className={`text-xs font-medium transition-colors ${
                  productoEnCola ? 'cursor-default text-emerald-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {productoEnCola ? '✓ Genérica en cola' : '+ Genérica'}
              </button>
            )}
            {variantesActivas.length > 0 && (
              <button
                type="button"
                onClick={agregarTodasACola}
                disabled={todasEnCola}
                title={
                  todasEnCola
                    ? 'Todas las variantes ya están en la cola'
                    : `Agregar las ${pendientesDeCola.length} variantes que faltan`
                }
                className={`text-xs font-medium transition-colors ${
                  todasEnCola ? 'cursor-default text-emerald-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {todasEnCola
                  ? `✓ ${variantesActivas.length} en cola`
                  : `+ Agregar las ${pendientesDeCola.length} que faltan`}
              </button>
            )}
          </div>
        </div>
        {variantes.length === 0 ? (
          <EmptyState mensaje="Este producto no tiene variantes cargadas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className={TH_CLASS}>Talla</th>
                  <th className={TH_CLASS}>Stock</th>
                  <th className={TH_CLASS}>Estado</th>
                  <th className={`${TH_CLASS} text-right`}>Etiquetas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gruposColor.map((grupo) => {
                  const abierto = coloresAbiertos.has(grupo.clave)
                  const totalGrupo = grupo.items.reduce((acc, v) => acc + v.stock, 0)
                  return (
                    <Fragment key={grupo.clave}>
                      <tr className="bg-gray-50/60">
                        <td colSpan={4} className="px-3 py-1.5">
                          <button
                            type="button"
                            onClick={() => alternarColor(grupo.clave)}
                            className="flex w-full items-center gap-2 text-left"
                          >
                            <span className="text-gray-400">{abierto ? '▾' : '▸'}</span>
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-gray-300"
                              style={{ backgroundColor: grupo.color?.codigoHex ?? '#fff' }}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {grupo.color?.nombre ?? 'Sin color'}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {grupo.items.length} variantes
                            </span>
                            <span className="ml-auto text-xs tabular-nums text-gray-500">
                              {totalGrupo} uds ·{' '}
                              {stockTotal > 0 ? Math.round((totalGrupo / stockTotal) * 100) : 0}%
                            </span>
                          </button>
                        </td>
                      </tr>
                      {abierto &&
                        grupo.items.map((variante) => {
                          const guardando = guardandoId === variante.id
                          const precioPropio =
                            variante.precio != null &&
                            Number(variante.precio) !== Number(producto.precioBase)
                          return (
                            <tr
                              key={variante.id}
                              className={`${variante.activo ? '' : 'bg-gray-50/60'} ${guardando ? 'opacity-60' : ''}`}
                            >
                              <td className="px-3 py-1.5 pl-8">
                                <div className="min-w-0">
                                  <span
                                    className={`block truncate text-sm font-medium ${variante.activo ? 'text-gray-900' : 'text-gray-400'}`}
                                  >
                                    {variante.talla?.nombre ?? 'Único'}
                                  </span>
                                  {precioPropio && (
                                    <span
                                      className="block text-[11px] tabular-nums text-gray-500"
                                      title="Precio propio de esta variante"
                                    >
                                      {formatPrecio.format(variante.precio!)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-1.5">
                                <StockValor
                                  stock={variante.stock}
                                  minimo={variante.stockMinimo}
                                />
                              </td>
                              <td className="px-3 py-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleActivo(variante)}
                                  disabled={guardando}
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                                    variante.activo
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  }`}
                                >
                                  {variante.activo ? 'Activa' : 'Inactiva'}
                                </button>
                              </td>
                              <td className="px-3 py-1.5">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    to={`/productos/${producto.id}/variantes/${variante.id}/etiqueta`}
                                    className={BTN_LABEL}
                                  >
                                    Etiqueta
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => agregarVarianteACola(variante)}
                                    className={BTN_LABEL}
                                  >
                                    {cantidadEnCola(`variante-${variante.id}`) > 0
                                      ? `✓ ${cantidadEnCola(`variante-${variante.id}`)}`
                                      : '+ Cola'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </Fragment>
                  )
                })}
              </tbody>
              <tfoot className="border-t border-gray-100">
                <tr>
                  <td colSpan={4} className="px-3 py-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
                      <span>Por talla:</span>
                      {totalesPorTalla.map((grupo, i) => (
                        <span key={grupo.talla?.id ?? 'sin-talla'}>
                          {i > 0 && <span className="text-gray-300">·</span>}
                          <span className="ml-1.5">{grupo.talla?.nombre ?? 'Único'} </span>
                          <span className="font-medium tabular-nums text-gray-500">
                            {grupo.uds}
                          </span>
                        </span>
                      ))}
                      <span className="ml-auto">
                        Total{' '}
                        <span className="font-medium tabular-nums text-gray-500">{stockTotal}</span>{' '}
                        uds
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400">
        Actualizado {formatDateTime(producto.actualizadoEn)}
        {producto.codigoBarras && <> · Código {producto.codigoBarras}</>}
      </p>
    </div>
  )
}
