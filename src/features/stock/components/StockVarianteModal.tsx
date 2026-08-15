import { useEffect, useState } from 'react'
import { ajustarStock, listarMovimientos } from '../../../api/stock.api'
import type { MovimientoStock, TipoMovimientoStock } from '../../../types/movimientoStock'
import type { Producto, ProductoVariante } from '../../../types/producto'

const formatFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const NOMBRE_TIPO_MOVIMIENTO: Record<TipoMovimientoStock, { label: string; bg: string; text: string }> = {
  INGRESO: { label: 'Reposición / Ingreso', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  VENTA: { label: 'Venta POS', bg: 'bg-blue-100', text: 'text-blue-800' },
  DEVOLUCION: { label: 'Devolución', bg: 'bg-purple-100', text: 'text-purple-800' },
  RESERVA: { label: 'Reserva Pedido', bg: 'bg-amber-100', text: 'text-amber-800' },
  LIBERA_RESERVA: { label: 'Libera Reserva', bg: 'bg-gray-100', text: 'text-gray-700' },
  AJUSTE_POSITIVO: { label: 'Ajuste (+)', bg: 'bg-teal-100', text: 'text-teal-800' },
  AJUSTE_NEGATIVO: { label: 'Ropa Fallada / Baja', bg: 'bg-rose-100', text: 'text-rose-800' },
}

const MOTIVOS_FALLA = [
  'Falla de confección / costura',
  'Tela fallada / agujero',
  'Mancha / desteñido',
  'Rotura / enganche en local',
  'Pérdida / faltante',
]

const MOTIVOS_REPOSICION = [
  'Reposición de taller / confección',
  'Ingreso de proveedor',
  'Devolución de mercadería a stock',
  'Ajuste por recuento físico',
]

interface StockVarianteModalProps {
  producto: Producto
  variante: ProductoVariante
  onCerrar: () => void
  onAjustado: () => void
}

type ModoOperacion = 'REPOSICION' | 'FALLA' | 'AJUSTE'

export function StockVarianteModal({ producto, variante, onCerrar, onAjustado }: StockVarianteModalProps) {
  const [stockActual, setStockActual] = useState(variante.stock)
  const [movimientos, setMovimientos] = useState<MovimientoStock[] | null>(null)

  const [modo, setModo] = useState<ModoOperacion>('REPOSICION')
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bajoMinimo = stockActual < variante.stockMinimo

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

  // Cálculo de nuevo stock resultante
  const delta = modo === 'FALLA' ? -cantidad : cantidad
  const nuevoStockCalculado = Math.max(0, stockActual + delta)

  const handleAjustar = async () => {
    setError(null)
    if (!cantidad || cantidad <= 0) {
      setError('Ingresá una cantidad mayor a 0.')
      return
    }

    if (modo === 'FALLA' && cantidad > stockActual) {
      setError(`No podés descontar ${cantidad} unidades porque solo hay ${stockActual} en stock.`)
      return
    }

    const tipoFinal: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' =
      modo === 'FALLA' ? 'AJUSTE_NEGATIVO' : 'AJUSTE_POSITIVO'

    let motivoFinal = motivo.trim()
    if (!motivoFinal) {
      motivoFinal = modo === 'FALLA' ? 'Ropa fallada / falla de confección' : 'Reposición de stock'
    }

    setGuardando(true)
    try {
      await ajustarStock({
        varianteId: variante.id,
        cantidad,
        tipo: tipoFinal,
        motivo: motivoFinal,
      })
      const nuevoStock = stockActual + (tipoFinal === 'AJUSTE_POSITIVO' ? cantidad : -cantidad)
      setStockActual(nuevoStock)
      setCantidad(1)
      setMotivo('')
      listarMovimientos(variante.id).then(setMovimientos)
      onAjustado()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento')
    } finally {
      setGuardando(false)
    }
  }

  const presets = modo === 'REPOSICION' ? [1, 2, 5, 10, 20, 50] : [1, 2, 3, 5]
  const motivosSugeridos = modo === 'FALLA' ? MOTIVOS_FALLA : MOTIVOS_REPOSICION

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Principal */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-gray-200/80 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {producto.categoria?.nombre ?? 'Indumentaria'}
              </span>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{producto.nombre}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: variante.color?.codigoHex }}
                  />
                  {variante.color?.nombre}
                </span>
                <span className="text-gray-300">•</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-800">
                  Talle {variante.talla?.nombre}
                </span>
                <span className="text-gray-300">•</span>
                <span className="font-mono text-xs text-gray-500">SKU: {variante.sku}</span>
              </div>
            </div>

            {/* Tarjeta de Stock Actual */}
            <div
              className={`flex flex-col items-end rounded-xl border px-4 py-2.5 ${
                bajoMinimo
                  ? 'border-amber-200 bg-amber-50/80 text-amber-900'
                  : 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Stock Actual</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">{stockActual}</span>
                <span className="text-xs text-gray-500">unidades</span>
              </div>
              <span className="text-[11px] text-gray-500">Mínimo sugerido: {variante.stockMinimo}</span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
              <span className="text-base font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Selector de Modo de Operación */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
              ¿Qué operación querés realizar?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setModo('REPOSICION')
                  setMotivo('')
                }}
                className={`flex items-center justify-center gap-2.5 rounded-xl border-2 p-3.5 text-sm font-bold transition-all ${
                  modo === 'REPOSICION'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-base">
                  +
                </span>
                <div className="text-left">
                  <p className="leading-none">Reposición de Stock</p>
                  <p className="text-[11px] font-normal text-emerald-700 mt-0.5">Ingreso de taller o proveedor</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModo('FALLA')
                  setMotivo('')
                }}
                className={`flex items-center justify-center gap-2.5 rounded-xl border-2 p-3.5 text-sm font-bold transition-all ${
                  modo === 'FALLA'
                    ? 'border-rose-600 bg-rose-50 text-rose-800 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white font-black text-base">
                  −
                </span>
                <div className="text-left">
                  <p className="leading-none">Ropa Fallada / Merma</p>
                  <p className="text-[11px] font-normal text-rose-700 mt-0.5">Falla de tela, costura o rotura</p>
                </div>
              </button>
            </div>
          </div>

          {/* Selector de Cantidad Grande y Cómodo */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Cantidad a {modo === 'REPOSICION' ? 'ingresar' : 'descontar'}
                </label>
                <p className="text-xs text-gray-400 mt-0.5">Seleccioná un valor rápido o ingresalo manualmente</p>
              </div>

              {/* Control numérico interactivo */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
                  className="h-10 w-20 rounded-xl border-2 border-gray-300 bg-white text-center text-xl font-extrabold text-gray-900 focus:border-gray-900 focus:outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setCantidad((c) => c + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-lg font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Presets Rápidos */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200/60 pt-3">
              <span className="text-xs font-medium text-gray-500">Valores rápidos:</span>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCantidad(p)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    cantidad === p
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {modo === 'REPOSICION' ? `+${p}` : `${p}`}
                </button>
              ))}

              {/* Resumen del impacto en el stock */}
              <div className="ml-auto text-xs font-semibold text-gray-700">
                Resultado: <span className="font-bold text-gray-900">{stockActual}</span> ➔{' '}
                <span className={`font-black text-sm ${modo === 'REPOSICION' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {nuevoStockCalculado} uds
                </span>{' '}
                <span className="text-gray-400">({delta > 0 ? `+${delta}` : delta})</span>
              </div>
            </div>
          </div>

          {/* Motivo (Chips Rápidos + Input Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Motivo del movimiento <span className="font-normal text-gray-400">(Opcional)</span>
              </label>
              <span className="text-[11px] text-gray-400">No es obligatorio rellenarlo</span>
            </div>

            {/* Chips rápidos de 1 clic */}
            <div className="flex flex-wrap gap-2 mb-2.5">
              {motivosSugeridos.map((m) => {
                const activo = motivo === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMotivo(activo ? '' : m)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      activo
                        ? modo === 'FALLA'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>

            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={
                modo === 'FALLA'
                  ? 'Ej. Mancha de tinta en el escote, falla de corte (opcional)...'
                  : 'Ej. Reposición de taller 15 prendas (opcional)...'
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none shadow-sm"
            />
          </div>

          {/* Botón de Confirmación Principal */}
          <div>
            <button
              type="button"
              onClick={handleAjustar}
              disabled={guardando}
              className={`w-full rounded-xl py-3.5 text-base font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                modo === 'REPOSICION'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {guardando
                ? 'Registrando movimiento...'
                : modo === 'REPOSICION'
                ? `Confirmar Reposición (+${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'})`
                : `Registrar Baja por Ropa Fallada (-${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'})`}
            </button>
          </div>

          {/* Historial de Movimientos Completo */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Historial y Trazabilidad de esta Variante
              </h3>
              {movimientos && (
                <span className="text-xs text-gray-400">{movimientos.length} movimientos registrados</span>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white">
              {movimientos === null && (
                <div className="p-4 text-center text-xs text-gray-500">Cargando movimientos...</div>
              )}
              {movimientos !== null && movimientos.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">Aún no hay movimientos registrados para esta prenda.</div>
              )}
              {movimientos !== null && movimientos.length > 0 && (
                <table className="min-w-full divide-y divide-gray-100 text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                      <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                      <th className="px-3 py-2 text-right font-semibold">Cantidad</th>
                      <th className="px-3 py-2 text-left font-semibold">Motivo / Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movimientos.map((m) => {
                      const tipoInfo = NOMBRE_TIPO_MOVIMIENTO[m.tipo] ?? {
                        label: m.tipo,
                        bg: 'bg-gray-100',
                        text: 'text-gray-700',
                      }
                      return (
                        <tr key={m.id} className="hover:bg-gray-50/80">
                          <td className="whitespace-nowrap px-3 py-2.5 text-gray-500 font-mono text-[11px]">
                            {formatFecha.format(new Date(m.fecha))}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <span className={`inline-block rounded-md px-2 py-0.5 font-medium ${tipoInfo.bg} ${tipoInfo.text}`}>
                              {tipoInfo.label}
                            </span>
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-2.5 text-right font-bold text-sm ${
                              m.cantidad < 0 ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700 font-medium">
                            {m.motivo ?? '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
