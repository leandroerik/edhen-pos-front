import { useEffect, useRef } from 'react'
import { NOMBRE_MEDIO_PAGO } from '../../../shared/constants'
import { formatPrecio } from '../../../shared/format'
import type { Venta } from '../../../types/venta'

const formatFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })


// Ancho del rollo térmico (80mm es lo habitual en comercios). Si la impresora
// es de 58mm, cambiar acá y en el `w-[80mm]` de abajo.
const ANCHO_TICKET_MM = 80

// Avance extra después del contenido. No es desperdicio: la impresora no
// puede imprimir el borde superior/inferior de la página (zona no imprimible),
// así que si el alto de página es EXACTO el contenido, el final se corta.
// Estos mm se suman al alto de página para que el corte caiga después del
// ticket. Si aún corta, subir a 15-20; si sobra rollo, bajar.
const AVANCE_TICKET_MM = 12

// Para que la térmica corte justo después del contenido y no arrastre rollo
// blanco, no alcanza con `@page { size: 80mm auto }`: el navegador ignora el
// `auto` y usa el largo de página que tenga configurado el driver. Entonces
// medimos el alto real del ticket en pantalla (WYSIWYG: mismo ancho y clases
// que en impresión) y fijamos el alto de página con un <style> inyectado
// (mismo truco que usa EtiquetasColaPage para el A4). Se quita al desmontar.
function usePaginaTicket(ref: React.RefObject<HTMLDivElement | null>, clave: number | string) {
  useEffect(() => {
    const style = document.createElement('style')
    document.head.appendChild(style)
    const actualizar = () => {
      const el = ref.current
      if (!el) return
      const mm = Math.ceil((el.getBoundingClientRect().height * 25.4) / 96) + AVANCE_TICKET_MM
      // `@page` a nivel raíz (sin envolver en @media print): algunos navegadores,
      // Firefox incluido, no aplican bien `@page` anidado dentro de @media, y
      // entonces usan Carta/A4 y el ticket se ve chiquito en la previsualización.
      style.textContent = `@page { size: ${ANCHO_TICKET_MM}mm ${mm}mm; margin: 0; }`
    }
    actualizar()
    const t = window.setTimeout(actualizar, 120)
    window.addEventListener('beforeprint', actualizar)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('beforeprint', actualizar)
      style.remove()
    }
  }, [ref, clave])
}

interface TicketVentaModalProps {
  venta: Venta
  onCerrar: () => void
}

// Comprobante interno imprimible (Sprint 3 del plan). No es un ticket
// fiscal — el Documento 4 deja la facturación electrónica (CAE, ARCA) para
// una fase aparte.
//
// La vista previa en pantalla es la misma que sale impresa (mismo ancho y
// tamaños): se arma a 80mm con `text-xs` a propósito, para que la altura
// medida coincida con la del papel y el cálculo del largo de página de la
// térmica sea exacto.
//
// El bloque con id="imprimible" es lo único que sale impreso: la regla
// @media print de src/index.css oculta todo el resto de la página
// (visibility: hidden) — mismo id genérico que usan las páginas de
// etiqueta, ya que solo una pantalla imprime por vez. El modal pasa a
// position:static en impresión (`print:static`) para que el
// posicionamiento absoluto del ticket se resuelva contra la página, no
// contra el ancestro fixed del modal.
export function TicketVentaModal({ venta, onCerrar }: TicketVentaModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  usePaginaTicket(ticketRef, venta.id)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 print:static print:bg-transparent print:p-0"
      onClick={onCerrar}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Ticket de venta</p>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div
          ref={ticketRef}
          id="imprimible"
          className="mx-auto mt-4 w-[80mm] p-[3mm] text-xs text-gray-800 print:mt-0"
        >
          <div className="text-center">
            <img src="/logo.png" alt="edhen" className="mx-auto h-10 w-auto" />
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.25em] text-gray-400">
              Comprobante de venta
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 print:bg-transparent">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">N.º de venta</p>
              <p className="font-semibold text-gray-900">{venta.codigoVenta}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Fecha</p>
              <p className="font-medium text-gray-600">{formatFecha.format(new Date(venta.fechaVenta))}</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 px-0.5 text-xs text-gray-500">
            <span className="truncate">
              {venta.cliente
                ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
                : 'Consumidor final'}
            </span>
            {venta.cliente && (
              <span className="shrink-0">
                {venta.cliente.tipo === 'MAYORISTA'
                  ? 'Mayorista'
                  : venta.cliente.tipo === 'OTRO'
                    ? 'Otro'
                    : 'Minorista'}
              </span>
            )}
          </div>

          <div className="mt-3 border-t border-dashed border-gray-300 pt-2">
            {(() => {
              const grupos = new Map<number, { nombre: string; items: typeof venta.detalles }>()
              for (const d of venta.detalles) {
                const existing = grupos.get(d.producto.id)
                if (existing) {
                  existing.items.push(d)
                } else {
                  grupos.set(d.producto.id, { nombre: d.producto.nombre, items: [d] })
                }
              }
              return [...grupos.values()].map((grupo) => (
                <div key={grupo.items[0].producto.id} className="mb-2 last:mb-0">
                  <p className="font-medium text-gray-900">{grupo.nombre}</p>
                  <div className="mt-0.5 space-y-0.5">
                    {grupo.items.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-baseline justify-between gap-2 pl-3 text-gray-600"
                      >
                        <span className="min-w-0">
                          {d.variante.color?.nombre ?? 'Sin color'}/{d.variante.talla?.nombre ?? 'Único'}
                          <span className="ml-1 text-gray-400">×{d.cantidad}</span>
                          {d.descuentoItem > 0 && (
                            <span className="ml-1 text-gray-400">· desc. {formatPrecio.format(d.descuentoItem)}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-right tabular-nums text-gray-700">
                          {formatPrecio.format(d.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>

          <div className="mt-2 border-t border-dashed border-gray-300 pt-2">
            <div className="space-y-1 text-gray-500">
              <div className="flex justify-between tabular-nums">
                <span>Subtotal</span>
                <span>{formatPrecio.format(venta.subtotal)}</span>
              </div>
              {venta.descuentoTotal > 0 && (
                <div className="flex justify-between tabular-nums">
                  <span>Descuento</span>
                  <span>-{formatPrecio.format(venta.descuentoTotal)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md bg-gray-900 px-3 py-2 text-white print:bg-transparent print:text-black">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold tabular-nums">
                {formatPrecio.format(venta.total)}
              </span>
            </div>
          </div>

          <div className="mt-3 border-t border-dashed border-gray-300 pt-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Medios de pago</p>
            <div className="mt-1 space-y-1 text-gray-600">
              {venta.pagos.length === 0
                ? <p className="text-gray-400">Sin pagos registrados</p>
                : venta.pagos.map((p, i) => (
                    <div key={i} className="flex justify-between tabular-nums">
                      <span>{NOMBRE_MEDIO_PAGO[p.medioPago] ?? p.medioPago}</span>
                      <span>{formatPrecio.format(p.monto)}</span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="mt-4 border-t border-dashed border-gray-300 pt-3 text-center text-[11px] text-gray-400">
            <p>Comprobante interno — no válido como factura</p>
            <p className="mt-0.5 font-medium text-gray-500">¡Gracias por tu compra!</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Nueva venta
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Imprimir ticket
          </button>
        </div>
      </div>
    </div>
  )
}
