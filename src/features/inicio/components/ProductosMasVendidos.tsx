import { Link } from 'react-router-dom'

const formatPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const formatPorcentaje = new Intl.NumberFormat('es-AR', { style: 'percent', maximumFractionDigits: 0 })

export interface ProductoVendido {
  productoId: number
  nombre: string
  cantidad: number
  monto: number
  // Stock actual del producto sumando TODAS sus variantes (no una en
  // particular) — es lo que permite calcular el % vendido a nivel modelo.
  stockActual: number
}

interface ProductosMasVendidosProps {
  datos: ProductoVendido[]
}

// Ranking simple (nombre + barra + cantidad/monto/% vendido). La barra
// ordena por cantidad vendida (unidades), no por monto, porque para decidir
// qué reponer importa más "cuántas se fueron" que "cuánto generaron". El
// primer puesto se destaca (barra + texto más oscuros, resto en gris más
// claro) — es "emphasis": un solo punto de interés, el resto como
// contexto. Deliberadamente NO se gradúa el color por puesto (2do más
// oscuro que 3ro, etc.): la barra ya codifica la magnitud con su largo,
// sumarle un degradé de color encima sería codificar lo mismo dos veces.
// Cada fila lleva al detalle del producto — ver algo llamativo acá y poder
// ir directo a reponerlo o revisar precio es el objetivo de tenerlo en
// Inicio.
//
// El % es la rotación del **modelo completo** (todas sus variantes
// sumadas), no de una variante suelta ni de la participación dentro del
// ranking: vendido / (vendido + stock actual). Si no queda nada en stock,
// da 100% — se vendió todo lo que había.
export function ProductosMasVendidos({ datos }: ProductosMasVendidosProps) {
  if (datos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">Productos más vendidos (últimos 7 días)</p>
        <p className="mt-3 text-sm text-gray-400">Todavía no hay ventas en este período.</p>
      </div>
    )
  }

  const max = Math.max(...datos.map((d) => d.cantidad))
  const totalUnidades = datos.reduce((acc, d) => acc + d.cantidad, 0)
  const totalMonto = datos.reduce((acc, d) => acc + d.monto, 0)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-gray-500">Productos más vendidos (últimos 7 días)</p>
        <p className="text-sm font-semibold text-gray-900">{formatPrecio.format(totalMonto)}</p>
      </div>
      <div className="mt-4 space-y-1">
        {datos.map((item, i) => {
          const esPrimero = i === 0
          return (
            <Link
              key={item.productoId}
              to={`/productos/${item.productoId}`}
              className={`-mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50 ${
                esPrimero ? 'bg-gray-50' : ''
              }`}
            >
              <span
                className={`w-4 shrink-0 text-xs ${esPrimero ? 'font-semibold text-gray-900' : 'text-gray-400'}`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate text-sm ${esPrimero ? 'font-medium' : ''} text-gray-900`}>
                    {item.nombre}
                  </p>
                  <p className="shrink-0 text-xs text-gray-500">
                    {item.cantidad} u. · {formatPrecio.format(item.monto)} ·{' '}
                    {formatPorcentaje.format(item.cantidad / (item.cantidad + item.stockActual))} vendido
                  </p>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full ${esPrimero ? 'bg-gray-900' : 'bg-gray-300'}`}
                    style={{ width: `${(item.cantidad / max) * 100}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      <p className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-400">
        {totalUnidades} unidades entre estos {datos.length}
      </p>
    </div>
  )
}
