import { useMemo, useState, type ReactNode } from 'react'
import { compararTallas } from '../../../shared/tallas'
import type { VarianteDraft } from '../lib/varianteDraft'
import type { Color } from '../../../types/color'
import type { Talla } from '../../../types/talla'

const CELDA =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-1 text-center text-sm font-medium tabular-nums text-gray-900 placeholder:font-normal placeholder:text-gray-300 focus:border-gray-400 focus:outline-none transition-colors'
const CELDA_MARCADA = 'border-gray-300 bg-gray-50/70'
const INPUT_AVANZADO =
  'rounded-md border border-gray-200 px-1.5 py-0.5 text-xs text-gray-900 focus:border-gray-400 focus:outline-none'

interface VariantesEditorProps {
  variantes: VarianteDraft[]
  onChange: (variantes: VarianteDraft[]) => void
  colores: Color[]
  tallas: Talla[]
  precioBase: number
  onGestionarCatalogos: () => void
}

function Chip({
  activo,
  bloqueado,
  onClick,
  children,
}: {
  activo: boolean
  bloqueado?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        activo
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${bloqueado ? 'cursor-default' : ''}`}
    >
      {children}
    </button>
  )
}

function draftVacio(
  colorId: number | 'sin-color',
  tallaId: number,
  stock: string,
  stockMinimo: string,
): VarianteDraft {
  return {
    localId: crypto.randomUUID(),
    colorId,
    colorNombreNuevo: '',
    colorHexNuevo: '#000000',
    tallaId,
    tallaNombreNueva: '',
    tallaTipoNueva: 'ROPA',
    codigoBarras: '',
    precio: '',
    stock,
    stockMinimo,
    stockMinimoTocado: false,
    activo: true,
  }
}

const sugerirMinimo = (stock: number) => (stock > 0 ? Math.max(1, Math.ceil(stock * 0.1)) : 0)

type ColorFila = { id: number | 'sin-color'; nombre: string; hex?: string }

/**
 * Editor de variantes como grilla color × talla.
 *
 * Filas = colores, columnas = tallas. Cada celda es el stock de esa combinación; escribir
 * un número crea la variante, vaciarla la quita (si todavía no está guardada). Reemplaza el
 * flujo viejo de chips + tabla fila-por-variante, que obligaba a un ciclo por combinación.
 * Los ajustes finos (precio propio, código de barras, mínimo, activa) viven en un panel
 * colapsable para no ensuciar el caso común.
 */
export function VariantesEditor({
  variantes,
  onChange,
  colores,
  tallas,
  precioBase,
  onGestionarCatalogos,
}: VariantesEditorProps) {
  // Colores/tallas que el usuario agregó a la grilla pero todavía no tienen ninguna
  // variante cargada. Los que ya tienen variante se derivan de `variantes`, así que
  // no se pueden "desmarcar" desde acá (para no dejar huérfanas variantes guardadas).
  //
  // En el alta se preselecciona "Sin color" — la mayoría de las prendas se cargan solo
  // por talle, y el color se elige a mano cuando corresponde. `'sin-color'` es una fila
  // virtual para variantes con color nulo (el backend lo acepta).
  const [coloresPendientes, setColoresPendientes] = useState<Array<number | 'sin-color'>>(() =>
    variantes.length > 0 ? [] : ['sin-color'],
  )
  const [tallasPendientes, setTallasPendientes] = useState<number[]>([])
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false)

  const colorDe = (colorId: number | 'otro' | 'sin-color'): Color | undefined =>
    typeof colorId === 'number' ? colores.find((c) => c.id === colorId) : undefined
  const tallaDe = (tallaId: number | 'otro'): Talla | undefined =>
    typeof tallaId === 'number' ? tallas.find((t) => t.id === tallaId) : undefined

  const coloresUsados = useMemo(
    () =>
      new Set(
        variantes
          .map((v) => v.colorId)
          .filter((x): x is number | 'sin-color' => typeof x === 'number' || x === 'sin-color'),
      ),
    [variantes],
  )
  const tallasUsadas = useMemo(
    () => new Set(variantes.map((v) => v.tallaId).filter((x): x is number => typeof x === 'number')),
    [variantes],
  )

  const filas = useMemo<ColorFila[]>(() => {
    const base: ColorFila[] = colores
      .filter((c) => coloresUsados.has(c.id) || coloresPendientes.includes(c.id))
      .map((c) => ({ id: c.id, nombre: c.nombre, hex: c.codigoHex }))
    const sinColor: ColorFila[] =
      coloresUsados.has('sin-color') || coloresPendientes.includes('sin-color')
        ? [{ id: 'sin-color', nombre: 'Sin color' }]
        : []
    return [...sinColor, ...base]
  }, [colores, coloresUsados, coloresPendientes])
  const columnas = useMemo(
    () => tallas.filter((t) => tallasUsadas.has(t.id) || tallasPendientes.includes(t.id)),
    [tallas, tallasUsadas, tallasPendientes],
  )

  const draftDe = (colorId: number | 'sin-color', tallaId: number): VarianteDraft | undefined =>
    variantes.find((v) => v.colorId === colorId && v.tallaId === tallaId)

  const actualizar = (localId: string, cambios: Partial<VarianteDraft>) => {
    onChange(
      variantes.map((v) => {
        if (v.localId !== localId) return v
        const actualizado = { ...v, ...cambios }
        if ('stockMinimo' in cambios) {
          actualizado.stockMinimoTocado = actualizado.stockMinimo.trim() !== ''
        }
        return actualizado
      }),
    )
  }

  const quitar = (localId: string) => {
    onChange(variantes.filter((v) => v.localId !== localId))
  }

  const setCelda = (colorId: number | 'sin-color', tallaId: number, valor: string) => {
    const existente = draftDe(colorId, tallaId)
    if (existente) {
      if (valor === '') {
        // Vaciada: si todavía no está guardada se elimina; si ya existe en el
        // servidor se deja en 0 (no hay endpoint de borrado de variante).
        if (existente.id === undefined) quitar(existente.localId)
        else actualizar(existente.localId, { stock: '0' })
        return
      }
      const cambios: Partial<VarianteDraft> = { stock: valor }
      if (!existente.stockMinimoTocado) {
        cambios.stockMinimo = String(sugerirMinimo(Number(valor) || 0))
      }
      actualizar(existente.localId, cambios)
      return
    }
    if (valor === '') return
    onChange([
      ...variantes,
      draftVacio(colorId, tallaId, valor, String(sugerirMinimo(Number(valor) || 0))),
    ])
  }

  const toggleColor = (id: number | 'sin-color') => {
    if (coloresUsados.has(id)) return
    setColoresPendientes((actual) =>
      actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id],
    )
  }

  const toggleTalla = (id: number) => {
    if (tallasUsadas.has(id)) return
    setTallasPendientes((actual) =>
      actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id],
    )
  }

  const variantesOrdenadas = useMemo(() => {
    const buscarTalla = (id: number | 'otro') =>
      typeof id === 'number' ? tallas.find((t) => t.id === id) : undefined
    return [...variantes].sort((a, b) =>
      compararTallas(buscarTalla(a.tallaId), buscarTalla(b.tallaId)),
    )
  }, [variantes, tallas])

  const totalPrendas = variantes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
  const stockDe = (v: VarianteDraft) => Number(v.stock) || 0
  const totalFila = (colorId: number | 'sin-color') =>
    variantes.filter((v) => v.colorId === colorId).reduce((acc, v) => acc + stockDe(v), 0)
  const totalColumna = (tallaId: number) =>
    variantes.filter((v) => v.tallaId === tallaId).reduce((acc, v) => acc + stockDe(v), 0)
  const grillaLista = filas.length > 0 && columnas.length > 0
  const sinColorUsado = coloresUsados.has('sin-color')
  const sinColorActivo = sinColorUsado || coloresPendientes.includes('sin-color')

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          Elegí los colores y tallas del producto y cargá el stock de cada combinación.
        </p>
        <button
          type="button"
          onClick={onGestionarCatalogos}
          className="text-xs font-medium text-gray-700 hover:text-gray-900"
        >
          + Gestionar talles y colores
        </button>
      </div>

      {/* Selectores de color y talla */}
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1.5">
          <span className="mt-1 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Colores
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              activo={sinColorActivo}
              bloqueado={sinColorUsado}
              onClick={() => toggleColor('sin-color')}
            >
              Sin color
            </Chip>
            {colores.map((c) => {
              const usado = coloresUsados.has(c.id)
              const activo = usado || coloresPendientes.includes(c.id)
              return (
                <Chip key={c.id} activo={activo} bloqueado={usado} onClick={() => toggleColor(c.id)}>
                  <span
                    className="inline-block h-2 w-2 rounded-full border border-gray-300"
                    style={{ backgroundColor: c.codigoHex }}
                  />
                  {c.nombre}
                </Chip>
              )
            })}
          </div>
        </div>

        {(
          [
            ['ROPA', 'Ropa'],
            ['CALZADO', 'Calzado'],
          ] as const
        ).map(([tipo, label]) => {
          const grupo = tallas.filter((t) => t.tipo === tipo)
          if (grupo.length === 0) return null
          return (
            <div key={tipo} className="flex flex-wrap items-start gap-x-2 gap-y-1.5">
              <span className="mt-1 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {grupo.map((t) => {
                  const usado = tallasUsadas.has(t.id)
                  const activo = usado || tallasPendientes.includes(t.id)
                  return (
                    <Chip key={t.id} activo={activo} bloqueado={usado} onClick={() => toggleTalla(t.id)}>
                      {t.nombre}
                    </Chip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Grilla color × talla */}
      {grillaLista ? (
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="sticky left-0 z-10 bg-gray-50/80 px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Color
                </th>
                {columnas.map((t) => (
                  <th key={t.id} className="min-w-[64px] px-1 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {t.nombre}
                  </th>
                ))}
                <th className="min-w-[64px] px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filas.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-gray-50/40">
                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5 group-hover:bg-gray-50/40">
                      <span className="flex items-center gap-2">
                        {c.hex ? (
                          <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                            style={{ backgroundColor: c.hex }}
                          />
                        ) : (
                          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-gray-300" />
                        )}
                        <span className="truncate text-sm font-medium text-gray-900">{c.nombre}</span>
                      </span>
                    </td>
                  {columnas.map((t) => {
                    const draft = draftDe(c.id, t.id)
                    return (
                      <td key={t.id} className="p-1">
                        <input
                          type="number"
                          min={0}
                          value={draft?.stock ?? ''}
                          onChange={(e) => setCelda(c.id, t.id, e.target.value)}
                          placeholder="0"
                          title={`${c.nombre} / ${t.nombre}`}
                          className={`${CELDA} ${draft ? CELDA_MARCADA : ''}`}
                        />
                      </td>
                    )
                  })}
                  <td
                    className="px-2 py-1.5 text-center text-[11px] font-medium tabular-nums text-gray-400"
                    title={`Total de ${c.nombre}`}
                  >
                    {totalFila(c.id)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100">
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-400">
                  Total
                </td>
                {columnas.map((t) => (
                  <td
                    key={t.id}
                    className="px-1 py-1.5 text-center text-[11px] font-medium tabular-nums text-gray-500"
                    title={`Total ${t.nombre}`}
                  >
                    {totalColumna(t.id)}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center text-[11px] font-medium tabular-nums text-gray-500">
                  {totalPrendas}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-center text-xs text-gray-500">
          Elegí al menos un color y una talla para armar la grilla.
        </p>
      )}

      <p className="mt-2 text-xs text-gray-400">
        Escribí el stock de cada celda. Las celdas vacías no crean variantes.
      </p>

      {/* Resumen + panel de ajustes por variante */}
      {variantes.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{variantes.length}</span>{' '}
            {variantes.length === 1 ? 'variante' : 'variantes'} ·{' '}
            <span className="font-semibold tabular-nums text-gray-900">{totalPrendas}</span> prendas en total
          </p>
          <button
            type="button"
            onClick={() => setMostrarAvanzado((v) => !v)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            {mostrarAvanzado ? 'Ocultar ajustes por variante' : 'Ajustes por variante (precio, código, mínimo) →'}
          </button>
        </div>
      )}

      {mostrarAvanzado && variantes.length > 0 && (
        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/80">
              <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <th className="px-3 py-2">Variante</th>
                <th className="px-3 py-2">Precio</th>
                <th className="px-3 py-2">Código de barras</th>
                <th className="px-3 py-2">Mín.</th>
                <th className="px-3 py-2">Activa</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variantesOrdenadas.map((v) => {
                const color = colorDe(v.colorId)
                const talla = tallaDe(v.tallaId)
                const nombreColor = color?.nombre ?? (v.colorId === 'sin-color' ? 'Sin color' : '—')
                const guardada = v.id !== undefined
                return (
                  <tr key={v.localId} className="transition-colors hover:bg-gray-50/40">
                    <td className="px-3 py-1.5">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                          style={{ backgroundColor: color?.codigoHex ?? '#ffffff' }}
                        />
                        <span className="font-medium text-gray-900">{nombreColor}</span> <span className="text-gray-300">/</span>{' '}
                        <span className="text-gray-700">{talla?.nombre ?? '—'}</span>
                        {guardada && (
                          <span className="ml-1 rounded bg-gray-100 px-1 text-[10px] text-gray-400">
                            guardada
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          min="0"
                          value={v.precio}
                          onChange={(e) => actualizar(v.localId, { precio: e.target.value })}
                          placeholder={String(precioBase)}
                          className={`w-20 ${INPUT_AVANZADO}`}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={v.codigoBarras}
                        onChange={(e) => actualizar(v.localId, { codigoBarras: e.target.value })}
                        placeholder="(genérico)"
                        className={`w-36 ${INPUT_AVANZADO}`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        min="0"
                        value={v.stockMinimo}
                        onChange={(e) => actualizar(v.localId, { stockMinimo: e.target.value })}
                        className={`w-16 ${INPUT_AVANZADO}`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="checkbox"
                        checked={v.activo}
                        onChange={(e) => actualizar(v.localId, { activo: e.target.checked })}
                        title="Variante activa"
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {!guardada && (
                        <button
                          type="button"
                          onClick={() => quitar(v.localId)}
                          title="Quitar"
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
