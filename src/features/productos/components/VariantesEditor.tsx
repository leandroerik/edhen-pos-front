import { Fragment, useEffect, useRef, useState } from 'react'
import { GeneradorVariantes } from './GeneradorVariantes'
import { crearVarianteDraftVacia, type VarianteDraft } from '../lib/varianteDraft'
import { sugerirSku } from '../lib/sku'
import type { Color } from '../../../types/color'
import type { Talla, TallaTipo } from '../../../types/talla'

const TIPOS_TALLA: TallaTipo[] = ['ROPA_SUPERIOR', 'ROPA_INFERIOR', 'CALZADO', 'UNICO']

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
  nombreProducto: string
  colores: Color[]
  tallas: Talla[]
  onCatalogoActualizado: () => void
}

export function VariantesEditor({
  variantes,
  onChange,
  nombreProducto,
  colores,
  tallas,
  onCatalogoActualizado,
}: VariantesEditorProps) {
  const [precioMasivo, setPrecioMasivo] = useState('')
  const [stockMinimoMasivo, setStockMinimoMasivo] = useState('')

  // La tabla se muestra ordenada por talla (pedido explícito: "mantener
  // el orden"), no en el orden en que se van generando — así una variante
  // que se agrega más tarde para un talle chico (ej. sumaste un color a
  // "S" después de haber cargado "M" y "L") aparece agrupada con el resto
  // de "S", no al final de la tabla. `sort` es estable, así que dentro de
  // un mismo talle se conserva el orden en que se cargaron. Una variante
  // "otro" (talle recién creado, sin id de catálogo todavía) va al final.
  const ordenDeTalla = (tallaId: number | 'otro'): number => {
    if (tallaId === 'otro') return Number.MAX_SAFE_INTEGER
    return tallas.find((t) => t.id === tallaId)?.orden ?? Number.MAX_SAFE_INTEGER
  }
  const variantesOrdenadas = [...variantes].sort(
    (a, b) => ordenDeTalla(a.tallaId) - ordenDeTalla(b.tallaId),
  )

  // Cada vez que se suma una variante (a mano o desde el generador), baja
  // la vista hasta esa fila — pedido explícito, para no tener que
  // scrollear a mano y perder de vista lo que se acaba de cargar. Como la
  // tabla queda ordenada por talla y no por orden de carga, la fila nueva
  // no necesariamente cae al final — por eso se apunta puntualmente a la
  // fila (por `localId`) en vez de scrollear el contenedor entero hasta
  // abajo.
  const filaRefs = useRef(new Map<string, HTMLTableRowElement>())
  const localIdsNuevosRef = useRef<string[]>([])
  useEffect(() => {
    const primerNuevo = localIdsNuevosRef.current[0]
    localIdsNuevosRef.current = []
    if (!primerNuevo) return
    filaRefs.current.get(primerNuevo)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [variantes])

  // El SKU ya no se tipea ni se guarda en el draft: se calcula acá mismo
  // para mostrarlo (nombre + color + talla, igual que sugerirSku), solo
  // para vista previa — el SKU real que queda guardado lo arma
  // `productos.api.ts` (`generarSku`) al crear/editar, agregando el id de
  // la variante como sufijo para que sea único (acá todavía no existe ese
  // id si la fila es nueva, por eso la vista previa no lo incluye).
  const skuMostrado = (draft: VarianteDraft): string => {
    const base = sugerirSku(nombreProducto, nombreColorDe(draft, colores), nombreTallaDe(draft, tallas))
    return draft.id === undefined ? base : `${base}-${draft.id}`
  }

  // Mínimo sugerido = 10% del stock inicial cargado (redondeado para arriba,
  // piso de 1 si hay algo de stock) — mismo criterio de "sugerido hasta que
  // lo toques" que el SKU: sigue al stock mientras no se edite a mano.
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
    localIdsNuevosRef.current = [nueva.localId]
    onChange([...variantes, nueva])
  }

  // Crea una fila por cada combinación talle×color que se marcó en el
  // generador — mismo draft "vacío" que "+ Agregar variante" (stock 0),
  // solo que con el color/talla ya fijados en vez de quedar en el primero
  // de la lista.
  const generarVariantes = (combinaciones: Array<{ colorId: number; tallaId: number }>) => {
    const nuevas = combinaciones.map(({ colorId, tallaId }) => ({
      ...crearVarianteDraftVacia(colores, tallas),
      colorId,
      tallaId,
    }))
    localIdsNuevosRef.current = nuevas.map((n) => n.localId)
    onChange([...variantes, ...nuevas])
  }

  // Pisa el precio de todas las variantes cargadas hoy con un mismo valor.
  // Es una acción puntual, no queda "pegada": si después editás el precio
  // de una variante en particular, solo cambia esa — no vuelve a aplicarse
  // a menos que toques "Aplicar a todas" de nuevo.
  const aplicarPrecioATodas = () => {
    onChange(variantes.map((v) => ({ ...v, precio: precioMasivo })))
  }

  // Mismo criterio que "Aplicar a todas" de precio: pisa el mínimo de todas
  // las variantes cargadas con un mismo valor, sin quedar "pegado" — es un
  // atajo puntual, no una regla que se reaplique sola.
  const aplicarStockMinimoATodas = () => {
    onChange(variantes.map((v) => ({ ...v, stockMinimo: stockMinimoMasivo, stockMinimoTocado: true })))
  }

  // Suma el stock cargado en cada fila (para una variante existente, el
  // stock actual; no es editable acá, pero cuenta igual para el total).
  // Pedido explícito: ver en vivo cuántas prendas en total se van
  // cargando, para cruzar contra lo que efectivamente llegó.
  const totalPrendas = variantes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">Variantes (talle / color)</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={precioMasivo}
              onChange={(e) => setPrecioMasivo(e.target.value)}
              placeholder="Precio para todas"
              className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={aplicarPrecioATodas}
              disabled={!precioMasivo || variantes.length === 0}
              className="text-xs font-medium text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Aplicar a todas
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={stockMinimoMasivo}
              onChange={(e) => setStockMinimoMasivo(e.target.value)}
              placeholder="Mínimo para todas"
              className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={aplicarStockMinimoATodas}
              disabled={!stockMinimoMasivo || variantes.length === 0}
              className="text-xs font-medium text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Aplicar a todas
            </button>
          </div>
          <button
            type="button"
            onClick={agregar}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            + Agregar variante
          </button>
        </div>
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

      {variantes.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-2 py-1.5 font-medium">Talla</th>
                <th className="px-2 py-1.5 font-medium">Color</th>
                <th className="px-2 py-1.5 font-medium">SKU</th>
                <th className="px-2 py-1.5 font-medium">Precio</th>
                <th className="px-2 py-1.5 font-medium">Stock</th>
                <th className="px-2 py-1.5 font-medium">Mín.</th>
                <th className="px-2 py-1.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variantesOrdenadas.map((variante) => {
                const esNueva = variante.id === undefined
                const otroAbierto = variante.colorId === 'otro' || variante.tallaId === 'otro'
                return (
                  <Fragment key={variante.localId}>
                    <tr
                      ref={(el) => {
                        if (el) filaRefs.current.set(variante.localId, el)
                        else filaRefs.current.delete(variante.localId)
                      }}
                      className="align-top"
                    >
                      <td className="px-2 py-1.5">
                        <select
                          value={variante.tallaId}
                          onChange={(e) =>
                            actualizar(variante.localId, {
                              tallaId: e.target.value === 'otro' ? 'otro' : Number(e.target.value),
                            })
                          }
                          className="w-20 rounded-md border border-gray-300 px-1.5 py-1 text-xs"
                        >
                          {tallas.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombre}
                            </option>
                          ))}
                          <option value="otro">+ Otra…</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select
                          value={variante.colorId}
                          onChange={(e) =>
                            actualizar(variante.localId, {
                              colorId: e.target.value === 'otro' ? 'otro' : Number(e.target.value),
                            })
                          }
                          className="w-24 rounded-md border border-gray-300 px-1.5 py-1 text-xs"
                        >
                          {colores.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                          <option value="otro">+ Otro…</option>
                        </select>
                      </td>
                      <td className="min-w-[9rem] px-2 py-1.5 whitespace-nowrap">
                        <span
                          className="text-gray-400"
                          title={
                            esNueva
                              ? 'Se genera solo al guardar (nombre + color + talla + un número único)'
                              : 'Se recalcula solo si cambiás color o talla'
                          }
                        >
                          {skuMostrado(variante)}
                          {esNueva && '…'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="0"
                          value={variante.precio}
                          onChange={(e) => actualizar(variante.localId, { precio: e.target.value })}
                          placeholder="base"
                          className="w-20 rounded-md border border-gray-300 px-1.5 py-1 text-xs"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        {esNueva ? (
                          <input
                            type="number"
                            min="0"
                            value={variante.stock}
                            onChange={(e) => actualizar(variante.localId, { stock: e.target.value })}
                            onFocus={() => {
                              if (variante.stock === '0') actualizar(variante.localId, { stock: '' })
                            }}
                            className="w-16 rounded-md border border-gray-300 px-1.5 py-1 text-xs"
                          />
                        ) : (
                          <span
                            className="text-gray-400"
                            title="El stock se ajusta desde el módulo Stock"
                          >
                            {variante.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="0"
                          value={variante.stockMinimo}
                          onChange={(e) => actualizar(variante.localId, { stockMinimo: e.target.value })}
                          title={
                            esNueva && !variante.stockMinimoTocado
                              ? 'Sugerido: 10% del stock inicial — se puede editar'
                              : undefined
                          }
                          className={`w-16 rounded-md border border-gray-300 px-1.5 py-1 text-xs ${
                            esNueva && !variante.stockMinimoTocado ? 'text-gray-400' : 'text-gray-900'
                          }`}
                        />
                        {esNueva && variante.stockMinimoTocado && (
                          <button
                            type="button"
                            onClick={() =>
                              actualizar(variante.localId, { stockMinimo: '', stockMinimoTocado: false })
                            }
                            title="Usar el 10% del stock inicial"
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            ↺
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right">
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
                        <td colSpan={7} className="px-2 py-2">
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
