import type { MedioPago, TipoCompra, Venta } from '../../../types/venta'
import {
  agruparPorCanal,
  agruparPorMedioPago,
  calcularResumen,
} from '../lib/agregaciones'
import { exportarCsv } from '../lib/exportarCsv'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatPorcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const LABELS_MEDIO_PAGO: Record<MedioPago, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA_DEBITO: 'Tarjeta débito',
  TARJETA_CREDITO: 'Tarjeta crédito',
  TRANSFERENCIA: 'Transferencia',
  MERCADO_PAGO: 'Mercado Pago',
  CUENTA_CORRIENTE: 'Cuenta corriente',
}

const LABELS_CANAL: Record<TipoCompra, string> = {
  LOCAL_FISICO: 'Local físico',
  WHATSAPP: 'WhatsApp',
  WEB: 'Web',
  MARKETPLACE: 'Marketplace',
  TELEFONO: 'Teléfono',
}

interface ResumenVentasCardProps {
  ventas: Venta[]
}

export function ResumenVentasCard({ ventas }: ResumenVentasCardProps) {
  const resumen = calcularResumen(ventas)
  const porMedio = agruparPorMedioPago(ventas)
  const porCanal = agruparPorCanal(ventas)

  function exportarResumen() {
    const headers = ['Métrica', 'Valor']
    const rows: (string | number)[][] = [
      ['Total facturado', resumen.totalFacturado],
      ['Cantidad de ventas', resumen.cantidadVentas],
      ['Ticket promedio', resumen.ticketPromedio],
      ['Venta mínima', resumen.ventaMinima],
      ['Venta máxima', resumen.ventaMaxima],
    ]
    exportarCsv('resumen-ventas.csv', headers, rows)
  }

  function exportarPorMedioPago() {
    const headers = ['Medio de pago', 'Monto', '% del total']
    const rows = porMedio.map((m) => [
      LABELS_MEDIO_PAGO[m.medio] ?? m.medio,
      m.monto,
      resumen.totalFacturado > 0 ? m.monto / resumen.totalFacturado : 0,
    ])
    exportarCsv('ventas-por-medio-pago.csv', headers, rows)
  }

  function exportarPorCanal() {
    const headers = ['Canal', 'Monto', '% del total']
    const rows = porCanal.map((c) => [
      LABELS_CANAL[c.canal] ?? c.canal,
      c.monto,
      resumen.totalFacturado > 0 ? c.monto / resumen.totalFacturado : 0,
    ])
    exportarCsv('ventas-por-canal.csv', headers, rows)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Resumen de ventas</h3>
        <button
          onClick={exportarResumen}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Exportar CSV
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Total facturado" value={formatPrecio.format(resumen.totalFacturado)} />
        <Kpi label="Cantidad de ventas" value={String(resumen.cantidadVentas)} />
        <Kpi label="Ticket promedio" value={formatPrecio.format(resumen.ticketPromedio)} />
        <Kpi label="Venta mínima" value={formatPrecio.format(resumen.ventaMinima)} />
        <Kpi label="Venta máxima" value={formatPrecio.format(resumen.ventaMaxima)} />
      </div>

      {porMedio.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500">Por medio de pago</h4>
            <button
              onClick={exportarPorMedioPago}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              CSV
            </button>
          </div>
          <div className="mt-2 space-y-1.5">
            {porMedio.map((m) => (
              <div key={m.medio} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-xs text-gray-600">
                  {LABELS_MEDIO_PAGO[m.medio] ?? m.medio}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-gray-900"
                      style={{
                        width: `${resumen.totalFacturado > 0 ? (m.monto / resumen.totalFacturado) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatPrecio.format(m.monto)} ·{' '}
                  {formatPorcentaje.format(
                    resumen.totalFacturado > 0 ? m.monto / resumen.totalFacturado : 0,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {porCanal.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-gray-500">Por canal de venta</h4>
            <button
              onClick={exportarPorCanal}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              CSV
            </button>
          </div>
          <div className="mt-2 space-y-1.5">
            {porCanal.map((c) => (
              <div key={c.canal} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate text-xs text-gray-600">
                  {LABELS_CANAL[c.canal] ?? c.canal}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-gray-900"
                      style={{
                        width: `${resumen.totalFacturado > 0 ? (c.monto / resumen.totalFacturado) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {formatPrecio.format(c.monto)} ·{' '}
                  {formatPorcentaje.format(
                    resumen.totalFacturado > 0 ? c.monto / resumen.totalFacturado : 0,
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}
