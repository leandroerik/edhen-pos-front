import type { EnvioEstadoHistorial } from '../../../api/envios.api'
import type { EstadoEnvio } from '../../../types/envio'

const ORDEN_ESTADO: EstadoEnvio[] = ['PENDIENTE', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO']

const NOMBRE_ESTADO: Record<EstadoEnvio, string> = {
  PENDIENTE: 'Pendiente',
  PREPARANDO: 'Preparando',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

const COLOR_PASO: Record<EstadoEnvio, { bg: string; ring: string; text: string }> = {
  PENDIENTE: { bg: 'bg-gray-100', ring: 'ring-gray-400', text: 'text-gray-600' },
  PREPARANDO: { bg: 'bg-blue-100', ring: 'ring-blue-500', text: 'text-blue-700' },
  EN_CAMINO: { bg: 'bg-amber-100', ring: 'ring-amber-500', text: 'text-amber-700' },
  ENTREGADO: { bg: 'bg-green-100', ring: 'ring-green-500', text: 'text-green-700' },
  CANCELADO: { bg: 'bg-red-100', ring: 'ring-red-500', text: 'text-red-600' },
}

interface Props {
  estadoActual: EstadoEnvio
  historial: EnvioEstadoHistorial[]
}

function formatoFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

export function EstadoTimeline({ estadoActual, historial }: Props) {
  const esCancelado = estadoActual === 'CANCELADO'

  const pasosNormales = esCancelado
    ? ORDEN_ESTADO
    : ORDEN_ESTADO.slice(0, ORDEN_ESTADO.indexOf(estadoActual) + 1)

  const pasosRestantes = esCancelado
    ? []
    : ORDEN_ESTADO.slice(ORDEN_ESTADO.indexOf(estadoActual) + 1)

  return (
    <div className="space-y-3">
      {pasosNormales.map((paso) => {
        const colores = COLOR_PASO[paso]
        const entrada = historial.find((h) => h.estado === paso)
        return (
          <div key={paso} className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${colores.bg} ${colores.ring}`}>
              <svg className={`h-3.5 w-3.5 ${colores.text}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${colores.text}`}>{NOMBRE_ESTADO[paso]}</p>
              {entrada && (
                <p className="text-xs text-gray-500">{formatoFecha(entrada.fecha)}</p>
              )}
              {entrada?.observacion && (
                <p className="text-xs text-gray-400">{entrada.observacion}</p>
              )}
            </div>
          </div>
        )
      })}

      {pasosRestantes.map((paso) => {
        const colores = COLOR_PASO[paso]
        return (
          <div key={paso} className="flex items-start gap-3 opacity-40">
            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ${colores.bg} ${colores.ring}`}>
              <div className={`h-2 w-2 rounded-full ${colores.text === 'text-gray-600' ? 'bg-gray-400' : 'bg-gray-300'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{NOMBRE_ESTADO[paso]}</p>
            </div>
          </div>
        )
      })}

      {esCancelado && (
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 bg-red-100 ring-red-500">
            <svg className="h-3.5 w-3.5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-600">Cancelado</p>
            {(() => {
              const entrada = historial.find((h) => h.estado === 'CANCELADO')
              return entrada ? (
                <p className="text-xs text-gray-500">{formatoFecha(entrada.fecha)}</p>
              ) : null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
