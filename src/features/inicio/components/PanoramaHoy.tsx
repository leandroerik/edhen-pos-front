import { useState } from 'react'
import { NOMBRE_MEDIO_PAGO } from '../../../shared/constants'
import { formatPrecio, formatPorcentaje } from '../../../shared/format'
import type { MedioPago } from '../../../types/venta'

const CLAVE_OCULTAR = 'edhen-pos:ocultarFacturado'

interface PanoramaHoyProps {
  totalHoy: number
  cantidadHoy: number
  totalAyer: number
  medioPagoPrincipal: { medio: MedioPago; porcentaje: number } | null
}

// Par ojo abierto / ojo tachado — mismo lenguaje visual que el "mostrar
// contraseña" de cualquier billetera virtual. Sin librería de íconos en el
// proyecto, así que van como SVG en línea: heredan color por `currentColor`
// para poder pintarse con clases de Tailwind como cualquier texto.
function IconoOjo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconoOjoTachado({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.15 18.15 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// Figura "hero" del dashboard: la plata facturada hoy es lo primero que
// esta pantalla debe transmitir (pedido explícito: "panorama de plata").
// La variación es contra ayer, no contra un promedio — es la comparación
// más chica y más accionable para un local físico ("¿hoy vendí más o
// menos que ayer?"), y sale gratis del mismo fetch de 7 días que ya arma
// el gráfico de tendencia, sin otra llamada. Si ayer no hubo ventas, no
// se calcula un porcentaje (dividir por cero da infinito/engañoso) — se
// avisa en texto en su lugar.
//
// "Ocultar": pedido explícito para poder tapar el número con un cliente
// mirando el mostrador. Tapa los dos montos en pesos (total y ticket
// promedio) — la píldora de variación (%) y el medio de pago principal
// quedan visibles porque no revelan la cifra en sí. Se guarda en
// localStorage (no es una preferencia de "esta sesión", es "así quiero
// que arranque siempre"), leído una sola vez al montar.
//
// "Ocultar" muestra puntitos ("••••••"), pero el número vive en una caja
// con `min-width` fijo en `ch` (escala con el tamaño de letra heredado del
// padre, así que sirve tanto para el número grande como para el ticket
// promedio sin repetir la unidad). `min-width` no hace nada en un elemento
// `inline` — por eso el `inline-block`. El punto de esto: mostrar los
// puntitos o el monto real ocupa la MISMA caja, así que no corre el ícono
// del ojo ni la píldora de al lado al togglear — antes el string de
// puntos tenía un ancho distinto al del número real y todo se movía.
// `anchoCh` hay que pasarlo generoso (más ancho que el número más grande
// que se espera mostrar); si en algún momento la cifra supera ese ancho,
// la caja crece igual (es un mínimo, no un tope), no se recorta nada.
function MontoOcultable({
  oculto,
  anchoCh,
  children,
}: {
  oculto: boolean
  anchoCh: number
  children: string
}) {
  return (
    <span className="inline-block" style={{ minWidth: `${anchoCh}ch` }}>
      {oculto ? (
        <>
          <span aria-hidden="true">••••••</span>
          <span className="sr-only">Monto oculto</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}
export function PanoramaHoy({ totalHoy, cantidadHoy, totalAyer, medioPagoPrincipal }: PanoramaHoyProps) {
  const [oculto, setOculto] = useState(() => localStorage.getItem(CLAVE_OCULTAR) === '1')

  const alternarOculto = () => {
    setOculto((actual) => {
      const nuevo = !actual
      localStorage.setItem(CLAVE_OCULTAR, nuevo ? '1' : '0')
      return nuevo
    })
  }

  const ticketPromedio = cantidadHoy > 0 ? totalHoy / cantidadHoy : 0
  const hayComparacion = totalAyer > 0
  const variacion = hayComparacion ? (totalHoy - totalAyer) / totalAyer : 0
  const subio = variacion > 0
  const bajo = variacion < 0

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-xs text-gray-500">Facturado hoy</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <p className="text-4xl font-semibold text-gray-900 sm:text-5xl">
            <MontoOcultable oculto={oculto} anchoCh={10}>
              {formatPrecio.format(totalHoy)}
            </MontoOcultable>
          </p>
          <button
            type="button"
            onClick={alternarOculto}
            aria-label={oculto ? 'Mostrar monto facturado' : 'Ocultar monto facturado'}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            {oculto ? <IconoOjoTachado className="h-5 w-5" /> : <IconoOjo className="h-5 w-5" />}
          </button>
        </div>
        {hayComparacion ? (
          subio || bajo ? (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                subio ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {subio ? '▲' : '▼'} {formatPorcentaje.format(Math.abs(variacion))} vs. ayer
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              Igual que ayer
            </span>
          )
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Ayer no hubo ventas
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
        <p>
          {cantidadHoy} {cantidadHoy === 1 ? 'venta' : 'ventas'}
        </p>
        <p>
          Ticket promedio:{' '}
          {cantidadHoy > 0 ? (
            <MontoOcultable oculto={oculto} anchoCh={8}>
              {formatPrecio.format(ticketPromedio)}
            </MontoOcultable>
          ) : (
            '—'
          )}
        </p>
        {medioPagoPrincipal && (
          <p>
            Mayoría en {NOMBRE_MEDIO_PAGO[medioPagoPrincipal.medio]} (
            {formatPorcentaje.format(medioPagoPrincipal.porcentaje)})
          </p>
        )}
      </div>
    </div>
  )
}
