import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarCategorias } from '../../api/catalogos.api'
import { buscarClientesParaVenta, obtenerClienteGenerico } from '../../api/clientes.api'
import { buscarVariantesParaVenta, listarProductos } from '../../api/productos.api'
import { crearPedido, crearVenta, type PagoInput } from '../../api/ventas.api'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { MEDIOS_PAGO_HABILITADOS, NOMBRE_MEDIO_PAGO } from '../../shared/constants'
import { formatPrecio } from '../../shared/format'
import { SelectorColorTalle, type SelectorColorTalleHandle, type VarianteParaSelector } from './components/SelectorColorTalle'
import { TicketVentaModal } from './components/TicketVentaModal'
import type { Categoria } from '../../types/categoria'
import type { Cliente, TipoCliente } from '../../types/cliente'
import type { Color } from '../../types/color'
import type { Producto } from '../../types/producto'
import type { Talla } from '../../types/talla'
import type { MedioPago, Venta } from '../../types/venta'

const NOMBRE_TIPO_CLIENTE: Record<Cliente['tipo'], string> = {
  MAYORISTA: 'Mayorista',
  MINORISTA: 'Minorista',
  OTRO: 'Otro',
}

interface ResultadoBusqueda {
  producto: { id: number; nombre: string; precioBase: number }
  variante: {
    id: number
    sku: string
    color: Color
    talla: Talla
    precio?: number
    stock: number
    stockReservado: number
  }
}

interface ItemCarrito {
  varianteId: number
  producto: { id: number; nombre: string }
  variante: { id: number; sku: string; color: Color; talla: Talla }
  disponible: number
  cantidad: number
  precioUnitario: number
  descuentoItem: string
}

interface PagoLinea {
  localId: string
  medioPago: MedioPago
  monto: string
  montoTocado: boolean
}

// Mientras haya un único medio de pago y no se haya editado a mano, su monto
// sigue al total en vivo — agiliza el caso más común (pago completo en un
// solo medio) sin tener que retipear el total.
function montoEfectivo(pago: PagoLinea, esUnicoPago: boolean, total: number): number {
  if (esUnicoPago && !pago.montoTocado) return total
  return Number(pago.monto) || 0
}

