import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useColaEtiquetas } from '../../features/productos/context/useColaEtiquetas'
import { apiClient } from '../../api/client'

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/stock', label: 'Stock' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/envios', label: 'Envíos' },
  { to: '/reportes', label: 'Reportes' },
]

export function Sidebar() {
  const { totalEtiquetas } = useColaEtiquetas()
  const [respaldando, setRespaldando] = useState(false)

  function cerrarApp() {
    apiClient.post('/api/admin/shutdown').catch(() => {})
  }

  async function hacerBackup() {
    setRespaldando(true)
    try {
      const { data } = await apiClient.post<{ archivo: string }>('/api/admin/backup')
      const url = `${import.meta.env.VITE_API_URL}/api/admin/backup/descargar/${data.archivo}`
      const a = document.createElement('a')
      a.href = url
      a.download = data.archivo
      a.click()
    } catch {
    } finally {
      setRespaldando(false)
    }
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white print:hidden">
      <Link to="/" className="px-4 py-5">
        <img src="/logo.png" alt="edhen" className="h-6 w-auto" />
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/etiquetas"
          className={({ isActive }) =>
            `flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              Etiquetas
              {totalEtiquetas > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {totalEtiquetas}
                </span>
              )}
            </>
          )}
        </NavLink>
      </nav>
      <div className="flex flex-col gap-1 px-2 pb-3">
        <button
          onClick={hacerBackup}
          disabled={respaldando}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
        >
          {respaldando ? 'Respaldando...' : 'Backup'}
        </button>
        <button
          onClick={cerrarApp}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Cerrar App
        </button>
      </div>
    </aside>
  )
}
