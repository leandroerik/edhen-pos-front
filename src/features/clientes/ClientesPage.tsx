import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { useClientes } from './hooks/useClientes'
import type { TipoCliente } from '../../types/cliente'

const NOMBRE_TIPO: Record<TipoCliente, string> = {
  MAYORISTA: 'Mayorista',
  MINORISTA: 'Minorista',
  OTRO: 'Otro',
}

type FiltroEstado = 'todos' | 'activos' | 'inactivos'

export function ClientesPage() {
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<TipoCliente | 'todos'>('todos')
  const [estado, setEstado] = useState<FiltroEstado>('activos')
  const [clienteAEliminar, setClienteAEliminar] = useState<number | null>(null)

  const filtro = useMemo(
    () => ({
      texto: texto || undefined,
      tipo: tipo === 'todos' ? undefined : tipo,
      activo: estado === 'todos' ? undefined : estado === 'activos',
    }),
    [texto, tipo, estado],
  )

  const { clientes, cargando, error, darDeBaja, reactivar } = useClientes(filtro)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
        <Link
          to="/clientes/nuevo"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Nuevo cliente
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoCliente | 'todos')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="todos">Todos los tipos</option>
          <option value="MAYORISTA">Mayorista</option>
          <option value="MINORISTA">Minorista</option>
          <option value="OTRO">Otro</option>
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as FiltroEstado)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!cargando && clientes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
            {!cargando &&
              clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{NOMBRE_TIPO[cliente.tipo]}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cliente.telefono}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cliente.email || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cliente.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/clientes/${cliente.id}/editar`}
                        className="font-medium text-gray-700 hover:text-gray-900"
                      >
                        Editar
                      </Link>
                      {cliente.activo ? (
                        <button
                          type="button"
                          onClick={() => setClienteAEliminar(cliente.id)}
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Dar de baja
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => reactivar(cliente.id)}
                          className="font-medium text-green-700 hover:text-green-900"
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        abierto={clienteAEliminar !== null}
        titulo="Dar de baja cliente"
        mensaje="¿Seguro que querés dar de baja este cliente? Se marcará como inactivo."
        textoAccion="Dar de baja"
        variant="danger"
        onConfirmar={async () => {
          if (clienteAEliminar !== null) {
            await darDeBaja(clienteAEliminar)
            setClienteAEliminar(null)
          }
        }}
        onCancelar={() => setClienteAEliminar(null)}
      />
    </div>
  )
}
