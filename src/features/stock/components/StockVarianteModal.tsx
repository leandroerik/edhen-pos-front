import { useEffect, useState } from 'react'
import { ajustarStock, listarMovimientos } from '../../../api/stock.api'
import type { MovimientoStock, TipoMovimientoStock } from '../../../types/movimientoStock'
import type { Producto, ProductoVariante } from '../../../types/producto'

const formatFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const NOMBRE_TIPO: Record<TipoMovimientoStock, string> = {
  INGRESO: 'Reposición',
  VENTA: 'Venta',
  DEVOLUCION: 'Devolución',
  RESERVA: 'Reserva',
  LIBERA_RESERVA: 'Libera res.',
  AJUSTE_POSITIVO: 'Ajuste (+)',
  AJUSTE_NEGATIVO: 'Falla / Baja',
}

const CHIPS_FALLA = [
  'Falla de confección',
  'Tela fallada / agujero',
  'Mancha / desteñido',
  'Rotura en local',
  'Faltante',
]

const CHIPS_REPOSICION = [
  'Reposición de taller',
  'Ingreso de proveedor',
  'Devolución a stock',
  'Recuento físico',
]

interface StockVarianteModalProps {
  producto: Producto
  variante: ProductoVariante
  onCerrar: () => void
  onAjustado: () => void
}

export function StockVarianteModal({ producto, variante, onCerrar, onAjustado }: StockVarianteModalProps) {
  const [stockActual, setStockActual] = useState(variante.stock)
  const [movimientos, setMovimientos] = useState<MovimientoStock[] | null>(null)

  const [esReposicion, setEsReposicion] = useState(true)
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    listarMovimientos(variante.id).then((datos) => {
      if (!cancelado) setMovimientos(datos)
    })
    return () => {
      cancelado = true
    }
  }, [variante.id])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCerrar])

  const delta = esReposicion ? cantidad : -cantidad
  const nuevoStock = Math.max(0, stockActual + delta)

  const handleGuardar = async () => {
    setError(null)
    if (!cantidad || cantidad <= 0) {
      setError('Ingresá una cantidad válida.')
      return
    }

    if (!esReposicion && cantidad > stockActual) {
      setError(`Solo hay ${stockActual} unidades disponibles en stock.`)
      return
    }

    const tipoFinal = esReposicion ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO'
    const motivoFinal = motivo.trim() || (esReposicion ? 'Reposición de stock' : 'Ropa fallada')

    setGuardando(true)
    try {
      await ajustarStock({
        varianteId: variante.id,
        cantidad,
        tipo: tipoFinal,
        motivo: motivoFinal,
      })
      setStockActual((prev) => prev + (esReposicion ? cantidad : -cantidad))
      setCantidad(1)
      setMotivo('')
      listarMovimientos(variante.id).then(setMovimientos)
      onAjustado()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el ajuste')
    } finally {
      setGuardando(false)
    }
  }

  const presets = esReposicion ? [1, 2, 5, 10, 20] : [1, 2, 3, 5]
  const chips = esReposicion ? CHIPS_REPOSICION : CHIPS_FALLA

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Sobria */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{producto.nombre}</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border border-gray-300"
                  style={{ backgroundColor: variante.color?.codigoHex }}
                />
                {variante.color?.nombre}
              </span>
              {' · '}
              <span>Talle {variante.talla?.nombre}</span>
              {' · '}
              <span className="font-mono text-[11px]">{variante.sku}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Stock actual</p>
              <p className="text-lg font-bold text-gray-900">
                {stockActual}{' '}
                <span className="text-xs font-normal text-gray-400">/ mín {variante.stockMinimo}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Cerrar modal"
              title="Cerrar (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        {/* Segmented Control Minimalista */}
        <div className="mt-4 grid grid-cols-2 rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setEsReposicion(true)
              setMotivo('')
            }}
            className={`rounded-md py-1.5 transition-all ${
              esReposicion
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            + Reposición de stock
          </button>
          <button
            type="button"
            onClick={() => {
              setEsReposicion(false)
              setMotivo('')
            }}
            className={`rounded-md py-1.5 transition-all ${
              !esReposicion
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            − Ropa fallada / Merma
          </button>
        </div>

        {/* Cantidad y Presets */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
              className="h-8 w-16 rounded-md border border-gray-300 text-center text-sm font-bold text-gray-900 focus:border-gray-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setCantidad((c) => c + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              +
            </button>
          </div>

          {/* Presets Rápidos */}
          <div className="flex items-center gap-1">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCantidad(p)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  cantidad === p
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {esReposicion ? `+${p}` : `${p}`}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Queda en: <span className="font-bold text-gray-900">{nuevoStock}</span>
          </p>
        </div>

        {/* Motivos Rápidos (Chips sobrios) */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => {
              const activo = motivo === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setMotivo(activo ? '' : c)}
                  className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                    activo
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={
              esReposicion ? 'Detalle o remito (opcional)...' : 'Detalle de la falla (opcional)...'
            }
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* Botón de Confirmación */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-black disabled:opacity-50 transition-colors"
          >
            {guardando
              ? 'Guardando...'
              : esReposicion
              ? `Registrar ingreso (+${cantidad})`
              : `Registrar baja (-${cantidad})`}
          </button>
        </div>

        {/* Historial Compacto */}
        <div className="mt-3 border-t border-gray-100 pt-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
            Últimos movimientos
          </p>
          <div className="max-h-36 overflow-y-auto">
            {movimientos === null && <p className="text-xs text-gray-400">Cargando...</p>}
            {movimientos !== null && movimientos.length === 0 && (
              <p className="text-xs text-gray-400">Sin movimientos registrados.</p>
            )}
            {movimientos !== null && movimientos.length > 0 && (
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-50">
                  {movimientos.slice(0, 10).map((m) => (
                    <tr key={m.id}>
                      <td className="py-1 pr-2 text-gray-400 whitespace-nowrap">
                        {formatFecha.format(new Date(m.fecha))}
                      </td>
                      <td className="py-1 pr-2 text-gray-700 whitespace-nowrap">
                        {NOMBRE_TIPO[m.tipo] ?? m.tipo}
                      </td>
                      <td
                        className={`py-1 pr-2 text-right font-medium whitespace-nowrap ${
                          m.cantidad < 0 ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </td>
                      <td className="py-1 text-gray-500 truncate max-w-[180px]">
                        {m.motivo ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
