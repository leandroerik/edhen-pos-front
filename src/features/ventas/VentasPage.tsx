import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarClientesParaVenta } from '../../api/clientes.api'
import { buscarVariantesParaVenta, listarProductos } from '../../api/productos.api'
import { crearPedido, crearVenta, type PagoInput } from '../../api/ventas.api'
import { categoriasMock } from '../productos/mocks/catalogos.mock'
import { SelectorColorTalle } from './components/SelectorColorTalle'
import { TicketVentaModal } from './components/TicketVentaModal'
import type { Cliente } from '../../types/cliente'
import type { Color } from '../../types/color'
import type { Producto } from '../../types/producto'
import type { Talla } from '../../types/talla'
import type { MedioPago, Venta } from '../../types/venta'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const MEDIOS_PAGO_HABILITADOS: MedioPago[] = ['EFECTIVO', 'TRANSFERENCIA']

const NOMBRE_TIPO_CLIENTE: Record<Cliente['tipo'], string> = {
  MAYORISTA: 'Mayorista',
  MINORISTA: 'Minorista',
  OTRO: 'Otro',
}

const NOMBRE_MEDIO_PAGO: Record<MedioPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA_DEBITO: 'Tarjeta débito',
  TARJETA_CREDITO: 'Tarjeta crédito',
  MERCADO_PAGO: 'Mercado Pago',
  CUENTA_CORRIENTE: 'Cuenta corriente',
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
  const [mostrarCatalogo, setMostrarCatalogo] = useState(true)
  const [categoriaCatalogo, setCategoriaCatalogo] = useState<number | 'todas'>('todas')
  const [productoExpandidoId, setProductoExpandidoId] = useState<number | null>(null)

  const [carrito, setCarrito] = useState<ItemCarrito[]>([])

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [terminoClienteDebounced, setTerminoClienteDebounced] = useState('')
  const [resultadoClientes, setResultadoClientes] = useState<{ clave: string; datos: Cliente[] } | null>(
    null,
  )

  const [descuentoTotal, setDescuentoTotal] = useState('')
  const [pagos, setPagos] = useState<PagoLinea[]>([
    { localId: crypto.randomUUID(), medioPago: 'EFECTIVO', monto: '', montoTocado: false },
  ])

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ultimaVenta, setUltimaVenta] = useState<string | null>(null)
  const [ventaParaTicket, setVentaParaTicket] = useState<Venta | null>(null)

  const busquedaInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelado = false
    listarProductos({ activo: true }).then((datos) => {
      if (cancelado) return
      setCatalogo(datos)
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
      setResultadoBusqueda({ clave: terminoDebounced, datos })
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
    if (encontrados.length === 1) {
      agregarAlCarrito(encontrados[0])
    } else {
      setResultadoBusqueda({ clave: termino, datos: encontrados })
      setTerminoDebounced(termino)
    }
  }


  const actualizarItem = (varianteId: number, cambios: Partial<ItemCarrito>) => {
    setCarrito((actual) =>
      actual.map((i) => (i.varianteId === varianteId ? { ...i, ...cambios } : i)),
    )
  }

  const cambiarCantidadCarrito = (varianteId: number, delta: number) => {
    setCarrito((actual) =>
      actual.map((i) =>
        i.varianteId === varianteId
          ? { ...i, cantidad: Math.max(1, Math.min(i.disponible, i.cantidad + delta)) }
          : i,
      ),
    )
  }

  const quitarItem = (varianteId: number) => {
    setCarrito((actual) => actual.filter((i) => i.varianteId !== varianteId))
  }

  const subtotal = carrito.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0)
  const descuentoItems = carrito.reduce((acc, i) => acc + (Number(i.descuentoItem) || 0), 0)
  const descuentoGeneral = Number(descuentoTotal) || 0
  const total = Math.max(0, subtotal - descuentoItems - descuentoGeneral)

  const esUnicoPago = pagos.length === 1
  const totalPagado = pagos.reduce((acc, p) => acc + montoEfectivo(p, esUnicoPago, total), 0)
  const diferencia = totalPagado - total

  const puedeCobrar = carrito.length > 0 && totalPagado >= total && !guardando

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

  const construirInputVenta = () => {
    const pagosInput: PagoInput[] = pagos
      .map((p) => ({ medioPago: p.medioPago, monto: montoEfectivo(p, esUnicoPago, total) }))
      .filter((p) => p.monto > 0)

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

  const handleCobrar = async () => {
    setError(null)
    setUltimaVenta(null)
    setGuardando(true)
    try {
      const venta = await crearVenta(construirInputVenta())
      setUltimaVenta(`Venta registrada: ${venta.codigoVenta}`)
      setVentaParaTicket(venta)
      resetearFormulario()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la venta')
    } finally {
      setGuardando(false)
    }
  }

  const handleGuardarPedido = async () => {
    setError(null)
    setUltimaVenta(null)
    setGuardando(true)
    try {
      const pedido = await crearPedido(construirInputVenta())
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
    <div>
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative">
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
              <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm">
                {buscando && <p className="px-3 py-2 text-sm text-gray-500">Buscando...</p>}
                {!buscando && resultados.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-500">Sin resultados.</p>
                )}
                {!buscando && resultadosMismoProducto && (
                  <div className="p-3">
                    <p className="mb-2 text-sm font-medium text-gray-900">
                      {resultados[0].producto.nombre}
                    </p>
                    <SelectorColorTalle
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

          <div className="mt-3 rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setMostrarCatalogo((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Elegir producto sin escáner
              <span className="text-gray-400">{mostrarCatalogo ? '▴' : '▾'}</span>
            </button>

            {mostrarCatalogo && (
              <div className="border-t border-gray-100 p-3">
                <div className="flex flex-wrap gap-1.5">
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
                  {categoriasMock.map((c) => (
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

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                          <div className="mt-2 border-t border-gray-100 pt-2">
                            <SelectorColorTalle
                              variantes={producto.variantes.filter((v) => v.activo)}
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
            )}
          </div>

        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-sm font-semibold text-gray-900">Venta actual</h2>

          {carrito.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              Buscá un producto o elegilo del catálogo para agregarlo.
            </p>
          ) : (
            <div className="mt-2 max-h-72 space-y-3 overflow-y-auto pr-1">
              {carrito.map((item) => {
                const subtotalItem = item.cantidad * item.precioUnitario - (Number(item.descuentoItem) || 0)
                return (
                  <div key={item.varianteId} className="border-b border-gray-100 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {item.variante.color.nombre}/{item.variante.talla.nombre}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => quitarItem(item.varianteId)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => cambiarCantidadCarrito(item.varianteId, -1)}
                          disabled={item.cantidad <= 1}
                          className="h-5 w-5 rounded-md border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs text-gray-900">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidadCarrito(item.varianteId, 1)}
                          disabled={item.cantidad >= item.disponible}
                          className="h-5 w-5 rounded-md border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrecio.format(subtotalItem)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <label className="flex items-center gap-1">
                        Precio
                        <input
                          type="number"
                          min={0}
                          value={item.precioUnitario}
                          onChange={(e) =>
                            actualizarItem(item.varianteId, { precioUnitario: Number(e.target.value) || 0 })
                          }
                          className="w-16 rounded-md border border-gray-300 px-1.5 py-0.5 text-right text-xs text-gray-700"
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        Desc.
                        <input
                          type="number"
                          min={0}
                          value={item.descuentoItem}
                          onChange={(e) => actualizarItem(item.varianteId, { descuentoItem: e.target.value })}
                          placeholder="0"
                          className="w-14 rounded-md border border-gray-300 px-1.5 py-0.5 text-right text-xs text-gray-700"
                        />
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-700">Cliente</p>
            {clienteSeleccionado ? (
              <div className="mt-1 flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm">
                <span className="text-gray-900">
                  {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                  <span className="ml-1 text-xs text-gray-400">
                    ({NOMBRE_TIPO_CLIENTE[clienteSeleccionado.tipo]})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setClienteSeleccionado(null)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative mt-1">
                <input
                  type="text"
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  placeholder="Venta mostrador (opcional: buscar cliente)"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
                {busquedaCliente.trim() && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm">
                    {resultadosClientes.length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-500">Sin resultados.</p>
                    )}
                    {resultadosClientes.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => {
                          setClienteSeleccionado(cliente)
                          setBusquedaCliente('')
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <span>
                          {cliente.nombre} {cliente.apellido}
                        </span>
                        <span className="text-xs text-gray-400">{NOMBRE_TIPO_CLIENTE[cliente.tipo]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="mt-3 block text-sm text-gray-700">
            Descuento general
            <input
              type="number"
              min={0}
              value={descuentoTotal}
              onChange={(e) => setDescuentoTotal(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>

          <dl className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <dt>Subtotal</dt>
              <dd>{formatPrecio.format(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-gray-500">
              <dt>Descuentos</dt>
              <dd>-{formatPrecio.format(descuentoItems + descuentoGeneral)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <dt>Total</dt>
              <dd>{formatPrecio.format(total)}</dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Pagos</h2>
              <button
                type="button"
                onClick={agregarPago}
                className="text-xs font-medium text-gray-700 hover:text-gray-900"
              >
                + Agregar
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {pagos.map((pago) => (
                <div key={pago.localId} className="flex gap-2">
                  <select
                    value={pago.medioPago}
                    onChange={(e) =>
                      actualizarPago(pago.localId, { medioPago: e.target.value as MedioPago })
                    }
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
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
                    className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  />
                  {pagos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => quitarPago(pago.localId)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className={`mt-2 text-xs ${diferencia < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {diferencia < 0
                ? `Falta ${formatPrecio.format(-diferencia)}`
                : diferencia > 0
                  ? `Vuelto ${formatPrecio.format(diferencia)}`
                  : 'Pagos completos'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCobrar}
            disabled={!puedeCobrar}
            className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? 'Cobrando...' : 'Cobrar'}
          </button>
          <button
            type="button"
            onClick={handleGuardarPedido}
            disabled={carrito.length === 0 || guardando}
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar como pedido pendiente
          </button>
          <p className="mt-1 text-xs text-gray-400">
            Reserva el stock sin descontarlo — para cuando falta cobrar o retirar.
          </p>
        </div>
      </div>

      {ventaParaTicket && (
        <TicketVentaModal
          venta={ventaParaTicket}
          onCerrar={() => {
            setVentaParaTicket(null)
            busquedaInputRef.current?.focus()
          }}
        />
      )}
    </div>
  )
}
