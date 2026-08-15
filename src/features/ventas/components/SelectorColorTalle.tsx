import { useState } from 'react'
import type { Color } from '../../../types/color'
import type { Talla } from '../../../types/talla'

export interface VarianteParaSelector {
  id: number
  sku: string
  color: Color
  talla: Talla
  precio?: number
  stock: number
  stockReservado: number
}

interface SelectorColorTalleProps {
  variantes: VarianteParaSelector[]
  onConfirmar: (seleccion: Array<{ variante: VarianteParaSelector; cantidad: number }>) => void
}

// Elegir una prenda en dos pasos, no una lista plana de talle×color: primero
// el color (swatch + nombre, un chip por color distinto), y recién al
// elegir uno se despliegan sus talles con el stepper de cantidad — pedido
// explícito ("que parezcan íconos según el color... y cuando lo toque me
// deje agregar los talles"). Con un producto de varios colores, mostrar
// las 15-20 combinaciones de una sola vez abrumaba; así el primer vistazo
// es un puñado de colores, no una tabla larga.
//
// Las cantidades cargadas se acumulan en `cantidadesDraft` sin importar
// qué color esté visible en este momento — cambiar de color no las
// borra, así se puede armar un pedido con varios colores (2 negros + 1
// blanco) antes de tocar "Agregar" una sola vez al final. El chip de
// cada color muestra la cantidad ya cargada en ese color, aunque no sea
// el que está abierto.
export function SelectorColorTalle({ variantes, onConfirmar }: SelectorColorTalleProps) {
  const colores = [...new Map(variantes.map((v) => [v.color.id, v.color])).values()]

  const [colorSeleccionadoId, setColorSeleccionadoId] = useState<number | null>(
    colores.length === 1 ? colores[0].id : null,
  )
  const [cantidadesDraft, setCantidadesDraft] = useState<Record<number, number>>({})

  const cambiarCantidad = (varianteId: number, delta: number, tope: number) => {
    setCantidadesDraft((actual) => {
      const actualCantidad = actual[varianteId] ?? 0
      const nueva = Math.max(0, Math.min(tope, actualCantidad + delta))
      return { ...actual, [varianteId]: nueva }
    })
  }

  const cantidadPorColor = (colorId: number) =>
    variantes
      .filter((v) => v.color.id === colorId)
      .reduce((acc, v) => acc + (cantidadesDraft[v.id] ?? 0), 0)

  const variantesDelColor = variantes.filter((v) => v.color.id === colorSeleccionadoId)
  const hayAlgoCargado = Object.values(cantidadesDraft).some((c) => c > 0)

  const confirmar = () => {
    const seleccion = variantes
      .filter((v) => (cantidadesDraft[v.id] ?? 0) > 0)
      .map((v) => ({ variante: v, cantidad: cantidadesDraft[v.id] }))
    if (seleccion.length > 0) onConfirmar(seleccion)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {colores.map((color) => {
          const cantidad = cantidadPorColor(color.id)
          const activo = colorSeleccionadoId === color.id
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => setColorSeleccionadoId(color.id)}
              className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${
                activo
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-gray-300"
                style={{ backgroundColor: color.codigoHex }}
              />
              {color.nombre}
              {cantidad > 0 && (
                <span
                  className={`rounded-full px-1 text-[10px] ${
                    activo ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cantidad}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {colorSeleccionadoId === null ? (
        <p className="text-xs text-gray-400">Elegí un color para ver los talles.</p>
      ) : (
        <div className="space-y-1.5">
          {variantesDelColor.map((variante) => {
            const disponible = variante.stock - variante.stockReservado
            const cantidad = cantidadesDraft[variante.id] ?? 0
            return (
              <div key={variante.id} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-700">
                  {variante.talla.nombre}
                  {disponible <= 0 && <span className="text-red-600">sin stock</span>}
                  {disponible > 0 && disponible <= 3 && (
                    <span className="text-amber-600">¡{disponible}!</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(variante.id, -1, disponible)}
                    disabled={cantidad <= 0}
                    className="h-5 w-5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-gray-900">{cantidad}</span>
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(variante.id, 1, disponible)}
                    disabled={cantidad >= disponible}
                    className="h-5 w-5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={confirmar}
        disabled={!hayAlgoCargado}
        className="mt-2 w-full rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Agregar
      </button>
    </div>
  )
}
