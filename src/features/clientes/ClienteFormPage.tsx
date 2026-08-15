import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { crearCliente, editarCliente, obtenerCliente, type ClienteInput } from '../../api/clientes.api'
import { DireccionesCliente } from './components/DireccionesCliente'
import type { TipoCliente } from '../../types/cliente'

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const esEdicion = id !== undefined

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [tipo, setTipo] = useState<TipoCliente>('MINORISTA')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [dni, setDni] = useState('')

  const [cargando, setCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!esEdicion) return
    let cancelado = false
    obtenerCliente(Number(id)).then((cliente) => {
      if (cancelado || !cliente) return
      setNombre(cliente.nombre)
      setApellido(cliente.apellido)
      setTipo(cliente.tipo)
      setTelefono(cliente.telefono)
      setEmail(cliente.email ?? '')
      setDni(cliente.dni ?? '')
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [esEdicion, id])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const input: ClienteInput = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      tipo,
      telefono: telefono.trim(),
      email: email.trim() || undefined,
      dni: dni.trim() || undefined,
    }

    if (!input.nombre || !input.telefono) {
      setError('Completá al menos nombre y teléfono.')
      return
    }

    setGuardando(true)
    try {
      if (esEdicion) {
        await editarCliente(Number(id), input)
      } else {
        await crearCliente(input)
      }
      navigate('/clientes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cliente')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <p className="text-sm text-gray-500">Cargando...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
          <label className="text-sm text-gray-700">
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
          </label>

          <label className="text-sm text-gray-700">
            Apellido / Razón social
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-700">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCliente)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="MINORISTA">Minorista</option>
              <option value="MAYORISTA">Mayorista</option>
              <option value="OTRO">Otro</option>
            </select>
          </label>

          <label className="text-sm text-gray-700">
            Teléfono
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Clave para buscar por WhatsApp"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
          </label>

          <label className="text-sm text-gray-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="opcional"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-700">
            DNI / CUIT
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="necesario para factura A"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>

      {esEdicion && (
        <div className="mt-4 max-w-xl">
          <DireccionesCliente clienteId={Number(id)} />
        </div>
      )}
    </div>
  )
}
