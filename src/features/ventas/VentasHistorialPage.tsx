import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { anularVenta, cancelarPedido, completarPagoVenta, listarVentas } from '../../api/ventas.api'
import { TicketVentaModal } from './components/TicketVentaModal'
import type { EstadoVenta, MedioPago, Venta } from '../../types/venta'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const MEDIOS_PAGO_HABILITADOS: MedioPago[] = ['EFECTIVO', 'TRANSFERENCIA']

const NOMBRE_MEDIO_PAGO: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA_DEBITO: 'Tarjeta débito',
  TARJETA_CREDITO: 'Tarjeta crédito',
  MERCADO_PAGO: 'Mercado Pago',
  CUENTA_CORRIENTE: 'Cuenta corriente',
}

const NOMBRE_ESTADO_VENTA: Record<EstadoVenta, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

type FiltroEstado = 'todos' | EstadoVenta

interface Resultado {
  clave: string
  ventas: Venta[]
}

function DetalleVentaModal({ venta, onCerrar }: { venta: Venta; onCerrar: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-gray-500">{venta.codigoVenta}</p>
            <p className="text-sm text-gray-500">{formatFecha.format(new Date(venta.fechaVenta))}</p>
            <p className="text-sm text-gray-700">
              {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Venta mostrador'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="pb-1.5 font-semibold">Producto</th>
              <th className="pb-1.5 pl-3 text-right font-semibold">Cant.</th>
              <th className="pb-1.5 pl-3 text-right font-semibold">Precio</th>
              <th className="pb-1.5 pl-3 text-right font-semibold">Desc.</th>
              <th className="pb-1.5 pl-3 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {venta.detalles.map((detalle) => (
              <tr key={detalle.id}>
                <td className="py-2 pr-3 text-gray-900">
                  {detalle.producto.nombre}
                  <div className="text-xs text-gray-500">
                    {detalle.variante.color.nombre}/{detalle.variante.talla.nombre} · {detalle.variante.sku}
                  </div>
                </td>
                <td className="py-2 pl-3 text-right text-gray-600">{detalle.cantidad}</td>
                <td className="py-2 pl-3 text-right text-gray-600">
                  {formatPrecio.format(detalle.precioUnitario)}
                </td>
                <td className="py-2 pl-3 text-right text-gray-600">
                  {detalle.descuentoItem > 0 ? `-${formatPrecio.format(detalle.descuentoItem)}` : '—'}
                </td>
                <td className="py-2 pl-3 text-right font-medium text-gray-900">
                  {formatPrecio.format(detalle.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex flex-col gap-2 border-t border-gray-200 pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600">
            Pagos:{' '}
            {venta.pagos.length === 0
              ? 'sin pagos todavía'
              : venta.pagos
                  .map(
                    (p) => `${NOMBRE_MEDIO_PAGO[p.medioPago] ?? p.medioPago} ${formatPrecio.format(p.monto)}`,
                  )
                  .join(' + ')}
          </p>
          <p className="text-gray-600">
            Subtotal {formatPrecio.format(venta.subtotal)} · Descuentos{' '}
            {formatPrecio.format(venta.descuentoTotal)} ·{' '}
            <span className="font-semibold text-gray-900">Total {formatPrecio.format(venta.total)}</span>
          </p>
        </div>

        {venta.observaciones && (
          <p className="mt-2 text-xs text-gray-500">Obs: {venta.observaciones}</p>
        )}
      </div>
    </div>
  )
}

interface PagoLineaSimple {
  localId: string
  medioPago: MedioPago
  monto: string
}

function CompletarPagoModal({
  venta,
  onCerrar,
  onCompletado,
}: {
  venta: Venta
  onCerrar: () => void
  onCompletado: () => void
}) {
  const yaPagado = venta.pagos.reduce((acc, p) => acc + p.monto, 0)
  const falta = Math.max(0, venta.total - yaPagado)

  const [pagos, setPagos] = useState<PagoLineaSimple[]>([
    { localId: crypto.randomUUID(), medioPago: 'EFECTIVO', monto: String(falta) },
  ])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const agregarPago = () => {
    setPagos((actual) => [...actual, { localId: crypto.randomUUID(), medioPago: 'EFECTIVO', monto: '' }])
  }

  const actualizarPago = (localId: string, cambios: Partial<PagoLineaSimple>) => {
    setPagos((actual) => actual.map((p) => (p.localId === localId ? { ...p, ...cambios } : p)))
  }

  const quitarPago = (localId: string) => {
    setPagos((actual) => actual.filter((p) => p.localId !== localId))
  }

  const totalNuevo = pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0)

  const handleSubmit = async () => {
    setError(null)
    setGuardando(true)
    try {
      const pagosInput = pagos
        .map((p) => ({ medioPago: p.medioPago, monto: Number(p.monto) || 0 }))
        .filter((p) => p.monto > 0)
      await completarPagoVenta(venta.id, pagosInput)
      onCompletado()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el pago')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Completar pago</p>
            <p className="font-mono text-xs text-gray-500">{venta.codigoVenta}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <dt>Total</dt>
            <dd>{formatPrecio.format(venta.total)}</dd>
          </div>
          <div className="flex justify-between text-gray-500">
            <dt>Ya pagado</dt>
            <dd>{formatPrecio.format(yaPagado)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-gray-900">
            <dt>Falta</dt>
            <dd>{formatPrecio.format(falta)}</dd>
          </div>
        </dl>

        {error && <p className="mt-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700">{error}</p>}

        <div className="mt-3 space-y-2">
          {pagos.map((pago) => (
            <div key={pago.localId} className="flex gap-2">
              <select
                value={pago.medioPago}
                onChange={(e) => actualizarPago(pago.localId, { medioPago: e.target.value as MedioPago })}
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                {MEDIOS_PAGO_HABILITADOS.map((medio) => (
                  <option key={medio} value={medio}>
                    {NOMBRE_MEDIO_PAGO[medio] ?? medio}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={pago.monto}
                onChange={(e) => actualizarPago(pago.localId, { monto: e.target.value })}
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
        <button
          type="button"
          onClick={agregarPago}
          className="mt-1 text-xs font-medium text-gray-700 hover:text-gray-900"
        >
          + Agregar medio de pago
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={guardando || totalNuevo <= 0}
          className="mt-3 w-full rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Confirmar pago'}
        </button>
      </div>
    </div>
  )
}

const ESTADOS_VALIDOS: EstadoVenta[] = ['PENDIENTE', 'COMPLETADA', 'CANCELADA']

export function VentasHistorialPage() {
  // Permite entrar ya filtrado desde un acceso rápido (ej. Inicio →
  // "Pedidos pendientes"), vía /ventas/historial?estado=PENDIENTE.
  const [searchParams] = useSearchParams()
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>(() => {
    const estado = searchParams.get('estado')
    return ESTADOS_VALIDOS.includes(estado as EstadoVenta) ? (estado as EstadoVenta) : 'todos'
  })
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null)
  const [pedidoParaCompletar, setPedidoParaCompletar] = useState<Venta | null>(null)
  const [ventaParaTicket, setVentaParaTicket] = useState<Venta | null>(null)

  const clave = JSON.stringify({ filtroEstado, reloadToken })

  useEffect(() => {
    let cancelado = false
    listarVentas(filtroEstado === 'todos' ? {} : { estado: filtroEstado })
      .then((data) => {
        if (cancelado) return
        setResultado({ clave, ventas: data })
        setError(null)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el historial')
      })
    return () => {
      cancelado = true
    }
  }, [filtroEstado, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const ventas = resultado?.clave === clave ? resultado.ventas : []

  const handleAnular = async (id: number) => {
    setError(null)
    try {
      await anularVenta(id)
      setReloadToken((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo anular la venta')
    }
  }

  const handleCancelarPedido = async (id: number) => {
    setError(null)
    try {
      await cancelarPedido(id)
      setReloadToken((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el pedido')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link to="/ventas" className="text-sm text-gray-500 hover:text-gray-700">
            ← Nueva venta
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">Historial de ventas</h1>
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="COMPLETADA">Completadas</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Medios de pago
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ítems
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
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
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && ventas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                  Todavía no hay ventas registradas.
                </td>
              </tr>
            )}
            {!cargando &&
              ventas.map((venta) => (
                <tr
                  key={venta.id}
                  onClick={() => setVentaSeleccionada(venta)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{venta.codigoVenta}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatFecha.format(new Date(venta.fechaVenta))}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Mostrador'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {venta.pagos.length === 0
                      ? '—'
                      : venta.pagos.map((p) => NOMBRE_MEDIO_PAGO[p.medioPago] ?? p.medioPago).join(' + ')}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {venta.detalles.reduce((acc, d) => acc + d.cantidad, 0)} u.
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatPrecio.format(venta.total)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        venta.estadoVenta === 'COMPLETADA'
                          ? 'bg-green-100 text-green-700'
                          : venta.estadoVenta === 'CANCELADA'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {NOMBRE_ESTADO_VENTA[venta.estadoVenta]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setVentaSeleccionada(venta)}
                        className="font-medium text-gray-700 hover:text-gray-900"
                      >
                        Ver
                      </button>
                      {venta.estadoVenta === 'COMPLETADA' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setVentaParaTicket(venta)}
                            className="font-medium text-gray-700 hover:text-gray-900"
                          >
                            Imprimir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAnular(venta.id)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Anular
                          </button>
                        </>
                      )}
                      {venta.estadoVenta === 'PENDIENTE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPedidoParaCompletar(venta)}
                            className="font-medium text-gray-700 hover:text-gray-900"
                          >
                            Completar pago
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelarPedido(venta.id)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {ventaSeleccionada && (
        <DetalleVentaModal venta={ventaSeleccionada} onCerrar={() => setVentaSeleccionada(null)} />
      )}

      {pedidoParaCompletar && (
        <CompletarPagoModal
          venta={pedidoParaCompletar}
          onCerrar={() => setPedidoParaCompletar(null)}
          onCompletado={() => {
            setPedidoParaCompletar(null)
            setReloadToken((v) => v + 1)
          }}
        />
      )}

      {ventaParaTicket && (
        <TicketVentaModal venta={ventaParaTicket} onCerrar={() => setVentaParaTicket(null)} />
      )}
    </div>
  )
}
