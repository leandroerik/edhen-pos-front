import { useMemo, useState } from 'react'
import { ajustarStockLote } from '../../../api/stock.api'
import type { Producto, ProductoVariante } from '../../../types/producto'

interface CargaStockPanelProps {
  producto: Producto
  variantes: ProductoVariante[]
  onAplicado: () => void
}

const CELDA =
  'h-8 w-full rounded-md border border-gray-300 bg-white px-1 text-center text-sm font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:border-gray-900 focus:outline-none transition-colors'
const CELDA_VACIA =
  'h-8 w-full rounded-md border border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-300'

type Signo = 1 | -1

/**
 * Carga masiva de stock por grilla color × talla.
 *
 * Existe porque `StockVarianteModal` obliga a abrir/cerrar un modal por variante, lo que
 * con un producto de 15 combinaciones son 15 ciclos. Acá se escriben todas las celdas
 * de una recepción y se confirma una vez.
 *
 * Solo se renderizan combinaciones que YA existen como variante: la grilla no crea
 * variantes, solo ajusta el stock de las existentes.
 */
export function CargaStockPanel({ producto, variantes, onAplicado }: CargaStockPanelProps) {
  const [abierto, setAbierto] = useState(false)
  const [signo, setSigno] = useState<Signo>(1)
  const [motivo, setMotivo] = useState('')
  // String en vez de number para poder dejar la celda vacía ("" no es 0)
  const [celdas, setCeldas] = useState<Record<number, string>>({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filas = colores presentes, columnas = tallas presentes (ordenadas por `orden`).
  // Un producto puede no tener todas las combinaciones color×talla.
  const { filas, columnas, porFila } = useMemo(() => {
    const mapa = new Map<string, { id: number | null; nombre: string; hex?: string }>()
    const cols = new Map<number, { id: number; nombre: string; orden: number }>()

    for (const v of variantes) {
      const clave = v.color ? `c${v.color.id}` : 'sin-color'
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          id: v.color?.id ?? null,
          nombre: v.color?.nombre ?? 'Sin color',
          hex: v.color?.codigoHex,
        })
      }
      if (v.talla && !cols.has(v.talla.id)) {
        cols.set(v.talla.id, { id: v.talla.id, nombre: v.talla.nombre, orden: v.talla.orden })
      }
    }

    const filasOrdenadas = [...mapa.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre))
    const columnasOrdenadas = [...cols.values()].sort((a, b) => a.orden - b.orden)

    const lookup = new Map<string, ProductoVariante>()
    for (const v of variantes) {
      lookup.set(`${v.color?.id ?? 'sin-color'}|${v.talla?.id ?? 'sin-talla'}`, v)
    }

    return {
      filas: filasOrdenadas,
      columnas: columnasOrdenadas,
      porFila: lookup,
    }
  }, [variantes])

  const items = useMemo(
    () =>
      variantes
        .map((v) => ({ varianteId: v.id, cantidad: Number(celdas[v.id]) || 0 }))
        .filter((i) => i.cantidad > 0),
    [variantes, celdas],
  )

  const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0)

  // Chequeo espejo del backend para no mandar un lote que va a rebotar entero.
  // El backend sigue siendo la autoridad; esto solo evita el viaje en falso.
  const celdasImposibles = useMemo(() => {
    if (signo === 1) return []
    return items
      .map((i) => {
        const v = variantes.find((x) => x.id === i.varianteId)
        return v && i.cantidad > v.stock ? v : null
      })
      .filter((v): v is ProductoVariante => v !== null)
  }, [items, signo, variantes])

  const hayProblemas = celdasImposibles.length > 0
  const puedeEnviar = items.length > 0 && !guardando && !hayProblemas

  // Estados de una celda, con la misma semántica de color que usa la tabla de stock:
  // rojo = imposible, ámbar = deja la variante bajo su mínimo, gris = neutro.
  const estadoDe = (variante: ProductoVariante): string => {
    const valor = celdas[variante.id]
    if (valor === undefined || valor === '') return ''
    if (signo === -1) {
      if (celdasImposibles.some((v) => v.id === variante.id)) {
        return 'border-red-300 bg-red-50 text-red-700'
      }
      if (variante.stock - Number(valor) < variante.stockMinimo) {
        return 'border-amber-300 bg-amber-50 text-amber-700'
      }
    }
    return 'border-gray-900 bg-gray-50'
  }

  const setCelda = (varianteId: number, valor: string) => {
    setError(null)
    setCeldas((prev) => {
      const next = { ...prev }
      if (valor === '') delete next[varianteId]
      else next[varianteId] = valor
      return next
    })
  }

  const limpiar = () => {
    setCeldas({})
    setMotivo('')
    setError(null)
  }

  const aplicar = async () => {
    if (!puedeEnviar) return
    setGuardando(true)
    setError(null)
    try {
      await ajustarStockLote({
        tipo: signo === 1 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO',
        motivo: motivo.trim() || undefined,
        items,
      })
      limpiar()
      onAplicado()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el stock')
    } finally {
      setGuardando(false)
    }
  }

  // --- Vista cerrada: una sola línea, para no competir con la tabla de variantes ---
  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex w-full items-center justify-between rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
      >
        <span className="text-xs font-medium text-gray-600">
          Cargar stock de varias variantes a la vez
        </span>
        <span className="text-xs text-gray-400">
          {variantes.length} {variantes.length === 1 ? 'variante' : 'variantes'} · grilla color × talla →
        </span>
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Cabecera */}
      <div className="flex items-start justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Carga de stock
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Escribí solo las celdas donde entró o salió mercadería.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          Cerrar
        </button>
      </div>

      <div className="px-4 py-3">
        {/* Signo + motivo compartido por todo el lote */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setSigno(1)
                setError(null)
              }}
              className={`rounded-md px-3 py-1.5 transition-all ${
                signo === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              + Ingreso
            </button>
            <button
              type="button"
              onClick={() => {
                setSigno(-1)
                setError(null)
              }}
              className={`rounded-md px-3 py-1.5 transition-all ${
                signo === -1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              − Egreso
            </button>
          </div>

          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={signo === 1 ? 'Motivo o remito (opcional)...' : 'Motivo del egreso (opcional)...'}
            className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
          />
        </div>

        {/* Grilla color × talla */}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-32 pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Color
                </th>
                {columnas.map((t) => (
                  <th
                    key={t.id}
                    className="px-1 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {t.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 align-middle">
              {filas.map(([clave, color]) => (
                <tr key={clave}>
                  <td className="py-1 pr-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate text-sm text-gray-700">{color.nombre}</span>
                    </span>
                  </td>
                  {columnas.map((t) => {
                    const variante = porFila.get(`${color.id ?? 'sin-color'}|${t.id}`)
                    if (!variante) {
                      return (
                        <td key={t.id} className="p-0.5">
                          <input
                            disabled
                            className={CELDA_VACIA}
                            value=""
                            readOnly
                            title="No existe esta combinación"
                          />
                        </td>
                      )
                    }
                    return (
                      <td key={t.id} className="p-0.5">
                        <input
                          type="number"
                          min={1}
                          value={celdas[variante.id] ?? ''}
                          onChange={(e) => setCelda(variante.id, e.target.value)}
                          placeholder={String(variante.stock)}
                          title={`Stock actual: ${variante.stock} · mín ${variante.stockMinimo}`}
                          className={`${CELDA} ${estadoDe(variante)}`}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-gray-400">
            El número gris de cada celda es el stock actual. Las celdas vacías no se tocan.
          </p>
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        {hayProblemas && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            No podés descontar más de lo que hay:{' '}
            {celdasImposibles.map((v) => `${v.color?.nombre}/${v.talla?.nombre} (hay ${v.stock})`).join(', ')}.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            {items.length === 0 ? (
              'Sin celdas cargadas'
            ) : (
              <>
                <span className="font-semibold text-gray-900">
                  {items.length} {items.length === 1 ? 'variante' : 'variantes'}
                </span>{' '}
                · {signo === 1 ? '+' : '−'}
                <span className="font-semibold tabular-nums text-gray-900">{totalUnidades} uds</span>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={limpiar}
              disabled={items.length === 0 || guardando}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={aplicar}
              disabled={!puedeEnviar}
              className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black disabled:opacity-40"
            >
              {guardando
                ? 'Guardando...'
                : items.length === 0
                  ? 'Cargar stock'
                  : `${signo === 1 ? 'Ingresar' : 'Descontar'} ${totalUnidades} uds`}
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only">Producto {producto.nombre}</p>
    </div>
  )
}