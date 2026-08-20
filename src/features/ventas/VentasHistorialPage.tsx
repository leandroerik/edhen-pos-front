import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { anularVenta, cancelarPedido, descargarComprobante, listarVentasPaginadas } from '../../api/ventas.api'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { formatPrecio } from '../../shared/format'
import type { EstadoVenta, Venta } from '../../types/venta'
import { NOMBRE_MEDIO_PAGO } from '../../shared/constants'
import { CompletarPagoModal } from './components/CompletarPagoModal'
import { DetalleVentaModal } from './components/DetalleVentaModal'
import { TicketVentaModal } from './components/TicketVentaModal'

const formatFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function hoyInicio(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function semanaInicio(): string {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function mesInicio(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function agora(): string {
  return new Date().toISOString()
}

const NOMBRE_ESTADO_VENTA: Record<EstadoVenta, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

type FiltroEstado = 'todos' | EstadoVenta
type FiltroPeriodo = 'todos' | 'hoy' | 'semana' | 'mes' | 'rango'

interface Resultado {
  clave: string
  ventas: Venta[]
  totalItems: number
  totalPages: number
  currentPage: number
}

const ESTADOS_VALIDOS: EstadoVenta[] = ['PENDIENTE', 'COMPLETADA', 'CANCELADA']
const PAGE_SIZE = 20

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
  const [busqueda, setBusqueda] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>('todos')
  const [rangoDesde, setRangoDesde] = useState('')
  const [rangoHasta, setRangoHasta] = useState('')
  const [anularVentaId, setAnularVentaId] = useState<number | null>(null)
  const [cancelarPedidoId, setCancelarPedidoId] = useState<number | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)

  const irAPagina = (p: number) => setPaginaActual(p)

  const periodoDesde = filtroPeriodo === 'hoy' ? hoyInicio()
    : filtroPeriodo === 'semana' ? semanaInicio()
    : filtroPeriodo === 'mes' ? mesInicio()
    : filtroPeriodo === 'rango' && rangoDesde ? new Date(rangoDesde + 'T00:00:00').toISOString()
    : undefined

  const periodoHasta = filtroPeriodo === 'rango' && rangoHasta
    ? new Date(rangoHasta + 'T23:59:59').toISOString()
    : filtroPeriodo !== 'rango' && filtroPeriodo !== 'todos' ? agora()
    : undefined

  const clave = JSON.stringify({ filtroEstado, filtroPeriodo, periodoDesde, periodoHasta, paginaActual, reloadToken })

  useEffect(() => {
    let cancelado = false
    const filtro: { estado?: EstadoVenta; desde?: string; hasta?: string; page: number; size: number } = {
      page: paginaActual,
      size: PAGE_SIZE,
    }
    if (filtroEstado !== 'todos') filtro.estado = filtroEstado
    if (periodoDesde) filtro.desde = periodoDesde
    if (periodoHasta) filtro.hasta = periodoHasta
    listarVentasPaginadas(filtro)
      .then((pag) => {
        if (cancelado) return
        setResultado({ clave, ventas: pag.items, totalItems: pag.totalItems, totalPages: pag.totalPages, currentPage: pag.currentPage })
        setError(null)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el historial')
      })
    return () => {
      cancelado = true
    }
  }, [filtroEstado, filtroPeriodo, periodoDesde, periodoHasta, paginaActual, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const ventas = resultado?.clave === clave ? resultado.ventas : []

  const ventasFiltradas = busqueda.trim()
    ? ventas.filter((v) => {
        const term = busqueda.trim().toLowerCase()
        if (v.codigoVenta.toLowerCase().includes(term)) return true
        if (v.cliente?.nombre?.toLowerCase().includes(term)) return true
        if (v.cliente?.apellido?.toLowerCase().includes(term)) return true
        if (v.detalles.some((d) => d.producto.nombre.toLowerCase().includes(term))) return true
        return false
      })
    : ventas

  const handleAnular = async () => {
    const id = anularVentaId
    if (id === null) return
    setAnularVentaId(null)
    setError(null)
    try {
      await anularVenta(id)
      setReloadToken((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo anular la venta')
    }
  }

  const handleCancelarPedido = async () => {
    const id = cancelarPedidoId
    if (id === null) return
    setCancelarPedidoId(null)
    setError(null)
    try {
      await cancelarPedido(id)
      setReloadToken((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el pedido')
    }
  }

  const handleDescargarComprobante = async (id: number) => {
    try {
      const blob = await descargarComprobante(id)
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `comprobante-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo descargar el comprobante')
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
          onChange={(e) => { setFiltroEstado(e.target.value as FiltroEstado); setPaginaActual(0) }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="COMPLETADA">Completadas</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {([
          ['todos', 'Todo'],
          ['hoy', 'Hoy'],
          ['semana', 'Esta semana'],
          ['mes', 'Este mes'],
          ['rango', 'Rango'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setFiltroPeriodo(key); setPaginaActual(0) }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filtroPeriodo === key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}

        {filtroPeriodo === 'rango' && (
          <>
            <input
              type="date"
              value={rangoDesde}
              onChange={(e) => setRangoDesde(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-gray-500 focus:outline-none"
            />
            <span className="text-xs text-gray-400">a</span>
            <input
              type="date"
              value={rangoHasta}
              onChange={(e) => setRangoHasta(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-gray-500 focus:outline-none"
            />
          </>
        )}
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por código, cliente o producto..."
        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
      />

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 max-md:hidden">
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
            {!cargando && ventasFiltradas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                  {busqueda.trim() ? 'Sin resultados para esa búsqueda.' : 'Todavía no hay ventas registradas.'}
                </td>
              </tr>
            )}
            {!cargando &&
              ventasFiltradas.map((venta) => (
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
                            onClick={() => handleDescargarComprobante(venta.id)}
                            className="font-medium text-gray-700 hover:text-gray-900"
                          >
                            Comprobante
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnularVentaId(venta.id)}
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
                            Registrar pago
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelarPedidoId(venta.id)}
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

      {/* Mobile: cards */}
      <div className="mt-4 space-y-2 md:hidden">
        {cargando && (
          <p className="py-6 text-center text-sm text-gray-500">Cargando...</p>
        )}
        {!cargando && ventasFiltradas.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            {busqueda.trim() ? 'Sin resultados para esa búsqueda.' : 'Todavía no hay ventas registradas.'}
          </p>
        )}
        {!cargando &&
          ventasFiltradas.map((venta) => (
            <div
              key={venta.id}
              onClick={() => setVentaSeleccionada(venta)}
              className="rounded-lg border border-gray-200 bg-white p-3 cursor-pointer active:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-500">{venta.codigoVenta}</span>
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
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formatFecha.format(new Date(venta.fechaVenta))}
                {venta.cliente && ` · ${venta.cliente.nombre} ${venta.cliente.apellido}`}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrecio.format(venta.total)}
                </span>
                <span className="text-xs text-gray-500">
                  {venta.detalles.reduce((acc, d) => acc + d.cantidad, 0)} u.
                </span>
              </div>
              <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setVentaSeleccionada(venta)}
                  className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Ver
                </button>
                {venta.estadoVenta === 'COMPLETADA' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setVentaParaTicket(venta)}
                      className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDescargarComprobante(venta.id)}
                      className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Comprobante
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnularVentaId(venta.id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
                      className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Pagar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelarPedidoId(venta.id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      {ventaSeleccionada && (
        <DetalleVentaModal
          venta={ventaSeleccionada}
          onCerrar={() => setVentaSeleccionada(null)}
          onImprimir={() => {
            setVentaParaTicket(ventaSeleccionada)
            setVentaSeleccionada(null)
          }}
        />
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

      <ConfirmModal
        abierto={anularVentaId !== null}
        titulo="Anular venta"
        mensaje="¿Anular esta venta? Esta acción no se puede deshacer."
        textoAccion="Anular"
        variant="danger"
        onConfirmar={handleAnular}
        onCancelar={() => setAnularVentaId(null)}
      />

      <ConfirmModal
        abierto={cancelarPedidoId !== null}
        titulo="Cancelar pedido"
        mensaje="¿Cancelar este pedido? El stock se liberará."
        textoAccion="Cancelar"
        variant="warning"
        onConfirmar={handleCancelarPedido}
        onCancelar={() => setCancelarPedidoId(null)}
      />

      {resultado && resultado.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {resultado.totalItems} venta{resultado.totalItems !== 1 ? 's' : ''} · Página {resultado.currentPage + 1} de {resultado.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={resultado.currentPage === 0}
              onClick={() => irAPagina(resultado.currentPage - 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              type="button"
              disabled={resultado.currentPage >= resultado.totalPages - 1}
              onClick={() => irAPagina(resultado.currentPage + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
