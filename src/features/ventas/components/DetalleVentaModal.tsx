import { useEffect } from 'react'
import { NOMBRE_MEDIO_PAGO } from '../../../shared/constants'
import { formatPrecio } from '../../../shared/format'
import type { Venta } from '../../../types/venta'

const formatFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

interface DetalleVentaModalProps {
  venta: Venta
  onCerrar: () => void
  onImprimir?: () => void
}

export function DetalleVentaModal({ venta, onCerrar, onImprimir }: DetalleVentaModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCerrar])

  const grupos = new Map<number, { nombre: string; items: typeof venta.detalles }>()
  for (const d of venta.detalles) {
    const existing = grupos.get(d.producto.id)
    if (existing) {
      existing.items.push(d)
    } else {
      grupos.set(d.producto.id, { nombre: d.producto.nombre, items: [d] })
    }
  }
  const gruposArr = [...grupos.values()]

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-gray-500">{venta.codigoVenta}</p>
            <p className="text-sm text-gray-500">{formatFecha.format(new Date(venta.fechaVenta))}</p>
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

        <div className="mt-4 space-y-3">
          {gruposArr.map((grupo) => {
            return (
              <div key={grupo.items[0].producto.id}>
                <p className="text-sm font-semibold text-gray-900">{grupo.nombre}</p>
                {grupo.items.map((d) => (
                  <div key={d.id} className="ml-2 flex items-baseline justify-between text-sm text-gray-600">
                    <span className="min-w-0">
                      {d.variante.color.nombre}/{d.variante.talla.nombre}
                      <span className="ml-1 text-gray-400">×{d.cantidad}</span>
                      {d.descuentoItem > 0 && <span className="ml-1 text-gray-400">· desc. {formatPrecio.format(d.descuentoItem)}</span>}
                    </span>
                    <span className="shrink-0 pl-3 text-right">{formatPrecio.format(d.subtotal)}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

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

        {onImprimir && (
          <button
            type="button"
            onClick={onImprimir}
            className="mt-3 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Imprimir ticket
          </button>
        )}
      </div>
    </div>
  )
}
