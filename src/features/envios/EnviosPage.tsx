import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { avanzarEstadoEnvio, cancelarEnvio, listarEnvios } from '../../api/envios.api'
import type { EstadoEnvio, Envio } from '../../types/envio'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

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
  CANCELADO: 'bg-red-100 text-red-700',
}

const ACCION_SIGUIENTE: Partial<Record<EstadoEnvio, string>> = {
  PENDIENTE: 'Marcar en preparación',
  PREPARANDO: 'Marcar en camino',
  EN_CAMINO: 'Marcar entregado',
}

type FiltroEstado = 'todos' | EstadoEnvio

interface Resultado {
  clave: string
  envios: Envio[]
}

export function EnviosPage() {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clave = JSON.stringify({ filtroEstado, reloadToken })

  useEffect(() => {
    let cancelado = false
    listarEnvios(filtroEstado === 'todos' ? {} : { estado: filtroEstado })
      .then((data) => {
        if (cancelado) return
        setResultado({ clave, envios: data })
        setError(null)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los envíos')
      })
    return () => {
      cancelado = true
    }
  }, [filtroEstado, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const envios = resultado?.clave === clave ? resultado.envios : []

  const handleAvanzar = async (id: number) => {
    setError(null)
    try {
      await avanzarEstadoEnvio(id)
      setReloadToken((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el envío')
    }
  }

  const handleCancelar = async (id: number) => {
    setError(null)
    try {
      await cancelarEnvio(id)
      setReloadToken((v) => v + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el envío')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Envíos</h1>
        <Link
          to="/envios/nuevo"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Nuevo envío
        </Link>
      </div>

      <div className="mt-4">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          {Object.entries(NOMBRE_ESTADO).map(([valor, nombre]) => (
            <option key={valor} value={valor}>
              {nombre}
            </option>
          ))}
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
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Dirección
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Transportista
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
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && envios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  Todavía no hay envíos registrados.
                </td>
              </tr>
            )}
            {!cargando &&
              envios.map((envio) => {
                const accionSiguiente = ACCION_SIGUIENTE[envio.estadoEnvio]
                const puedeCancelar = envio.estadoEnvio !== 'ENTREGADO' && envio.estadoEnvio !== 'CANCELADO'
                return (
                  <tr key={envio.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{envio.codigoEnvio}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {envio.cliente.nombre} {envio.cliente.apellido}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {envio.direccion.direccion}
                      <div className="text-xs text-gray-400">
                        {envio.direccion.localidad}, {envio.direccion.provincia}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{envio.transportista}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[envio.estadoEnvio]}`}
                      >
                        {NOMBRE_ESTADO[envio.estadoEnvio]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-3">
                        {accionSiguiente && (
                          <button
                            type="button"
                            onClick={() => handleAvanzar(envio.id)}
                            className="font-medium text-gray-700 hover:text-gray-900"
                          >
                            {accionSiguiente}
                          </button>
                        )}
                        {puedeCancelar && (
                          <button
                            type="button"
                            onClick={() => handleCancelar(envio.id)}
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
