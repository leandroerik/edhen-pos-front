import { useEffect, useState } from 'react'
import { guardarConfiguracion, obtenerConfiguracion } from '../../../api/admin.api'

const CAMPOS = [
  { clave: 'nombreTienda', label: 'Nombre de la tienda', placeholder: 'edhen' },
  { clave: 'direccion', label: 'Dirección', placeholder: 'Calle 123, Ciudad' },
  { clave: 'telefono', label: 'Teléfono', placeholder: '+54 9 11 1234-5678' },
  { clave: 'email', label: 'Email', placeholder: 'contacto@tienda.com' },
  { clave: 'cuit', label: 'CUIT', placeholder: '20-12345678-9' },
  { clave: 'horario', label: 'Horario de atención', placeholder: 'Lun a Sáb de 9 a 19 hs' },
] as const

export function DatosTiendaTab() {
  const [valores, setValores] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  useEffect(() => {
    let cancelado = false
    obtenerConfiguracion()
      .then((config) => {
        if (cancelado) return
        const iniciales: Record<string, string> = {}
        for (const campo of CAMPOS) {
          iniciales[campo.clave] = config[campo.clave] ?? ''
        }
        setValores(iniciales)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  function cambiar(clave: string, valor: string) {
    setValores((v) => ({ ...v, [clave]: valor }))
    setGuardadoOk(false)
  }

  async function guardar() {
    setGuardando(true)
    try {
      await guardarConfiguracion(valores)
      setGuardadoOk(true)
    } catch {
      // silencioso
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Datos de la tienda</h2>
        <p className="text-sm text-gray-500">
          Información que se usa en comprobantes y etiquetas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
        {CAMPOS.map((campo) => (
          <div key={campo.clave} className={campo.clave === 'direccion' ? 'sm:col-span-2' : ''}>
            <label
              htmlFor={`datos-${campo.clave}`}
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              {campo.label}
            </label>
            <input
              id={`datos-${campo.clave}`}
              type="text"
              value={valores[campo.clave] ?? ''}
              placeholder={campo.placeholder}
              onChange={(e) => cambiar(campo.clave, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        {guardadoOk && <span className="text-sm text-green-600">Guardado ✓</span>}
        <button
          onClick={() => void guardar()}
          disabled={guardando}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
