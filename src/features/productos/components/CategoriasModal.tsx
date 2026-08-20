import { useEffect, useState, type FormEvent } from 'react'
import {
  activarCategoria,
  actualizarCategoria,
  crearCategoria,
  desactivarCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../../../api/catalogos.api'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
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

  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')

  const [toggleCat, setToggleCat] = useState<Categoria | null>(null)
  const [eliminarCat, setEliminarCat] = useState<Categoria | null>(null)

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

  useEffect(() => {
    if (!exito) return
    const t = setTimeout(() => setExito(null), 3000)
    return () => clearTimeout(t)
  }, [exito])

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
      await crearCategoria({ nombre: nuevoNombre, descripcion: nuevaDescripcion })
      setNuevoNombre('')
      setNuevaDescripcion('')
      setExito('Categoría creada.')
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
      await actualizarCategoria(id, { nombre: editNombre, descripcion: editDescripcion })
      cancelarEdicion()
      setExito('Categoría actualizada.')
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al actualizar.'
      setError(msg || 'Error al actualizar.')
    } finally {
      setGuardando(false)
    }
  }

  const handleToggleActivo = (cat: Categoria) => {
    setToggleCat(cat)
  }

  const confirmarToggle = async () => {
    if (!toggleCat) return
    const cat = toggleCat
    const activa = cat.activo !== false
    try {
      setError(null)
      if (activa) {
        await desactivarCategoria(cat.id)
      } else {
        await activarCategoria(cat.id)
      }
      setExito(activa ? `"${cat.nombre}" desactivada.` : `"${cat.nombre}" activada.`)
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error al cambiar estado.'
      setError(msg || 'Error al cambiar estado.')
    } finally {
      setToggleCat(null)
    }
  }

  const handleEliminar = (cat: Categoria) => {
    setEliminarCat(cat)
  }

  const confirmarEliminar = async () => {
    if (!eliminarCat) return
    const cat = eliminarCat
    try {
      setError(null)
      await eliminarCategoria(cat.id)
      setExito(`"${cat.nombre}" eliminada.`)
      await cargar()
      onActualizado?.()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'No se pudo eliminar.'
      setError(msg || 'No se pudo eliminar.')
    } finally {
      setEliminarCat(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Categorías</h2>
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

          <form onSubmit={handleCrear} className="mb-4 flex gap-2">
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre"
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
            <input
              type="text"
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
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
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Categoría</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Descripción</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">Cargando...</td>
                  </tr>
                ) : categorias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No hay categorías.</td>
                  </tr>
                ) : (
                  categorias.map((cat) => {
                    const estaEditando = editandoId === cat.id
                    const esActiva = cat.activo !== false

                    return (
                      <tr
                        key={cat.id}
                        className={!esActiva ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'}
                      >
                        {estaEditando ? (
                          <>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={editNombre}
                                onChange={(e) => setEditNombre(e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={editDescripcion}
                                onChange={(e) => setEditDescripcion(e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleActivo(cat)}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${esActiva ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              >
                                {esActiva ? 'Activa' : 'Inactiva'}
                              </button>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleGuardarEdicion(cat.id)}
                                  disabled={guardando}
                                  className="rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelarEdicion}
                                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{cat.nombre}</td>
                            <td className="px-4 py-2.5 text-sm text-gray-500">
                              {cat.descripcion || <span className="text-gray-400">—</span>}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleActivo(cat)}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${esActiva ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              >
                                {esActiva ? 'Activa' : 'Inactiva'}
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => iniciarEdicion(cat)}
                                  className="text-xs font-medium text-gray-700 hover:text-gray-900"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEliminar(cat)}
                                  className="text-xs font-medium text-red-600 hover:text-red-800"
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
        abierto={toggleCat !== null}
        titulo={toggleCat?.activo !== false ? 'Desactivar categoría' : 'Activar categoría'}
        mensaje={
          toggleCat
            ? toggleCat.activo !== false
              ? `¿Desactivar "${toggleCat.nombre}"?`
              : `¿Activar "${toggleCat.nombre}"?`
            : ''
        }
        textoAccion={toggleCat?.activo !== false ? 'Desactivar' : 'Activar'}
        onConfirmar={confirmarToggle}
        onCancelar={() => setToggleCat(null)}
      />
      <ConfirmModal
        abierto={eliminarCat !== null}
        titulo="Eliminar categoría"
        mensaje={
          eliminarCat
            ? `¿Eliminar "${eliminarCat.nombre}"? Si tiene productos asignados no se podrá borrar.`
            : ''
        }
        textoAccion="Eliminar"
        variant="danger"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setEliminarCat(null)}
      />
    </div>
  )
}
