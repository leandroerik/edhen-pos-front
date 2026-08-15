import { Link, NavLink } from 'react-router-dom'
import { useColaEtiquetas } from '../../features/productos/context/useColaEtiquetas'

const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/stock', label: 'Stock' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/envios', label: 'Envíos' },
]

export function Sidebar() {
  const { totalEtiquetas } = useColaEtiquetas()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white print:hidden">
      <Link to="/" className="px-4 py-5">
        <img src="/logo.png" alt="edhen" className="h-6 w-auto" />
      </Link>
      <nav className="flex flex-col gap-1 px-2">
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
    </aside>
  )
}
