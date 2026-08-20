import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buscarClientesParaVenta, editarDireccion, listarDirecciones, obtenerCliente } from '../../api/clientes.api'
import { crearEnvio, crearTransportista, listarTransportistas } from '../../api/envios.api'
import { buscarVentasParaEnvio, pedidosSinEnvio } from '../../api/ventas.api'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { formatPrecio } from '../../shared/format'
import { useDebounce } from '../../shared/hooks/useDebounce'
import type { Cliente } from '../../types/cliente'
import type { Direccion } from '../../types/direccion'
import type { EstadoVenta, Venta } from '../../types/venta'
import type { Transportista } from '../../types/envio'

const NOMBRE_ESTADO_VENTA: Record<EstadoVenta, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

export function EnvioFormPage() {
  const navigate = useNavigate()

  const [pedidosPendientes, setPedidosPendientes] = useState<Venta[] | null>(null)
  const [reloadPendientes, setReloadPendientes] = useState(0)

  const [busquedaVenta, setBusquedaVenta] = useState('')
  const terminoVentaDebounced = useDebounce(busquedaVenta, 250)
  const [resultadoVentas, setResultadoVentas] = useState<{ clave: string; datos: Venta[] } | null>(null)
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null)

  const [busquedaCliente, setBusquedaCliente] = useState('')
  const terminoDebounced = useDebounce(busquedaCliente, 250)
  const [resultadoClientes, setResultadoClientes] = useState<{ clave: string; datos: Cliente[] } | null>(
    null,
  )
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  const [direcciones, setDirecciones] = useState<Direccion[] | null>(null)
  const [direccionId, setDireccionId] = useState<number | null>(null)
  const [direccionOriginalId, setDireccionOriginalId] = useState<number | null>(null)

  const [transportistas, setTransportistas] = useState<Transportista[] | null>(null)
  const [transportistaId, setTransportistaId] = useState<number | null>(null)
  const [transportistaCustom, setTransportistaCustom] = useState('')
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false)
  const [nuevoTransportistaNombre, setNuevoTransportistaNombre] = useState('')
  const [agregandoTransportista, setAgregandoTransportista] = useState(false)

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarConfirmarDireccion, setMostrarConfirmarDireccion] = useState(false)

  useEffect(() => {
    let cancelado = false
    pedidosSinEnvio().then((datos) => {
      if (cancelado) return
      setPedidosPendientes(datos)
    })
    return () => {
      cancelado = true
    }
  }, [reloadPendientes])

  useEffect(() => {
    let cancelado = false
    listarTransportistas().then((datos) => {
      if (cancelado) return
      setTransportistas(datos)
      const genericos = datos.filter((t) => t.esGenerico)
      if (genericos.length > 0) {
        setTransportistaId(genericos[0].id)
      } else if (datos.length > 0) {
        setTransportistaId(datos[0].id)
      }
    })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!terminoVentaDebounced.trim()) return
    let cancelado = false
    buscarVentasParaEnvio(terminoVentaDebounced).then((datos) => {
      if (cancelado) return
      setResultadoVentas({ clave: terminoVentaDebounced, datos })
    })
    return () => {
      cancelado = true
    }
  }, [terminoVentaDebounced])

  const resultadosVentas =
    terminoVentaDebounced.trim() && resultadoVentas?.clave === terminoVentaDebounced
      ? resultadoVentas.datos
      : []

  useEffect(() => {
    if (!terminoDebounced.trim()) return
    let cancelado = false
    buscarClientesParaVenta(terminoDebounced).then((datos) => {
      if (cancelado) return
      setResultadoClientes({ clave: terminoDebounced, datos })
    })
    return () => {
      cancelado = true
    }
  }, [terminoDebounced])

  const resultados =
    terminoDebounced.trim() && resultadoClientes?.clave === terminoDebounced ? resultadoClientes.datos : []

  useEffect(() => {
    if (!ventaSeleccionada?.cliente) return
    let cancelado = false
    obtenerCliente(ventaSeleccionada.cliente.id).then((cliente) => {
      if (cancelado || !cliente) return
      setClienteSeleccionado(cliente)
    })
    return () => {
      cancelado = true
    }
  }, [ventaSeleccionada])

  useEffect(() => {
    if (!clienteSeleccionado) return
    let cancelado = false
    listarDirecciones(clienteSeleccionado.id).then((datos) => {
      if (cancelado) return
      setDirecciones(datos)
      const principal = datos.find((d) => d.esPrincipal)?.id ?? datos[0]?.id ?? null
      setDireccionId(principal)
      setDireccionOriginalId(principal)
    })
    return () => {
      cancelado = true
    }
  }, [clienteSeleccionado])

  const seleccionarVenta = (venta: Venta) => {
    setVentaSeleccionada(venta)
    setBusquedaVenta('')
  }

  const handleAgregarTransportista = async () => {
    if (!nuevoTransportistaNombre.trim()) return
    setAgregandoTransportista(true)
    try {
      const nuevo = await crearTransportista({ nombre: nuevoTransportistaNombre.trim() })
      setTransportistas((prev) => prev ? [...prev, nuevo] : [nuevo])
      setTransportistaId(nuevo.id)
      setTransportistaCustom('')
      setNuevoTransportistaNombre('')
      setMostrarFormAgregar(false)
    } catch {
      setError('No se pudo agregar el transportista')
    } finally {
      setAgregandoTransportista(false)
    }
  }

  const transportistaSeleccionado = transportistas?.find((t) => t.id === transportistaId)
  const esGenerico = transportistaSeleccionado?.esGenerico ?? false

  const direccionCambiada = direccionId !== null && direccionOriginalId !== null && direccionId !== direccionOriginalId

  const ejecutarEnvio = async () => {
    setGuardando(true)
    try {
      await crearEnvio({
        clienteId: clienteSeleccionado!.id,
        direccionId: direccionId!,
        ventaId: ventaSeleccionada?.id,
        transportistaId: esGenerico ? undefined : transportistaId ?? undefined,
        transportista: esGenerico ? transportistaCustom.trim() || undefined : undefined,
      })
      setReloadPendientes((v) => v + 1)
      navigate('/envios')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el envío')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarActualizarDireccion = async () => {
    const dirActual = direcciones?.find((d) => d.id === direccionId)
    if (dirActual) {
      editarDireccion(dirActual.id, {
        direccion: dirActual.direccion,
        localidad: dirActual.localidad,
        provincia: dirActual.provincia,
        codigoPostal: dirActual.codigoPostal,
        observaciones: dirActual.observaciones,
        esPrincipal: true,
      }).catch(() => {})
    }
    setMostrarConfirmarDireccion(false)
    await ejecutarEnvio()
  }

  const saltarActualizarDireccion = async () => {
    setMostrarConfirmarDireccion(false)
    await ejecutarEnvio()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!clienteSeleccionado) {
      setError('Elegí un cliente.')
      return
    }
    if (!direccionId) {
      setError('Elegí una dirección de entrega.')
      return
    }
    if (!transportistaId && !transportistaCustom.trim()) {
      setError('Elegí un transportista o escribí uno.')
      return
    }

    if (direccionCambiada) {
      setMostrarConfirmarDireccion(true)
      return
    }

    await ejecutarEnvio()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Nuevo envío</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">Venta asociada (opcional)</p>
            {ventaSeleccionada ? (
              <div className="mt-1 flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm">
                <span className="text-gray-900">
                  {ventaSeleccionada.codigoVenta}
                  <span className="ml-2 text-xs text-gray-400">
                    {NOMBRE_ESTADO_VENTA[ventaSeleccionada.estadoVenta]}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setVentaSeleccionada(null)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative mt-1">
                <input
                  type="text"
                  value={busquedaVenta}
                  onChange={(e) => setBusquedaVenta(e.target.value)}
                  placeholder="Buscar por código de venta o cliente..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
                {busquedaVenta.trim() && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm">
                    {resultadosVentas.length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-500">Sin resultados.</p>
                    )}
                    {resultadosVentas.map((venta) => (
                      <button
                        key={venta.id}
                        type="button"
                        onClick={() => seleccionarVenta(venta)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <span>
                          {venta.codigoVenta}
                          {venta.cliente && (
                            <span className="ml-2 text-gray-500">
                              {venta.cliente.nombre} {venta.cliente.apellido}
                            </span>
                          )}
                        </span>
                        <span
                          className={
                            venta.estadoVenta === 'PENDIENTE'
                              ? 'rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700'
                              : 'text-xs text-gray-400'
                          }
                        >
                          {NOMBRE_ESTADO_VENTA[venta.estadoVenta]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-400">
              O elegí uno de los pedidos pendientes del costado — autocompleta el cliente de abajo.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">Cliente</p>
            {clienteSeleccionado ? (
              <div className="mt-1 flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm">
                <span className="text-gray-900">
                  {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setClienteSeleccionado(null)
                    setDirecciones(null)
                    setDireccionId(null)
                    setDireccionOriginalId(null)
                  }}
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
                  placeholder="Buscar por nombre, teléfono o DNI..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
                {busquedaCliente.trim() && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm">
                    {resultados.length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-500">Sin resultados.</p>
                    )}
                    {resultados.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => {
                          setClienteSeleccionado(cliente)
                          setBusquedaCliente('')
                        }}
                        className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {cliente.nombre} {cliente.apellido}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {clienteSeleccionado && (
              <div className="mt-3">
                <p className="text-sm text-gray-700">Dirección de entrega</p>
                {direcciones === null && <p className="mt-1 text-sm text-gray-500">Cargando...</p>}
                {direcciones !== null && direcciones.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Este cliente no tiene direcciones cargadas.{' '}
                    <Link
                      to={`/clientes/${clienteSeleccionado.id}/editar`}
                      className="font-medium text-gray-700 underline hover:text-gray-900"
                    >
                      Cargar una
                    </Link>
                  </p>
                )}
                {direcciones !== null && direcciones.length > 0 && (
                  <div className="mt-1 space-y-1.5">
                    {direcciones.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-start gap-2 rounded-md border border-gray-200 p-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="direccion"
                          checked={direccionId === d.id}
                          onChange={() => setDireccionId(d.id)}
                          className="mt-1"
                        />
                        <span>
                          {d.direccion}
                          {d.esPrincipal && (
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              Principal
                            </span>
                          )}
                          <div className="text-xs text-gray-500">
                            {d.localidad}, {d.provincia} {d.codigoPostal && `(${d.codigoPostal})`}
                          </div>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {direccionCambiada && (
                  <p className="mt-2 text-xs text-amber-600">
                    ⚠ Elegiste una dirección distinta a la principal. Se te preguntará si querés actualizarla.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">Transportista</p>
            {transportistas === null ? (
              <p className="mt-1 text-sm text-gray-500">Cargando...</p>
            ) : (
              <div className="mt-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {transportistas.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTransportistaId(t.id)
                        setTransportistaCustom('')
                      }}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        transportistaId === t.id
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t.nombre}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMostrarFormAgregar(!mostrarFormAgregar)}
                    className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
                  >
                    + Agregar
                  </button>
                </div>
                {mostrarFormAgregar && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nuevoTransportistaNombre}
                      onChange={(e) => setNuevoTransportistaNombre(e.target.value)}
                      placeholder="Nombre del nuevo transportista"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAgregarTransportista()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAgregarTransportista}
                      disabled={!nuevoTransportistaNombre.trim() || agregandoTransportista}
                      className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {agregandoTransportista ? '...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormAgregar(false)
                        setNuevoTransportistaNombre('')
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                {esGenerico && (
                  <input
                    type="text"
                    value={transportistaCustom}
                    onChange={(e) => setTransportistaCustom(e.target.value)}
                    placeholder="Nombre del transportista (ej: Moto, Correo local...)"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Registrar envío'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/envios')}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-gray-200 bg-white p-4 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-sm font-semibold text-gray-900">Pedidos pendientes</h2>
          <p className="mt-1 text-xs text-gray-400">
            Tocá uno para asociarlo — se completa el cliente y la venta solos, vos solo verificás.
          </p>

          {pedidosPendientes === null && <p className="mt-3 text-sm text-gray-500">Cargando...</p>}
          {pedidosPendientes !== null && pedidosPendientes.length === 0 && (
            <p className="mt-3 text-sm text-gray-500">No hay pedidos pendientes ahora mismo.</p>
          )}

          {pedidosPendientes !== null && pedidosPendientes.length > 0 && (
            <div className="mt-3 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {pedidosPendientes.map((venta) => {
                const activo = ventaSeleccionada?.id === venta.id
                return (
                  <button
                    key={venta.id}
                    type="button"
                    onClick={() => seleccionarVenta(venta)}
                    className={`w-full rounded-md border p-2.5 text-left text-sm ${
                      activo
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-500">{venta.codigoVenta}</span>
                      <span className="font-medium text-gray-900">{formatPrecio.format(venta.total)}</span>
                    </div>
                    <p className="mt-0.5 text-gray-900">
                      {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Sin cliente'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {venta.detalles.reduce((acc, d) => acc + d.cantidad, 0)} u. ·{' '}
                      {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(
                        new Date(venta.fechaVenta),
                      )}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        abierto={mostrarConfirmarDireccion}
        titulo="Actualizar dirección principal"
        mensaje="La dirección elegida es distinta a la principal del cliente. ¿Querés actualizar la dirección principal del cliente con esta nueva?"
        textoAccion="Actualizar y enviar"
        variant="warning"
        onConfirmar={confirmarActualizarDireccion}
        onCancelar={saltarActualizarDireccion}
      />
    </div>
  )
}
