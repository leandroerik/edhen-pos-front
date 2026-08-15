import { useEffect, useState, type FormEvent } from 'react'
import {
  activarCategoria,
  actualizarCategoria,
  crearCategoria,
  desactivarCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../../../api/catalogos.api'
import type { Categoria } from '../../../types/categoria'

interface CategoriasModalProps {
  abierto: boolean
  onCerrar: () => void
  onActualizado?: () => void
}

export function CategoriasModal({ abierto, onCerrar, onActualizado }: CategoriasModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)

  // Formulario nueva categoría
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Edición en línea
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')

  const cargar = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await listarCategorias()
      setCategorias(data)
    } catch {
      setError('No se pudieron cargar las categorías.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (abierto) {
      cargar()
      setError(null)
      setExito(null)
    }
  }, [abierto])

  if (!abierto) return null

  const handleCrear = async (e: FormEvent) => {
    e.preventDefault()
    if (!nuevoNombre.trim()) {
      setError('El nombre de la categoría no puede estar vacío.')
      return
    }
    try {
      setGuardando(true)
      setError(null)
      await crearCategoria({
        nombre: nuevoNombre,
        descripcion: nuevaDescripcion,
      })
      setNuevoNombre('')
      setNuevaDescripcion('')
      setExito('Categoría agregada exitosamente.')
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al crear la categoría.'
      setError(msg || 'Error al crear la categoría.')
    } finally {
      setGuardando(false)
    }
  }

  const iniciarEdicion = (cat: Categoria) => {
    setEditandoId(cat.id)
    setEditNombre(cat.nombre)
    setEditDescripcion(cat.descripcion ?? '')
    setError(null)
    setExito(null)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditNombre('')
    setEditDescripcion('')
  }

  const handleGuardarEdicion = async (id: number) => {
    if (!editNombre.trim()) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }
    try {
      setGuardando(true)
      setError(null)
      await actualizarCategoria(id, {
        nombre: editNombre,
        descripcion: editDescripcion,
      })
      cancelarEdicion()
      setExito('Categoría modificada con éxito.')
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al actualizar la categoría.'
      setError(msg || 'Error al actualizar la categoría.')
    } finally {
      setGuardando(false)
    }
  }

  const handleToggleActivo = async (cat: Categoria) => {
    try {
      setError(null)
      if (cat.activo === false) {
        await activarCategoria(cat.id)
        setExito(`Categoría "${cat.nombre}" activada.`)
      } else {
        await desactivarCategoria(cat.id)
        setExito(`Categoría "${cat.nombre}" desactivada.`)
      }
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al cambiar estado de la categoría.'
      setError(msg || 'Error al cambiar estado.')
    }
  }

  const handleEliminar = async (cat: Categoria) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar la categoría "${cat.nombre}"? Si tiene productos asignados, no se podrá borrar.`,
    )
    if (!confirmar) return

    try {
      setError(null)
      await eliminarCategoria(cat.id)
      setExito(`Categoría "${cat.nombre}" eliminada.`)
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'No se puede eliminar la categoría.'
      setError(msg || 'No se pudo eliminar la categoría.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestión de Categorías</h2>
            <p className="text-xs text-gray-500">
              Crea nuevas categorías, edita sus nombres o activa/desactiva las que no uses.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          {/* Mensajes de Feedback */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {exito && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              {exito}
            </div>
          )}

          {/* Formulario de Alta */}
          <form
            onSubmit={handleCrear}
            className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-700">
              + Agregar Nueva Categoría
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Blusas, Poleras..."
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="Detalle o uso (opcional)"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end sm:col-span-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </form>

          {/* Listado de Categorías */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left">Categoría</th>
                  <th className="px-4 py-2.5 text-left">Descripción</th>
                  <th className="px-4 py-2.5 text-center">Estado</th>
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      Cargando categorías...
                    </td>
                  </tr>
                ) : categorias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No hay categorías registradas.
                    </td>
                  </tr>
                ) : (
                  categorias.map((cat) => {
                    const estaEditando = editandoId === cat.id
                    const esActiva = cat.activo !== false

                    return (
                      <tr
                        key={cat.id}
                        className={!esActiva ? 'bg-gray-50/70 text-gray-400' : 'hover:bg-gray-50'}
                      >
                        {estaEditando ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={editNombre}
                                onChange={(e) => setEditNombre(e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={editDescripcion}
                                onChange={(e) => setEditDescripcion(e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  esActiva ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {esActiva ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleGuardarEdicion(cat.id)}
                                  disabled={guardando}
                                  className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelarEdicion}
                                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {cat.nombre}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {cat.descripcion || <span className="text-gray-400 italic">—</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  esActiva ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {esActiva ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => iniciarEdicion(cat)}
                                  className="text-xs font-medium text-indigo-600 hover:text-indigo-900"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleActivo(cat)}
                                  className={`text-xs font-medium ${
                                    esActiva
                                      ? 'text-amber-600 hover:text-amber-800'
                                      : 'text-emerald-600 hover:text-emerald-800'
                                  }`}
                                >
                                  {esActiva ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEliminar(cat)}
                                  className="text-xs font-medium text-red-600 hover:text-red-900"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
