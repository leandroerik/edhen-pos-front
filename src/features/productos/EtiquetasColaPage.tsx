import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useColaEtiquetas } from './context/useColaEtiquetas'
import { CodigoBarras } from './components/CodigoBarras'

// La hoja de etiquetas necesita tamaño A4, distinto del `@page` global de
// src/index.css (80mm, pensado para el ticket/etiqueta suelta en la
// térmica). `@page` no se puede condicionar por selector CSS (no hay forma
// de decir "esta regla @page solo si tal elemento está en la página"), así
// que se inyecta un <style> propio mientras esta pantalla está montada, y
// se saca al desmontar — así no le pisa el tamaño de página al ticket ni a
// una etiqueta suelta cuando se navega a otro lado.
function usePaginaA4() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = '@media print { @page { size: A4; margin: 10mm; } }'
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
}

// "Carrito"/armador de etiquetas para imprimir varias de una en una sola
// hoja A4, en vez de una etiqueta por vez en la térmica (pedido
// explícito). Se arma agregando variantes o el código genérico de un
// producto desde ProductoDetallePage ("+ Cola"); acá se ajustan
// cantidades y se imprime todo junto.
export function EtiquetasColaPage() {
  usePaginaA4()
  const { items, quitar, cambiarCantidad, vaciar, totalEtiquetas } = useColaEtiquetas()

  const etiquetasAImprimir = items.flatMap((item) =>
    Array.from({ length: item.cantidad }, (_, i) => ({ ...item, key: `${item.id}-${i}` })),
  )

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Cola de etiquetas</h1>
        <p className="mt-4 text-sm text-gray-500">
          Todavía no agregaste ninguna. Desde la ficha de un producto (
          <Link to="/productos" className="font-medium text-gray-700 hover:text-gray-900">
            /productos
          </Link>
          ), tocá "+ Cola" en la variante o el código genérico que quieras imprimir.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cola de etiquetas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalEtiquetas} {totalEtiquetas === 1 ? 'etiqueta' : 'etiquetas'} en{' '}
            {items.length === 1 ? '1 modelo' : `${items.length} modelos`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={vaciar}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Vaciar
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Imprimir hoja
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white print:hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm">
                  <p className="text-gray-900">{item.nombreProducto}</p>
                  <p className="text-xs text-gray-500">{item.detalle ?? 'Código genérico'}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{item.codigoBarras}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                      className="h-6 w-6 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm text-gray-900">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                      className="h-6 w-6 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => quitar(item.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="imprimible" className="hidden print:grid print:grid-cols-3 print:gap-3">
        {etiquetasAImprimir.map((etiqueta) => (
          <div
            key={etiqueta.key}
            className="flex flex-col items-center justify-center border border-dashed border-gray-300 p-2 text-center"
          >
            <p className="text-[10px] font-semibold text-gray-900">{etiqueta.nombreProducto}</p>
            {etiqueta.detalle && <p className="text-[9px] text-gray-500">{etiqueta.detalle}</p>}
            <CodigoBarras valor={etiqueta.codigoBarras} alto={35} />
          </div>
        ))}
      </div>
    </div>
  )
}
