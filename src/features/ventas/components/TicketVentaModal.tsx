import { useEffect } from 'react'
import type { MedioPago, Venta } from '../../../types/venta'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

const NOMBRE_MEDIO_PAGO: Record<MedioPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA_DEBITO: 'Tarjeta débito',
  TARJETA_CREDITO: 'Tarjeta crédito',
  MERCADO_PAGO: 'Mercado Pago',
  CUENTA_CORRIENTE: 'Cuenta corriente',
}

interface TicketVentaModalProps {
  venta: Venta
  onCerrar: () => void
}

// Comprobante interno imprimible (Sprint 3 del plan). No es un ticket
// fiscal — el Documento 4 deja la facturación electrónica (CAE, ARCA) para
// una fase aparte.
//
// La vista previa en pantalla es más grande de lo que sale impreso a
// propósito (para poder leerla cómodo antes de mandarla a imprimir): el
// texto base usa `text-sm`, y cada tamaño tiene su contraparte `print:`
// que lo achica de vuelta al tamaño real de una impresora térmica de
// 80mm (ver `@page` en src/index.css) — la vista previa no determina el
// tamaño de impresión, son dos escalas independientes.
//
// El bloque con id="imprimible" es lo único que sale impreso: la regla
// @media print de src/index.css oculta todo el resto de la página
// (visibility: hidden) — mismo id genérico que usan las páginas de
// etiqueta, ya que solo una pantalla imprime por vez. El modal pasa a
// position:static en impresión (`print:static`) para que el
// posicionamiento absoluto del ticket se resuelva contra la página, no
// contra el ancestro fixed del modal.
export function TicketVentaModal({ venta, onCerrar }: TicketVentaModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'Enter') window.print()
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

        <div id="imprimible" className="mt-4 text-sm text-gray-700 print:w-[80mm] print:text-xs">
          <div className="text-center">
            <img src="/logo.png" alt="edhen" className="mx-auto h-12 w-auto print:h-8" />
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-400 print:text-[9px]">
              Comprobante de venta
            </p>
          </div>

          <div className="mt-3 border-t border-dashed border-gray-300 pt-2 print:mt-2">
            <div className="flex justify-between font-medium text-gray-900">
              <span>{venta.codigoVenta}</span>
              <span>{formatFecha.format(new Date(venta.fechaVenta))}</span>
            </div>
            <p className="mt-0.5 text-gray-500">
              {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Venta mostrador'}
            </p>
          </div>

          <div className="mt-3 space-y-2 border-t border-dashed border-gray-300 pt-2 print:mt-2 print:space-y-1.5">
            {venta.detalles.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between gap-2 font-medium text-gray-900">
                  <span>
                    {d.cantidad} × {d.producto.nombre} ({d.variante.color.nombre}/{d.variante.talla.nombre})
                  </span>
                  <span className="shrink-0">{formatPrecio.format(d.subtotal)}</span>
                </div>
                {(d.cantidad > 1 || d.descuentoItem > 0) && (
                  <p className="text-xs text-gray-400 print:text-[10px]">
                    {formatPrecio.format(d.precioUnitario)} c/u
                    {d.descuentoItem > 0 && <> · desc. {formatPrecio.format(d.descuentoItem)}</>}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 border-t border-dashed border-gray-300 pt-2 print:mt-2">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrecio.format(venta.subtotal)}</span>
            </div>
            {venta.descuentoTotal > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Descuento</span>
                <span>-{formatPrecio.format(venta.descuentoTotal)}</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-between rounded-md bg-gray-50 px-3 py-2 text-base font-semibold text-gray-900 print:rounded-none print:border-t-2 print:border-gray-900 print:bg-transparent print:px-0 print:py-1 print:text-sm">
            <span>Total</span>
            <span>{formatPrecio.format(venta.total)}</span>
          </div>

          <div className="mt-3 space-y-0.5 border-t border-dashed border-gray-300 pt-2 print:mt-2">
            {venta.pagos.length === 0
              ? 'Sin pagos registrados'
              : venta.pagos.map((p, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>{NOMBRE_MEDIO_PAGO[p.medioPago] ?? p.medioPago}</span>
                    <span>{formatPrecio.format(p.monto)}</span>
                  </div>
                ))}
          </div>

          <div className="mt-4 border-t border-dashed border-gray-300 pt-2 text-center text-xs text-gray-400 print:mt-3 print:text-[10px]">
            <p>Comprobante interno — no válido como factura</p>
            <p className="mt-1">¡Gracias por tu compra!</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Imprimir ticket
        </button>
      </div>
    </div>
  )
}
