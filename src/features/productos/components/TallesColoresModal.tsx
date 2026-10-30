import { useEffect, useState, type FormEvent } from 'react'
import {
  crearColor,
  crearTalla,
  eliminarColor,
  eliminarTalla,
  listarColores,
  listarTallas,
} from '../../../api/catalogos.api'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { SkeletonRow } from '../../../shared/components/Skeleton'
import { ordenarTallas } from '../../../shared/tallas'
import type { Color } from '../../../types/color'
import type { Talla, TallaTipo } from '../../../types/talla'

const TIPOS_TALLA: { valor: TallaTipo; label: string }[] = [
  { valor: 'ROPA', label: 'Ropa' },
  { valor: 'CALZADO', label: 'Calzado' },
]

type Tab = 'talles' | 'colores'

interface TallesColoresModalProps {
  abierto: boolean
  onCerrar: () => void
  onActualizado?: () => void
}

export function TallesColoresModal({ abierto, onCerrar, onActualizado }: TallesColoresModalProps) {
  const [tab, setTab] = useState<Tab>('talles')
  const [tallas, setTallas] = useState<Talla[]>([])
  const [colores, setColores] = useState<Color[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const [nuevoTalle, setNuevoTalle] = useState('')
  const [nuevoTalleTipo, setNuevoTalleTipo] = useState<TallaTipo>('ROPA')
  const [nuevoColor, setNuevoColor] = useState('')
  const [nuevoColorHex, setNuevoColorHex] = useState('#000000')

  const [eliminarTalleCat, setEliminarTalleCat] = useState<Talla | null>(null)
  const [eliminarColorCat, setEliminarColorCat] = useState<Color | null>(null)

  const cargar = async () => {
    try {
      setCargando(true)
      setError(null)
      const [t, c] = await Promise.all([listarTallas(), listarColores()])
      setTallas(t)
      setColores(c)
    } catch {
      setError('No se pudieron cargar los talles y colores.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!abierto) return
    let cancelado = false
    Promise.all([listarTallas(), listarColores()])
      .then(([t, c]) => {
        if (cancelado) return
        setTab('talles')
        setError(null)
        setExito(null)
        setTallas(t)
        setColores(c)
        setCargando(false)
      })
      .catch(() => {
        if (cancelado) return
        setError('No se pudieron cargar los talles y colores.')
        setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [abierto])

  useEffect(() => {
    if (!exito) return
    const t = setTimeout(() => setExito(null), 3000)
    return () => clearTimeout(t)
  }, [exito])

  if (!abierto) return null

  const manejarError = (err: unknown, fallback: string) => {
    setError(err instanceof Error ? err.message : fallback)
  }

  const handleCrearTalle = async (e: FormEvent) => {
    e.preventDefault()
    if (!nuevoTalle.trim()) {
      setError('El nombre del talle no puede estar vacío.')
      return
    }
    try {
      setGuardando(true)
      setError(null)
      await crearTalla({ nombre: nuevoTalle, tipo: nuevoTalleTipo })
      setNuevoTalle('')
      setExito('Talle creado.')
      await cargar()
      onActualizado?.()
    } catch (err) {
      manejarError(err, 'Error al crear el talle.')
    } finally {
      setGuardando(false)
    }
  }

  const handleCrearColor = async (e: FormEvent) => {
    e.preventDefault()
    if (!nuevoColor.trim()) {
      setError('El nombre del color no puede estar vacío.')
      return
    }
    try {
      setGuardando(true)
      setError(null)
      await crearColor({ nombre: nuevoColor, codigoHex: nuevoColorHex })
      setNuevoColor('')
      setNuevoColorHex('#000000')
      setExito('Color creado.')
      await cargar()
      onActualizado?.()
    } catch (err) {
      manejarError(err, 'Error al crear el color.')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminarTalle = async () => {
    if (!eliminarTalleCat) return
    const talle = eliminarTalleCat
    try {
      setError(null)
      await eliminarTalla(talle.id)
      setExito(`Talle "${talle.nombre}" eliminado.`)
      await cargar()
      onActualizado?.()
    } catch (err) {
      manejarError(err, 'No se pudo eliminar el talle.')
    } finally {
      setEliminarTalleCat(null)
    }
  }

  const confirmarEliminarColor = async () => {
    if (!eliminarColorCat) return
    const color = eliminarColorCat
    try {
      setError(null)
      await eliminarColor(color.id)
      setExito(`Color "${color.nombre}" eliminado.`)
      await cargar()
      onActualizado?.()
    } catch (err) {
      manejarError(err, 'No se pudo eliminar el color.')
    } finally {
      setEliminarColorCat(null)
    }
  }

  const tallasOrdenadas = ordenarTallas(tallas)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Talles y colores</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {exito && (
            <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{exito}</div>
          )}

          <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-0.5">
            {([
              ['talles', 'Talles'],
              ['colores', 'Colores'],
            ] as const).map(([clave, label]) => (
              <button
                key={clave}
                type="button"
                onClick={() => {
                  setTab(clave)
                  setError(null)
                }}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === clave ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'talles' ? (
            <>
              <form onSubmit={handleCrearTalle} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={nuevoTalle}
                  onChange={(e) => setNuevoTalle(e.target.value)}
                  placeholder="Talle (ej. 44, XXXL)"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
                <select
                  value={nuevoTalleTipo}
                  onChange={(e) => setNuevoTalleTipo(e.target.value as TallaTipo)}
                  className="shrink-0 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                >
                  {TIPOS_TALLA.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={guardando}
                  className="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {guardando ? '...' : 'Agregar'}
                </button>
              </form>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Talle</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cargando ? (
                      <SkeletonRow colSpan={3} rows={4} />
                    ) : tallasOrdenadas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">No hay talles.</td>
                      </tr>
                    ) : (
                      tallasOrdenadas.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{t.nombre}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">
                            {TIPOS_TALLA.find((x) => x.valor === t.tipo)?.label ?? t.tipo}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setEliminarTalleCat(t)}
                              className="text-xs font-medium text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleCrearColor} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={nuevoColor}
                  onChange={(e) => setNuevoColor(e.target.value)}
                  placeholder="Color (ej. Rojo)"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
                <input
                  type="color"
                  value={nuevoColorHex}
                  onChange={(e) => setNuevoColorHex(e.target.value)}
                  title="Color"
                  className="h-9 w-12 shrink-0 rounded-md border border-gray-300"
                />
                <button
                  type="submit"
                  disabled={guardando}
                  className="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {guardando ? '...' : 'Agregar'}
                </button>
              </form>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Color</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cargando ? (
                      <SkeletonRow colSpan={2} rows={4} />
                    ) : colores.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-sm text-gray-500">No hay colores.</td>
                      </tr>
                    ) : (
                      colores.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full border border-gray-300"
                                style={{ backgroundColor: c.codigoHex }}
                              />
                              {c.nombre}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => setEliminarColorCat(c)}
                              className="text-xs font-medium text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      <ConfirmModal
        abierto={eliminarTalleCat !== null}
        titulo="Eliminar talle"
        mensaje={
          eliminarTalleCat
            ? `¿Eliminar el talle "${eliminarTalleCat.nombre}"? Si está en uso en alguna variante no se podrá borrar.`
            : ''
        }
        textoAccion="Eliminar"
        variant="danger"
        onConfirmar={confirmarEliminarTalle}
        onCancelar={() => setEliminarTalleCat(null)}
      />
      <ConfirmModal
        abierto={eliminarColorCat !== null}
        titulo="Eliminar color"
        mensaje={
          eliminarColorCat
            ? `¿Eliminar el color "${eliminarColorCat.nombre}"? Si está en uso en alguna variante no se podrá borrar.`
            : ''
        }
        textoAccion="Eliminar"
        variant="danger"
        onConfirmar={confirmarEliminarColor}
        onCancelar={() => setEliminarColorCat(null)}
      />
    </div>
  )
}