export function VentasPage() {
  const [busqueda, setBusqueda] = useState('')
  const [terminoDebounced, setTerminoDebounced] = useState('')
  const [resultadoBusqueda, setResultadoBusqueda] = useState<{
    clave: string
    datos: ResultadoBusqueda[]
  } | null>(null)

  const [catalogo, setCatalogo] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [mostrarCatalogo, setMostrarCatalogo] = useState(true)
  const [categoriaCatalogo, setCategoriaCatalogo] = useState<number | 'todas'>('todas')
  const [productoExpandidoId, setProductoExpandidoId] = useState<number | null>(null)

  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const carritoLengthRef = useRef(0)

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [terminoClienteDebounced, setTerminoClienteDebounced] = useState('')
  const [resultadoClientes, setResultadoClientes] = useState<{ clave: string; datos: Cliente[] } | null>(
    null,
  )
  const [genericos, setGenericos] = useState<{ MINORISTA: Cliente | null; MAYORISTA: Cliente | null }>({
    MINORISTA: null,
    MAYORISTA: null,
  })

  const [descuentoTotal, setDescuentoTotal] = useState('')
  const [pagos, setPagos] = useState<PagoLinea[]>([
    { localId: crypto.randomUUID(), medioPago: 'EFECTIVO', monto: '', montoTocado: false },
  ])

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ultimaVenta, setUltimaVenta] = useState<string | null>(null)
  const [ventaParaTicket, setVentaParaTicket] = useState<Venta | null>(null)

  const [eliminandoProducto, setEliminandoProducto] = useState<number | null>(null)
  const [eliminandoVariante, setEliminandoVariante] = useState<number | null>(null)
  const [undoItems, setUndoItems] = useState<ItemCarrito[] | null>(null)
  const [undoNombre, setUndoNombre] = useState('')
  const [flashProductoId, setFlashProductoId] = useState<number | null>(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [mostrarConfirmarNuevaVenta, setMostrarConfirmarNuevaVenta] = useState(false)

  const busquedaInputRef = useRef<HTMLInputElement>(null)
  const carritoRef = useRef<HTMLDivElement>(null)
  const selectorRef = useRef<SelectorColorTalleHandle>(null)
  const puedeCobrarRef = useRef(false)

  useEffect(() => {
    let cancelado = false
    Promise.all([
      listarProductos({ activo: true }),
      listarCategorias({ activo: true }),
      obtenerClienteGenerico('MINORISTA'),
      obtenerClienteGenerico('MAYORISTA'),
    ]).then(([productosData, categoriasData, genMinorista, genMayorista]) => {
      if (cancelado) return
      setCatalogo(productosData)
      setCategorias(categoriasData)
      setGenericos({ MINORISTA: genMinorista, MAYORISTA: genMayorista })
      setClienteSeleccionado(genMinorista)
    })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setTerminoDebounced(busqueda), 250)
    return () => clearTimeout(timeout)
  }, [busqueda])

  useEffect(() => {
    if (!terminoDebounced.trim()) return
    let cancelado = false
      buscarVariantesParaVenta(terminoDebounced).then((datos) => {
      if (cancelado) return
      setResultadoBusqueda({ clave: terminoDebounced, datos: datos.filter((d) => d.variante.color && d.variante.talla) as ResultadoBusqueda[] })
    })
    return () => {
      cancelado = true
    }
  }, [terminoDebounced])

  useEffect(() => {
    const timeout = setTimeout(() => setTerminoClienteDebounced(busquedaCliente), 250)
    return () => clearTimeout(timeout)
  }, [busquedaCliente])

  useEffect(() => {
    if (!terminoClienteDebounced.trim()) return
    let cancelado = false
    buscarClientesParaVenta(terminoClienteDebounced).then((datos) => {
      if (cancelado) return
      setResultadoClientes({ clave: terminoClienteDebounced, datos })
    })
    return () => {
      cancelado = true
    }
  }, [terminoClienteDebounced])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        busquedaInputRef.current?.focus()
      }
      if (e.key === 'F4') {
        e.preventDefault()
        if (puedeCobrarRef.current) setMostrarConfirmacion(true)
      }
      if (e.key === 'F1') {
        e.preventDefault()
        if (carritoLengthRef.current > 0) {
          setMostrarConfirmarNuevaVenta(true)
        }
      }
      if (e.key === 'Escape') {
        setEliminandoProducto(null)
        setEliminandoVariante(null)
        setMostrarConfirmacion(false)
        setMostrarConfirmarNuevaVenta(false)
        setError(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!undoItems) return
    const timeout = setTimeout(() => {
      setUndoItems(null)
      setUndoNombre('')
    }, 5000)
    return () => clearTimeout(timeout)
  }, [undoItems])

  const resultadosClientes =
    terminoClienteDebounced.trim() && resultadoClientes?.clave === terminoClienteDebounced
      ? resultadoClientes.datos
      : []

  const buscando = terminoDebounced.trim() !== '' && resultadoBusqueda?.clave !== terminoDebounced
  const resultados =
    terminoDebounced.trim() && resultadoBusqueda?.clave === terminoDebounced
      ? resultadoBusqueda.datos
      : []
  // Un código de barras "genérico" de producto devuelve todas sus variantes
  // (docs/07-proceso-de-venta.md §1) — ahí sí tiene sentido agrupar por
  // color como en el catálogo. Una búsqueda de texto puede traer variantes
  // de productos distintos (ej. "remera" matchea varios modelos), y ahí
  // agrupar por color no tendría sentido — se mantiene la lista plana para
  // ese caso.
  const resultadosMismoProducto =
    resultados.length > 1 && resultados.every((r) => r.producto.id === resultados[0].producto.id)

  useEffect(() => {
    if (resultadosMismoProducto) {
      setTimeout(() => selectorRef.current?.focus(), 50)
    }
  }, [resultadosMismoProducto])

  const catalogoFiltrado = catalogo.filter(
    (p) => categoriaCatalogo === 'todas' || p.categoria.id === categoriaCatalogo,
  )

  const agregarAlCarrito = ({ producto, variante }: ResultadoBusqueda, cantidad = 1) => {
    const disponible = variante.stock - variante.stockReservado
    if (disponible <= 0) {
      setError(
        `Sin stock: ${producto.nombre} (${variante.color.nombre}/${variante.talla.nombre})`,
      )
      return
    }
    if (cantidad <= 0) return
    setError(null)
    const cantidadAAgregar = Math.min(cantidad, disponible)

    setCarrito((actual) => {
      const existente = actual.find((i) => i.varianteId === variante.id)
      if (existente) {
        return actual.map((i) =>
          i.varianteId === variante.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidadAAgregar, disponible) }
            : i,
        )
      }
      return [
        ...actual,
        {
          varianteId: variante.id,
          producto: { id: producto.id, nombre: producto.nombre },
          variante: { id: variante.id, sku: variante.sku, color: variante.color, talla: variante.talla },
          disponible,
          cantidad: cantidadAAgregar,
          precioUnitario: variante.precio ?? producto.precioBase,
          descuentoItem: '',
        },
      ]
    })
    setBusqueda('')
    setTimeout(() => carritoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    setFlashProductoId(producto.id)
    setTimeout(() => setFlashProductoId(null), 800)
    setTimeout(() => busquedaInputRef.current?.focus(), 60)
  }

  // Flujo pensado para el lector de código de barras: escanea y tipea el
  // código + Enter en el mismo input. Si el código identifica una única
  // variante (código de variante, o código de producto con una sola
  // variante activa), la agrega directo al carrito sin click. Si el
  // código es de producto y tiene varias variantes, deja el listado
  // abierto para elegir talle/color a mano. Con el input vacío, Enter
  // pasa a confirmar la venta (así "escanear, Enter, ... Enter" alcanza
  // para cobrar sin tocar el mouse).
  const handleBusquedaKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const termino = busqueda.trim()
    if (!termino) {
      if (puedeCobrar) handleCobrar()
      return
    }
    const encontrados = await buscarVariantesParaVenta(termino)
    const filtrados = encontrados.filter((d) => d.variante.color && d.variante.talla) as ResultadoBusqueda[]
    if (filtrados.length === 1) {
      agregarAlCarrito(filtrados[0])
    } else {
      setResultadoBusqueda({ clave: termino, datos: filtrados })
      setTerminoDebounced(termino)
    }
  }


  const cambiarCantidadCarrito = (varianteId: number, delta: number) => {
    setCarrito((actual) =>
      actual
        .map((i) =>
          i.varianteId === varianteId
            ? { ...i, cantidad: Math.max(0, Math.min(i.disponible, i.cantidad + delta)) }
            : i,
        )
        .filter((i) => i.cantidad > 0),
    )
  }

  const confirmarEliminarVariante = (varianteId: number) => {
    setEliminandoVariante(varianteId)
    setEliminandoProducto(null)
  }

  const confirmarEliminarProducto = (productoId: number) => {
    setEliminandoProducto(productoId)
    setEliminandoVariante(null)
  }

  const ejecutarEliminarVariante = (varianteId: number, nombreProducto: string) => {
    const itemsEliminados = carrito.filter((i) => i.varianteId === varianteId)
    setUndoItems(itemsEliminados)
    setUndoNombre(nombreProducto)
    setCarrito((actual) => actual.filter((i) => i.varianteId !== varianteId))
    setEliminandoVariante(null)
  }

  const ejecutarEliminarProducto = (productoId: number, nombreProducto: string) => {
    const itemsEliminados = carrito.filter((i) => i.producto.id === productoId)
    setUndoItems(itemsEliminados)
    setUndoNombre(nombreProducto)
    setCarrito((actual) => actual.filter((i) => i.producto.id !== productoId))
    setEliminandoProducto(null)
  }

  const deshacerEliminacion = () => {
    if (!undoItems) return
    setCarrito((actual) => [...actual, ...undoItems])
    setUndoItems(null)
    setUndoNombre('')
  }

  const actualizarPrecioProducto = (productoId: number, nuevoPrecio: number) => {
    setCarrito((actual) =>
      actual.map((i) =>
        i.producto.id === productoId ? { ...i, precioUnitario: nuevoPrecio } : i,
      ),
    )
  }

  interface GrupoCarrito {
    producto: { id: number; nombre: string }
    items: ItemCarrito[]
  }

  const carritoAgrupado = useMemo<GrupoCarrito[]>(() => {
    const grupos = new Map<number, GrupoCarrito>()
    for (const item of carrito) {
      const existing = grupos.get(item.producto.id)
      if (existing) {
        existing.items.push(item)
      } else {
        grupos.set(item.producto.id, {
          producto: item.producto,
          items: [item],
        })
      }
    }
    return [...grupos.values()]
  }, [carrito])

  const subtotal = carrito.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0)
  const descuentoItems = carrito.reduce((acc, i) => acc + (Number(i.descuentoItem) || 0), 0)
  const descuentoGeneral = Number(descuentoTotal) || 0
  const total = Math.max(0, subtotal - descuentoItems - descuentoGeneral)

  const esUnicoPago = pagos.length === 1
  const totalPagado = pagos.reduce((acc, p) => acc + montoEfectivo(p, esUnicoPago, total), 0)
  const diferencia = totalPagado - total

  const puedeCobrar = carrito.length > 0 && totalPagado >= total && !guardando
  puedeCobrarRef.current = puedeCobrar
  carritoLengthRef.current = carrito.length

  const agregarPago = () => {
    setPagos((actual) => {
      // Al pasar a pago dividido, "congela" el monto que se venía mostrando
      // en la primera línea (si era el total automático) para que no
      // desaparezca al dejar de ser el único medio de pago.
      const primeraCongelada =
        actual.length === 1 && !actual[0].montoTocado
          ? [{ ...actual[0], monto: String(total), montoTocado: true }]
          : actual
      return [
        ...primeraCongelada,
        { localId: crypto.randomUUID(), medioPago: 'EFECTIVO', monto: '', montoTocado: false },
      ]
    })
  }

  const actualizarPago = (localId: string, cambios: Partial<PagoLinea>) => {
    setPagos((actual) => actual.map((p) => (p.localId === localId ? { ...p, ...cambios } : p)))
  }

  const quitarPago = (localId: string) => {
    setPagos((actual) => actual.filter((p) => p.localId !== localId))
  }

  const construirInputVenta = (incluirPagos = true) => {
    const pagosInput: PagoInput[] = incluirPagos
      ? pagos
          .map((p) => ({ medioPago: p.medioPago, monto: montoEfectivo(p, esUnicoPago, total) }))
          .filter((p) => p.monto > 0)
      : []

    return {
      cliente: clienteSeleccionado
        ? {
            id: clienteSeleccionado.id,
            nombre: clienteSeleccionado.nombre,
            apellido: clienteSeleccionado.apellido,
            tipo: clienteSeleccionado.tipo,
          }
        : undefined,
      items: carrito.map((i) => ({
        varianteId: i.varianteId,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        descuentoItem: Number(i.descuentoItem) || 0,
      })),
      pagos: pagosInput,
      descuentoTotal: descuentoGeneral,
    }
  }

  const resetearFormulario = () => {
    setCarrito([])
    setClienteSeleccionado(null)
    setBusquedaCliente('')
    setDescuentoTotal('')
    setPagos([{ localId: crypto.randomUUID(), medioPago: 'EFECTIVO', monto: '', montoTocado: false }])
    busquedaInputRef.current?.focus()
  }

  const handleCobrar = async (): Promise<boolean> => {
    setError(null)
    setUltimaVenta(null)
    setGuardando(true)
    try {
      const venta = await crearVenta(construirInputVenta())
      setUltimaVenta(`Venta registrada: ${venta.codigoVenta}`)
      setVentaParaTicket(venta)
      resetearFormulario()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la venta')
      return false
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarPedido = async () => {
    setError(null)
    setUltimaVenta(null)
    setGuardando(true)
    try {
      const pedido = await crearPedido(construirInputVenta(false))
      setUltimaVenta(
        `Pedido guardado como pendiente: ${pedido.codigoVenta} — el stock queda reservado hasta completar el pago.`,
      )
      resetearFormulario()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el pedido')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Nueva venta</h1>
        <Link to="/ventas/historial" className="text-sm font-medium text-gray-700 hover:text-gray-900">
          Ver historial →
        </Link>
      </div>

      {ultimaVenta && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{ultimaVenta}</p>
      )}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="flex min-h-0 flex-1 flex-col lg:col-span-2">
          <div className="relative shrink-0">
            <input
              ref={busquedaInputRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => void handleBusquedaKeyDown(e)}
              placeholder="Buscar por nombre, SKU o escanear código de barras... (Enter para agregar / cobrar)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              autoFocus
            />
            {busqueda.trim() && (
              <div className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                {buscando && <p className="px-3 py-2 text-sm text-gray-500">Buscando...</p>}
                {!buscando && resultados.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-500">Sin resultados.</p>
                )}
                {!buscando && resultadosMismoProducto && (
                  <div className="p-3" style={{ minHeight: '120px' }}>
                    <p className="mb-2 text-sm font-medium text-gray-900">
                      {resultados[0].producto.nombre}
                    </p>
                    <SelectorColorTalle
                      ref={selectorRef}
                      variantes={resultados.map((r) => r.variante)}
                      onConfirmar={(seleccion) => {
                        const producto = resultados[0].producto
                        for (const { variante, cantidad } of seleccion) {
                          agregarAlCarrito({ producto, variante }, cantidad)
                        }
                        setBusqueda('')
                      }}
                    />
                  </div>
                )}
                {!buscando &&
                  !resultadosMismoProducto &&
                  resultados.map((r) => {
                    const disponible = r.variante.stock - r.variante.stockReservado
                    return (
                      <button
                        key={r.variante.id}
                        type="button"
                        onClick={() => agregarAlCarrito(r)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <span>
                          {r.producto.nombre}{' '}
                          <span className="text-gray-500">
                            · {r.variante.color.nombre}/{r.variante.talla.nombre} · {r.variante.sku}
                          </span>
                        </span>
                        <span className={disponible <= 0 ? 'text-red-600' : 'text-gray-500'}>
                          {disponible <= 0 ? 'sin stock' : `stock ${disponible}`}
                        </span>
                      </button>
                    )
                  })}
              </div>
            )}
          </div>

          <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setMostrarCatalogo((v) => !v)}
              className="flex w-full shrink-0 items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Elegir producto sin escáner
              <span className="text-gray-400">{mostrarCatalogo ? '▴' : '▾'}</span>
            </button>

            {mostrarCatalogo && (
              <div className="flex min-h-0 flex-1 flex-col border-t border-gray-100 p-3">
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategoriaCatalogo('todas')}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      categoriaCatalogo === 'todas'
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
                      onClick={() => setCategoriaCatalogo(c.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        categoriaCatalogo === c.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>

                <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {catalogoFiltrado.map((producto) => {
                      const expandido = productoExpandidoId === producto.id
                      return (
                        <div key={producto.id} className="rounded-md border border-gray-200 p-2">
                          <button
                            type="button"
                            onClick={() => setProductoExpandidoId(expandido ? null : producto.id)}
                            className="w-full text-left text-sm"
                          >
                            <p className="truncate text-gray-900">{producto.nombre}</p>
                            <p className="text-xs text-gray-500">{formatPrecio.format(producto.precioBase)}</p>
                          </button>

                          {expandido && (
                            <div className="mt-2 flex flex-col border-t border-gray-100 pt-2" style={{ minHeight: '120px' }}>
                              <SelectorColorTalle
                                variantes={producto.variantes.filter((v) => v.activo && v.color && v.talla) as unknown as VarianteParaSelector[]}
                                onConfirmar={(seleccion) => {
                                  for (const { variante, cantidad } of seleccion) {
                                    agregarAlCarrito({ producto, variante }, cantidad)
                                  }
                                  setProductoExpandidoId(null)
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        <div ref={carritoRef} className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden shrink-0 lg:shrink lg:sticky lg:top-6 lg:h-fit lg:max-h-[calc(100vh-3rem)]">
          {/* Header */}
          <div className="shrink-0 border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Venta actual</h2>
          </div>

          {/* Contenido scrolleable */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {carrito.length === 0 ? (
              <p className="text-sm text-gray-500">
                Buscá un producto o elegilo del catálogo para agregarlo.
              </p>
            ) : (
              <>
                {carritoAgrupado.map((grupo) => {
                  const subtotalGrupo = grupo.items.reduce(
                    (acc, i) => acc + i.cantidad * i.precioUnitario - (Number(i.descuentoItem) || 0),
                    0,
                  )
                  const primerPrecio = grupo.items[0]?.precioUnitario ?? 0
                  const esEliminando = eliminandoProducto === grupo.producto.id
                  const esFlash = flashProductoId === grupo.producto.id
                  const totalUnidades = grupo.items.reduce((acc, i) => acc + i.cantidad, 0)
                  return (
                    <div
                      key={grupo.producto.id}
                      className={`rounded-md border border-gray-100 p-2.5 transition-colors duration-500 ${esFlash ? 'bg-green-50 border-green-200' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{grupo.producto.nombre}</p>
                          <p className="text-[11px] text-gray-400">{totalUnidades} uds. · {formatPrecio.format(subtotalGrupo)}</p>
                        </div>
                        {esEliminando ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => ejecutarEliminarProducto(grupo.producto.id, grupo.producto.nombre)}
                              className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEliminandoProducto(null)}
                              className="rounded border border-gray-300 px-2 py-0.5 text-[11px] text-gray-600 hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => confirmarEliminarProducto(grupo.producto.id)}
                            className="text-xs text-gray-400 hover:text-red-600 shrink-0 ml-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Variantes compactas */}
                      <div className="mt-2 space-y-1">
                        {grupo.items.map((item) => {
                          const esVarEliminando = eliminandoVariante === item.varianteId
                          return (
                            <div
                              key={item.varianteId}
                              className="flex items-center gap-1.5 rounded bg-gray-50 px-2 py-1"
                            >
                              <span
                                className="h-2 w-2 shrink-0 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.variante.color.codigoHex }}
                              />
                              <span className="text-[11px] text-gray-600 shrink-0 min-w-0 truncate">
                                {item.variante.color.nombre}/{item.variante.talla.nombre}
                              </span>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidadCarrito(item.varianteId, -1)}
                                  disabled={item.cantidad <= 0}
                                  className="h-4 w-4 rounded border border-gray-300 text-[10px] leading-none text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  −
                                </button>
                                <span className="w-4 text-center text-[11px] font-medium text-gray-900">{item.cantidad}</span>
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidadCarrito(item.varianteId, 1)}
                                  disabled={item.cantidad >= item.disponible}
                                  className="h-4 w-4 rounded border border-gray-300 text-[10px] leading-none text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>
                              <span className="ml-auto text-[11px] font-medium text-gray-900 shrink-0">
                                {formatPrecio.format(item.cantidad * item.precioUnitario)}
                              </span>
                              {esVarEliminando ? (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => ejecutarEliminarVariante(item.varianteId, grupo.producto.nombre)}
                                    className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-700"
                                  >
                                    Quitar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEliminandoVariante(null)}
                                    className="text-[10px] text-gray-400 hover:text-gray-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => confirmarEliminarVariante(item.varianteId)}
                                  className="text-[10px] text-gray-300 hover:text-red-500 shrink-0"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Precio c/u */}
                      <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        <span className="text-[10px] text-gray-400">Precio c/u</span>
                        <input
                          type="number"
                          min={0}
                          value={primerPrecio}
                          onChange={(e) =>
                            actualizarPrecioProducto(grupo.producto.id, Number(e.target.value) || 0)
                          }
                          className="w-16 rounded border border-gray-200 px-1 py-0.5 text-right text-[10px] text-gray-700 focus:border-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )
                })}

                {/* Cliente */}
                <div className="rounded-md border border-gray-100 p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">Cliente</p>
                  <div className="flex items-center gap-1.5">
                    {(['MINORISTA', 'MAYORISTA'] as TipoCliente[]).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => {
                          const gen = (genericos as Record<string, Cliente | null>)[tipo]
                          if (gen) setClienteSeleccionado(gen)
                        }}
                        className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                          clienteSeleccionado?.tipo === tipo && clienteSeleccionado?.esGenerico
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {NOMBRE_TIPO_CLIENTE[tipo]}
                      </button>
                    ))}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full rounded-md border border-gray-200 px-2 py-1 text-[11px] focus:border-gray-400 focus:outline-none"
                      />
                      {busquedaCliente.trim() && (
                        <div className="absolute z-10 mt-1 max-h-32 overflow-y-auto w-full rounded-md border border-gray-200 bg-white shadow-sm">
                          {resultadosClientes.length === 0 && (
                            <p className="px-2 py-1.5 text-[11px] text-gray-500">Sin resultados.</p>
                          )}
                          {resultadosClientes.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => {
                                setClienteSeleccionado(cliente)
                                setBusquedaCliente('')
                              }}
                              className="flex w-full items-center justify-between px-2 py-1.5 text-left text-[11px] hover:bg-gray-50"
                            >
                              <span>{cliente.nombre} {cliente.apellido}</span>
                              <span className="text-[10px] text-gray-400">{NOMBRE_TIPO_CLIENTE[cliente.tipo]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {clienteSeleccionado && !clienteSeleccionado.esGenerico && (
                      <button
                        type="button"
                        onClick={() => setClienteSeleccionado(null)}
                        className="shrink-0 text-[10px] text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Descuento */}
                <label className="block text-[11px] text-gray-500">
                  Descuento general
                  <input
                    type="number"
                    min={0}
                    value={descuentoTotal}
                    onChange={(e) => setDescuentoTotal(e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-gray-400 focus:outline-none"
                  />
                </label>

                {/* Pagos */}
                <div className="rounded-md border border-gray-100 p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Pagos</p>
                    <button
                      type="button"
                      onClick={agregarPago}
                      className="text-[11px] font-medium text-gray-600 hover:text-gray-900"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {pagos.map((pago) => (
                      <div key={pago.localId} className="flex gap-1.5">
                        <select
                          value={pago.medioPago}
                          onChange={(e) =>
                            actualizarPago(pago.localId, { medioPago: e.target.value as MedioPago })
                          }
                          className="flex-1 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]"
                        >
                          {MEDIOS_PAGO_HABILITADOS.map((medio) => (
                            <option key={medio} value={medio}>
                              {NOMBRE_MEDIO_PAGO[medio]}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={0}
                          value={esUnicoPago && !pago.montoTocado ? total : pago.monto}
                          onChange={(e) =>
                            actualizarPago(pago.localId, {
                              monto: e.target.value,
                              montoTocado: e.target.value.trim() !== '',
                            })
                          }
                          placeholder="Monto"
                          className="w-20 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]"
                        />
                        {pagos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => quitarPago(pago.localId)}
                            className="text-[10px] text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className={`mt-1.5 text-[11px] ${diferencia < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {diferencia < 0
                      ? `Falta ${formatPrecio.format(-diferencia)}`
                      : diferencia > 0
                        ? `Vuelto ${formatPrecio.format(diferencia)}`
                        : 'Pagos completos'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer fijo: totales + botones */}
          <div className="shrink-0 border-t border-gray-100 px-4 py-3 space-y-2 bg-gray-50/50">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <dt>Subtotal</dt>
                <dd>{formatPrecio.format(subtotal)}</dd>
              </div>
              {(descuentoItems + descuentoGeneral) > 0 && (
                <div className="flex justify-between text-gray-500">
                  <dt>Descuentos</dt>
                  <dd>-{formatPrecio.format(descuentoItems + descuentoGeneral)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <dt>Total</dt>
                <dd>{formatPrecio.format(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setMostrarConfirmacion(true)}
              disabled={!puedeCobrar}
              className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? 'Cobrando...' : 'Cobrar'}
            </button>
            <button
              type="button"
              onClick={handleGuardarPedido}
              disabled={carrito.length === 0 || guardando}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar como pedido
            </button>
          </div>
        </div>
      </div>

      {undoItems && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-900 px-4 py-2.5 shadow-lg">
            <span className="text-sm text-gray-300">
              {undoNombre} eliminado{undoItems.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={deshacerEliminacion}
              className="rounded-md bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              Deshacer
            </button>
          </div>
        </div>
      )}

      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-gray-900">Confirmar venta</h2>

            <div className="mt-3 max-h-60 space-y-1 overflow-y-auto">
              {carritoAgrupado.map((grupo) => {
                const sub = grupo.items.reduce(
                  (acc, i) => acc + i.cantidad * i.precioUnitario - (Number(i.descuentoItem) || 0),
                  0,
                )
                return (
                  <div key={grupo.producto.id} className="flex items-baseline justify-between text-sm">
                    <span className="text-gray-700">
                      {grupo.producto.nombre}
                      {grupo.items.length > 1 ? ` (${grupo.items.length} vars)` : ''}
                    </span>
                    <span className="font-medium text-gray-900">{formatPrecio.format(sub)}</span>
                  </div>
                )
              })}
            </div>

            <dl className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="text-gray-900">{formatPrecio.format(subtotal)}</dd>
              </div>
              {descuentoGeneral > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Descuento</dt>
                  <dd className="text-red-600">−{formatPrecio.format(descuentoGeneral)}</dd>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <dt className="text-gray-900">Total</dt>
                <dd className="text-gray-900">{formatPrecio.format(total)}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t border-gray-100 pt-3 text-sm space-y-1">
              {clienteSeleccionado && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="text-gray-900">
                    {NOMBRE_TIPO_CLIENTE[clienteSeleccionado.tipo]}
                    {clienteSeleccionado.esGenerico ? '' : ` — ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`}
                  </span>
                </div>
              )}
              {pagos.filter((p) => montoEfectivo(p, esUnicoPago, total) > 0).map((pago) => (
                <div key={pago.localId} className="flex justify-between">
                  <span className="text-gray-500">{NOMBRE_MEDIO_PAGO[pago.medioPago]}</span>
                  <span className="text-gray-900">{formatPrecio.format(montoEfectivo(pago, esUnicoPago, total))}</span>
                </div>
              ))}
              {diferencia > 0 && (
                <div className="flex justify-between font-medium">
                  <span className="text-gray-500">Vuelto</span>
                  <span className="text-gray-900">{formatPrecio.format(diferencia)}</span>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-2 rounded bg-red-50 px-3 py-1.5 text-xs text-red-700">{error}</p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmacion(false)
                  setError(null)
                }}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await handleCobrar()
                  if (ok) setMostrarConfirmacion(false)
                }}
                disabled={guardando}
                className="flex-1 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? 'Cobrando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ventaParaTicket && (
        <TicketVentaModal
          venta={ventaParaTicket}
          onCerrar={() => {
            setVentaParaTicket(null)
            busquedaInputRef.current?.focus()
          }}
        />
      )}

      <ConfirmModal
        abierto={mostrarConfirmarNuevaVenta}
        titulo="Nueva venta"
        mensaje="¿Limpiar el carrito y empezar una nueva venta?"
        textoAccion="Limpiar"
        variant="warning"
        onConfirmar={() => {
          setMostrarConfirmarNuevaVenta(false)
          resetearFormulario()
        }}
        onCancelar={() => setMostrarConfirmarNuevaVenta(false)}
      />
    </div>
  )
}
