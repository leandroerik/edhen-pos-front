import { useState } from 'react'
import { BackupsTab } from './components/BackupsTab'
import { DatosTiendaTab } from './components/DatosTiendaTab'
import { ImportarTab } from './components/ImportarTab'

type Tab = 'backups' | 'importar' | 'datos'

const TABS: { clave: Tab; label: string }[] = [
  { clave: 'backups', label: 'Backups' },
  { clave: 'importar', label: 'Importar datos' },
  { clave: 'datos', label: 'Datos de la tienda' },
]

export function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('backups')

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-0.5">
        {TABS.map((t) => (
          <button
            key={t.clave}
            onClick={() => setTab(t.clave)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.clave
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="mt-6">
        {tab === 'backups' && <BackupsTab />}
        {tab === 'importar' && <ImportarTab />}
        {tab === 'datos' && <DatosTiendaTab />}
      </div>
    </div>
  )
}
