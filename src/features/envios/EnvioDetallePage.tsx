import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listarEstadosEnvio, obtenerEnvio } from '../../api/envios.api'
import type { EnvioEstadoHistorial } from '../../api/envios.api'
import { obtenerVenta } from '../../api/ventas.api'
import { formatPrecio } from '../../shared/format'
import type { Envio, EstadoEnvio } from '../../types/envio'
import type { Venta } from '../../types/venta'
import { CompletarPagoModal } from '../ventas/components/CompletarPagoModal'
import { EstadoTimeline } from './components/EstadoTimeline'

const NOMBRE_ESTADO: Record<EstadoEnvio, string> = {
  PENDIENTE: 'Pendiente',
  PREPARANDO: 'Preparando',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const COLOR_ESTADO: Record<EstadoEnvio, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-600',
  PREPARANDO: 'bg-blue-100 text-blue-700',
  EN_CAMINO: 'bg-amber-100 text-amber-700',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-600',
}

function formatoFechaLarga(fecha: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function formatoFechaCorta(fecha: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
  }).format(new Date(fecha))
}

export function EnvioDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [envio, setEnvio] = useState<Envio | null>(null)
  const [venta, setVenta] = useState<Venta | null>(null)
  const [historial, setHistorial] = useState<EnvioEstadoHistorial[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [mostrarPago, setMostrarPago] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    const envioId = Number(id)

    Promise.all([obtenerEnvio(envioId), listarEstadosEnvio(envioId)])
      .then(([envioData, estadosData]) => {
        if (cancelado) return
        if (!envioData) {
          setError('No se encontró el envío')
        } else {
          setEnvio(envioData)
          setHistorial(estadosData)
          if (envioData.ventaId) {
            obtenerVenta(envioData.ventaId).then((v) => {
              if (!cancelado && v) setVenta(v)
            })
          }
        }
        setCargando(false)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el envío')
        setCargando(false)
      })

    return () => { cancelado = true }
  }, [id, reloadToken])

  if (cargando) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-white" />
      </div>
    )
  }

  if (error || !envio) {
    return (
      <div>
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error || 'Envío no encontrado'}</p>
        <Link to="/envios" className="mt-4 inline-block text-sm font-medium text-gray-700 underline hover:text-gray-900">
          Volver a envíos
        </Link>
      </div>
    )
  }

  const yaPagado = envio.totalPagado ?? 0
  const saldo = envio.saldoPendiente ?? 0

  return (
    <div>
      <Link to="/envios" className="text-sm font-medium text-gray-500 hover:text-gray-700">
        &larr; Envíos
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">{envio.codigoEnvio}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_ESTADO[envio.estadoEnvio]}`}>
          {NOMBRE_ESTADO[envio.estadoEnvio]}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Datos del envío</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Cliente</dt>
                <dd className="text-sm text-gray-900">
                  {envio.cliente.nombre} {envio.cliente.apellido}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Transportista</dt>
                <dd className="text-sm text-gray-900">{envio.transportista}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Dirección de entrega</dt>
                <dd className="text-sm text-gray-900">
                  {envio.direccion.direccion}
                </dd>
                <dd className="text-xs text-gray-500">
                  {envio.direccion.localidad}, {envio.direccion.provincia}
                  {envio.direccion.codigoPostal && ` (${envio.direccion.codigoPostal})`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Solicitud</dt>
                <dd className="text-sm text-gray-900">{formatoFechaLarga(envio.fechaSolicitud)}</dd>
              </div>
              {envio.fechaRealEntrega && (
                <div>
                  <dt className="text-xs text-gray-500">Entregado</dt>
                  <dd className="text-sm text-gray-900">{formatoFechaCorta(envio.fechaRealEntrega)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500">Costo de envío</dt>
                <dd className="text-sm text-gray-900">{formatPrecio.format(envio.costoEnvio)}</dd>
              </div>
            </dl>
          </div>

          {envio.ventaId && envio.detallesVenta && envio.detallesVenta.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Venta asociada</h2>
                <span className="font-mono text-xs text-gray-400">{envio.ventaCodigo}</span>
              </div>

              <div className="mt-3 overflow-hidden rounded-md border border-gray-100">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Detalle</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Cant.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">P. unit.</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {envio.detallesVenta.map((d, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-900">{d.productoNombre}</td>
                        <td className="px-3 py-2 text-gray-500">{d.colorNombre} / {d.tallaNombre}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{d.cantidad}</td>
                        <td className="px-3 py-2 text-right text-gray-700">{formatPrecio.format(d.precioUnitario)}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">{formatPrecio.format(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total venta</span>
                  <span className="font-medium text-gray-900">{formatPrecio.format(envio.totalVenta ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ya pagado</span>
                  <span className="text-gray-700">{formatPrecio.format(yaPagado)}</span>
                </div>
                {saldo > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Saldo pendiente</span>
                    <span className="font-medium text-amber-600">{formatPrecio.format(saldo)}</span>
                  </div>
                )}
              </div>

              {saldo > 0 && (
                <button
                  type="button"
                  onClick={() => setMostrarPago(true)}
                  className="mt-3 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Registrar pago
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Historial de estados</h2>
            <div className="mt-4">
              <EstadoTimeline estadoActual={envio.estadoEnvio} historial={historial} />
            </div>
          </div>
        </div>
      </div>

      {mostrarPago && venta && (
        <CompletarPagoModal
          venta={venta}
          onCerrar={() => setMostrarPago(false)}
          onCompletado={() => {
            setMostrarPago(false)
            setVenta(null)
            setReloadToken((v) => v + 1)
          }}
        />
      )}
    </div>
  )
}
