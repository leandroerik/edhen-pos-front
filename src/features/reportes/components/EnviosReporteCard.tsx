import type { Envio, EstadoEnvio } from '../../../types/envio'
import { formatPrecio, formatPorcentaje } from '../../../shared/format'
import {
  agruparEnviosPorEstado,
  agruparEnviosPorTransportista,
} from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

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

interface EnviosReporteCardProps {
  envios: Envio[]
}

export function EnviosReporteCard({ envios }: EnviosReporteCardProps) {
  const porTransportista = agruparEnviosPorTransportista(envios)
  const porEstado = agruparEnviosPorEstado(envios)

  const totalCosto = envios.reduce((acc, e) => acc + e.costoEnvio, 0)
  const costoPromedio = envios.length > 0 ? totalCosto / envios.length : 0
  const entregados = envios.filter((e) => e.estadoEnvio === 'ENTREGADO').length
  const maxTransportista = Math.max(1, ...porTransportista.map((t) => t.total))

  function exportarTransportistas() {
    const headers = ['Transportista', 'Envíos', 'Costo total', 'Costo promedio', 'Entregados']
    const rows = porTransportista.map((t) => [
      t.transportista,
      t.total,
      t.costoTotal,
      t.costoPromedio,
      t.entregados,
    ])
    exportarCsv('envios-por-transportista.csv', headers, rows)
  }

  function exportarEstados() {
    const headers = ['Estado', 'Cantidad', '% del total']
    const rows = porEstado.map((e) => [
      NOMBRE_ESTADO[e.estado as EstadoEnvio] ?? e.estado,
      e.cantidad,
      envios.length > 0 ? e.cantidad / envios.length : 0,
    ])
    exportarCsv('envios-por-estado.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Envíos y costos
        </h3>
        <button
          onClick={exportarTransportistas}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Total envíos</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">{envios.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Costo total</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {formatPrecio.format(totalCosto)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Costo promedio</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {formatPrecio.format(costoPromedio)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Entregados</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {entregados}{' '}
            <span className="text-xs font-normal text-gray-400">
              ({envios.length > 0 ? formatPorcentaje.format(entregados / envios.length) : '0%'})
            </span>
          </p>
        </div>
      </div>

      {envios.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Sin envíos registrados.</p>
      ) : (
        <>
          {/* Por transportista */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-500">Por transportista</h4>
              <button
                onClick={exportarTransportistas}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                CSV
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {porTransportista.map((t) => (
                <div key={t.transportista} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-gray-700">
                    {t.transportista}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-gray-900"
                        style={{ width: `${(t.total / maxTransportista) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {t.total} envíos · {formatPrecio.format(t.costoTotal)} ·{' '}
                    {formatPrecio.format(t.costoPromedio)} c/u
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Por estado */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-500">Por estado</h4>
              <button
                onClick={exportarEstados}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                CSV
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {porEstado.map((e) => (
                <span
                  key={e.estado}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    COLOR_ESTADO[e.estado as EstadoEnvio] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {NOMBRE_ESTADO[e.estado as EstadoEnvio] ?? e.estado}:{' '}
                  {e.cantidad} ({envios.length > 0 ? formatPorcentaje.format(e.cantidad / envios.length) : '0%'})
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
