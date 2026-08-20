import { Fragment, useCallback, useRef, useState } from 'react'
import { GeneradorVariantes } from './GeneradorVariantes'
import { crearVarianteDraftVacia, type VarianteDraft } from '../lib/varianteDraft'
import type { Color } from '../../../types/color'
import type { Talla, TallaTipo } from '../../../types/talla'

const TIPOS_TALLA: TallaTipo[] = ['ROPA', 'CALZADO']

function nombreColorDe(draft: VarianteDraft, colores: Color[]): string {
  if (draft.colorId === 'otro') return draft.colorNombreNuevo
  return colores.find((c) => c.id === draft.colorId)?.nombre ?? ''
}

function nombreTallaDe(draft: VarianteDraft, tallas: Talla[]): string {
  if (draft.tallaId === 'otro') return draft.tallaNombreNueva
  return tallas.find((t) => t.id === draft.tallaId)?.nombre ?? ''
}

interface VariantesEditorProps {
  variantes: VarianteDraft[]
  onChange: (variantes: VarianteDraft[]) => void
  colores: Color[]
  tallas: Talla[]
  precioBase: number
  onCatalogoActualizado: () => void
}

export function VariantesEditor({
  variantes,
  onChange,
  colores,
  tallas,
  precioBase,
  onCatalogoActualizado,
}: VariantesEditorProps) {
  const stockRefs = useRef(new Map<string, HTMLInputElement>())
  const [editandoPrecio, setEditandoPrecio] = useState<Set<string>>(new Set())

  const ordenDeTalla = (tallaId: number | 'otro'): number => {
    if (tallaId === 'otro') return Number.MAX_SAFE_INTEGER
    return tallas.find((t) => t.id === tallaId)?.orden ?? Number.MAX_SAFE_INTEGER
  }
  const variantesOrdenadas = [...variantes].sort(
    (a, b) => ordenDeTalla(a.tallaId) - ordenDeTalla(b.tallaId),
  )

  const duplicados = (() => {
    const counts = new Map<string, number>()
    for (const v of variantes) {
      if (v.colorId === 'otro' || v.tallaId === 'otro') continue
      const key = `${v.colorId}:${v.tallaId}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  })()

  const esDuplicado = (draft: VarianteDraft): boolean => {
    if (draft.colorId === 'otro' || draft.tallaId === 'otro') return false
    return (duplicados.get(`${draft.colorId}:${draft.tallaId}`) ?? 0) > 1
  }

  const conStockMinimoSugerido = (draft: VarianteDraft): VarianteDraft => {
    if (draft.stockMinimoTocado) return draft
    const stock = Number(draft.stock) || 0
    const sugerido = stock > 0 ? Math.max(1, Math.ceil(stock * 0.1)) : 0
    return { ...draft, stockMinimo: String(sugerido) }
  }

  const actualizar = (localId: string, cambios: Partial<VarianteDraft>) => {
    onChange(
      variantes.map((v) => {
        if (v.localId !== localId) return v
        let actualizado = { ...v, ...cambios }
        if ('stockMinimo' in cambios) {
          actualizado.stockMinimoTocado = actualizado.stockMinimo.trim() !== ''
        }
        actualizado = conStockMinimoSugerido(actualizado)
        return actualizado
      }),
    )
  }

  const quitar = (localId: string) => {
    onChange(variantes.filter((v) => v.localId !== localId))
  }

  const agregar = () => {
    const nueva = crearVarianteDraftVacia(colores, tallas)
    onChange([...variantes, nueva])
  }

  const generarVariantes = (combinaciones: Array<{ colorId: number; tallaId: number }>) => {
    const nuevas = combinaciones.map(({ colorId, tallaId }) => ({
      ...crearVarianteDraftVacia(colores, tallas),
      colorId,
      tallaId,
    }))
    onChange([...variantes, ...nuevas])
  }

  const togglePrecioPersonalizado = (localId: string) => {
    setEditandoPrecio((actual) => {
      const next = new Set(actual)
      if (next.has(localId)) {
        next.delete(localId)
        actualizar(localId, { precio: '' })
      } else {
        next.add(localId)
      }
      return next
    })
  }

  const totalPrendas = variantes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  const handleStockKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, localId: string) => {
      if (e.key !== 'Tab' && e.key !== 'Enter') return
      const orden = variantesOrdenadas.map((v) => v.localId)
      const idx = orden.indexOf(localId)
      if (idx === -1) return
      const nextIdx = e.key === 'Tab' && e.shiftKey ? idx - 1 : idx + 1
      if (nextIdx < 0 || nextIdx >= orden.length) return
      e.preventDefault()
      stockRefs.current.get(orden[nextIdx])?.focus()
    },
    [variantesOrdenadas],
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">Variantes (talle / color)</h2>
        <button
          type="button"
          onClick={agregar}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          + Agregar variante
        </button>
      </div>

      <div className="mt-3">
        <GeneradorVariantes
          colores={colores}
          tallas={tallas}
          existentes={variantes.map((v) => ({ colorId: v.colorId, tallaId: v.tallaId }))}
          onGenerar={generarVariantes}
          onCatalogoActualizado={onCatalogoActualizado}
        />
      </div>

      {variantes.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">Todavía no hay variantes cargadas.</p>
      )}

      {variantes.length > 0 && duplicados.size > 0 && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Hay combinaciones color+talla repetidas. Se marcaron en amarillo.
        </div>
      )}

      {variantes.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-3 py-1.5 font-medium">Variante</th>
                <th className="px-3 py-1.5 font-medium">Precio</th>
                <th className="px-3 py-1.5 font-medium">Stock</th>
                <th className="px-3 py-1.5 font-medium">Mín.</th>
                <th className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variantesOrdenadas.map((variante) => {
                const esNueva = variante.id === undefined
                const otroAbierto = variante.colorId === 'otro' || variante.tallaId === 'otro'
                const precioEditable = editandoPrecio.has(variante.localId)
                return (
                  <Fragment key={variante.localId}>
                    <tr
                      className={`align-top ${esDuplicado(variante) ? 'bg-amber-50' : ''}`}
                    >
                      <td className="px-3 py-1.5">
                        {esNueva ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900">
                              {nombreTallaDe(variante, tallas)}
                            </span>
                            <span className="text-gray-400">·</span>
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                              style={{
                                backgroundColor:
                                  variante.colorId === 'otro'
                                    ? variante.colorHexNuevo
                                    : colores.find((c) => c.id === variante.colorId)?.codigoHex,
                              }}
                            />
                            <span className="text-gray-700">
                              {nombreColorDe(variante, colores)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900">
                              {variante.tallaId === 'otro' ? variante.tallaNombreNueva : tallas.find((t) => t.id === variante.tallaId)?.nombre ?? '—'}
                            </span>
                            <span className="text-gray-400">·</span>
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                              style={{ backgroundColor: variante.colorId === 'otro' ? variante.colorHexNuevo : colores.find((c) => c.id === variante.colorId)?.codigoHex }}
                            />
                            <span className="text-gray-700">{nombreColorDe(variante, colores)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        {precioEditable ? (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">$</span>
                            <input
                              type="number"
                              min="0"
                              value={variante.precio}
                              onChange={(e) => actualizar(variante.localId, { precio: e.target.value })}
                              placeholder={String(precioBase)}
                              className="w-20 rounded-md border border-gray-300 px-1.5 py-0.5 text-xs focus:border-gray-500 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => togglePrecioPersonalizado(variante.localId)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Volver al precio base"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => togglePrecioPersonalizado(variante.localId)}
                            className={`text-xs ${esNueva ? 'text-gray-400 hover:text-gray-700' : 'text-gray-900 hover:text-gray-700'}`}
                            title="Personalizar precio"
                          >
                            {variante.precio ? `$${variante.precio}` : `$${precioBase}`}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {esNueva ? (
                          <input
                            ref={(el) => {
                              if (el) stockRefs.current.set(variante.localId, el)
                              else stockRefs.current.delete(variante.localId)
                            }}
                            type="number"
                            min="0"
                            value={variante.stock}
                            onChange={(e) => actualizar(variante.localId, { stock: e.target.value })}
                            onFocus={() => {
                              if (variante.stock === '0') actualizar(variante.localId, { stock: '' })
                            }}
                            onKeyDown={(e) => handleStockKeyDown(e, variante.localId)}
                            placeholder="0"
                            className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm font-medium focus:border-gray-500 focus:outline-none"
                          />
                        ) : (
                          <span className="text-gray-900">{variante.stock}</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-gray-500">
                        {esNueva ? (
                          <span title={`Mín. sugerido: ${Math.max(1, Math.ceil((Number(variante.stock) || 0) * 0.1))}`}>
                            {variante.stockMinimo || '—'}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            value={variante.stockMinimo}
                            onChange={(e) => actualizar(variante.localId, { stockMinimo: e.target.value })}
                            className="w-16 rounded-md border border-gray-300 px-1.5 py-0.5 text-xs focus:border-gray-500 focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {esNueva ? (
                          <button
                            type="button"
                            onClick={() => quitar(variante.localId)}
                            title="Quitar"
                            className="font-medium text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        ) : (
                          <input
                            type="checkbox"
                            checked={variante.activo}
                            onChange={(e) => actualizar(variante.localId, { activo: e.target.checked })}
                            title="Variante activa"
                          />
                        )}
                      </td>
                    </tr>

                    {otroAbierto && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {variante.colorId === 'otro' && (
                              <>
                                <input
                                  type="text"
                                  value={variante.colorNombreNuevo}
                                  onChange={(e) =>
                                    actualizar(variante.localId, { colorNombreNuevo: e.target.value })
                                  }
                                  placeholder="Nombre del color nuevo"
                                  className="w-40 rounded-md border border-gray-300 px-2 py-1 text-xs"
                                />
                                <input
                                  type="color"
                                  value={variante.colorHexNuevo}
                                  onChange={(e) =>
                                    actualizar(variante.localId, { colorHexNuevo: e.target.value })
                                  }
                                  className="h-7 w-10 rounded-md border border-gray-300"
                                />
                              </>
                            )}
                            {variante.tallaId === 'otro' && (
                              <>
                                <input
                                  type="text"
                                  value={variante.tallaNombreNueva}
                                  onChange={(e) =>
                                    actualizar(variante.localId, { tallaNombreNueva: e.target.value })
                                  }
                                  placeholder="Nombre de la talla nueva"
                                  className="w-36 rounded-md border border-gray-300 px-2 py-1 text-xs"
                                />
                                <select
                                  value={variante.tallaTipoNueva}
                                  onChange={(e) =>
                                    actualizar(variante.localId, {
                                      tallaTipoNueva: e.target.value as TallaTipo,
                                    })
                                  }
                                  className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                                >
                                  {TIPOS_TALLA.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                      {tipo}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {variantes.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          {variantes.length} {variantes.length === 1 ? 'variante' : 'variantes'} ·{' '}
          <span className="font-medium text-gray-900">{totalPrendas}</span> prendas en total
        </p>
      )}
    </div>
  )
}
