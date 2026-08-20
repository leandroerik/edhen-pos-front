import { useState } from 'react'
import { completarPagoVenta } from '../../../api/ventas.api'
import { MEDIOS_PAGO_HABILITADOS, NOMBRE_MEDIO_PAGO } from '../../../shared/constants'
import { formatPrecio } from '../../../shared/format'
import type { MedioPago, Venta } from '../../../types/venta'

interface PagoLineaSimple {
  localId: string
  medioPago: MedioPago
  monto: string
}

export function CompletarPagoModal({
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
      setError(err instanceof Error ? err.message : 'No se pudo registrar el pago')
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
            <p className="text-sm font-semibold text-gray-900">Registrar pago</p>
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
          {guardando ? 'Guardando...' : 'Registrar pago'}
        </button>
      </div>
    </div>
  )
}
