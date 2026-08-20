import { useEffect, useState } from 'react'
import {
  crearDireccion,
  editarDireccion,
  eliminarDireccion,
  listarDirecciones,
  type DireccionInput,
} from '../../../api/clientes.api'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import type { Direccion } from '../../../types/direccion'

interface DireccionesClienteProps {
  clienteId: number
}

const FORM_VACIO: DireccionInput = {
  direccion: '',
  localidad: '',
  provincia: '',
  codigoPostal: '',
  observaciones: '',
  esPrincipal: false,
}

export function DireccionesCliente({ clienteId }: DireccionesClienteProps) {
  const [direcciones, setDirecciones] = useState<Direccion[] | null>(null)
  const [formAbierto, setFormAbierto] = useState<'nueva' | number | null>(null)
  const [form, setForm] = useState<DireccionInput>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [direccionAEliminar, setDireccionAEliminar] = useState<number | null>(null)

  const cargar = () => {
    listarDirecciones(clienteId).then(setDirecciones)
  }

  useEffect(() => {
    let cancelado = false
    listarDirecciones(clienteId).then((datos) => {
      if (!cancelado) setDirecciones(datos)
    })
    return () => {
      cancelado = true
    }
  }, [clienteId])

  const abrirNueva = () => {
    setForm(FORM_VACIO)
    setError(null)
    setFormAbierto('nueva')
  }

  const abrirEditar = (direccion: Direccion) => {
    setForm({
      direccion: direccion.direccion,
      localidad: direccion.localidad,
      provincia: direccion.provincia,
      codigoPostal: direccion.codigoPostal,
      observaciones: direccion.observaciones ?? '',
      esPrincipal: direccion.esPrincipal,
    })
    setError(null)
    setFormAbierto(direccion.id)
  }

  const cancelar = () => {
    setFormAbierto(null)
    setError(null)
  }

  const guardar = async () => {
    if (!form.direccion.trim() || !form.localidad.trim()) {
      setError('Completá al menos calle y localidad.')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const input: DireccionInput = {
        ...form,
        direccion: form.direccion.trim(),
        localidad: form.localidad.trim(),
        provincia: form.provincia.trim(),
        codigoPostal: form.codigoPostal.trim(),
        observaciones: form.observaciones?.trim() || undefined,
      }
      if (formAbierto === 'nueva') {
        await crearDireccion(clienteId, input)
      } else if (formAbierto !== null) {
        await editarDireccion(formAbierto, input)
      }
      setFormAbierto(null)
      cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la dirección')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (id: number) => {
    await eliminarDireccion(id)
    cargar()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Direcciones</h2>
        {formAbierto === null && (
          <button
            type="button"
            onClick={abrirNueva}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            + Agregar dirección
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-400">
        Se guardan acá listas para cuando exista el módulo de Envíos — todavía no hay seguimiento de
        envío en sí, solo el dato de contacto.
      </p>

      {direcciones === null && <p className="mt-3 text-sm text-gray-500">Cargando...</p>}

      {direcciones !== null && direcciones.length === 0 && formAbierto === null && (
        <p className="mt-3 text-sm text-gray-500">Todavía no hay direcciones cargadas.</p>
      )}

      {direcciones !== null && direcciones.length > 0 && (
        <div className="mt-3 space-y-2">
          {direcciones.map((d) => (
            <div key={d.id} className="rounded-md border border-gray-200 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-gray-900">
                    {d.direccion}
                    {d.esPrincipal && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Principal
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {d.localidad}, {d.provincia} {d.codigoPostal && `(${d.codigoPostal})`}
                  </p>
                  {d.observaciones && <p className="mt-1 text-xs text-gray-400">{d.observaciones}</p>}
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => abrirEditar(d)}
                    className="font-medium text-gray-700 hover:text-gray-900"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDireccionAEliminar(d.id)}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formAbierto !== null && (
        <div className="mt-3 rounded-md border border-gray-200 p-3">
          {error && <p className="mb-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-700">{error}</p>}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs text-gray-500 sm:col-span-2">
              Calle y número
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Localidad
              <input
                type="text"
                value={form.localidad}
                onChange={(e) => setForm({ ...form, localidad: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Provincia
              <input
                type="text"
                value={form.provincia}
                onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Código postal
              <input
                type="text"
                value={form.codigoPostal}
                onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Observaciones
              <input
                type="text"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder='ej. "timbre roto, golpear"'
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </label>
          </div>

          <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={form.esPrincipal}
              onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })}
            />
            Marcar como dirección principal
          </label>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar dirección'}
            </button>
            <button
              type="button"
              onClick={cancelar}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        abierto={direccionAEliminar !== null}
        titulo="Eliminar dirección"
        mensaje="¿Seguro que querés eliminar esta dirección? Esta acción no se puede deshacer."
        textoAccion="Eliminar"
        variant="danger"
        onConfirmar={async () => {
          if (direccionAEliminar !== null) {
            await eliminar(direccionAEliminar)
            setDireccionAEliminar(null)
          }
        }}
        onCancelar={() => setDireccionAEliminar(null)}
      />
    </div>
  )
}
