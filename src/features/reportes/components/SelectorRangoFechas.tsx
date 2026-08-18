interface SelectorRangoFechasProps {
  desde: string
  hasta: string
  atajoActivo: string | null
  onChange: (desde: string, hasta: string, atajo: string | null) => void
}

function toInputDate(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function inicioDelDia(fecha: Date): Date {
  const d = new Date(fecha)
  d.setHours(0, 0, 0, 0)
  return d
}

function hoy(): Date {
  return inicioDelDia(new Date())
}

function diasAtras(n: number): Date {
  const d = hoy()
  d.setDate(d.getDate() - n)
  return d
}

function inicioDelMes(): Date {
  const d = hoy()
  d.setDate(1)
  return d
}

function mesAnterior(): { desde: Date; hasta: Date } {
  const d = inicioDelMes()
  d.setMonth(d.getMonth() - 1)
  const hasta = new Date(d)
  hasta.setMonth(hasta.getMonth() + 1)
  hasta.setDate(0)
  return { desde: d, hasta }
}

const ATAJOS: { clave: string; label: string; desde: Date; hasta: Date }[] = [
  { clave: 'hoy', label: 'Hoy', desde: hoy(), hasta: hoy() },
  { clave: '7d', label: '7 días', desde: diasAtras(6), hasta: hoy() },
  { clave: '30d', label: '30 días', desde: diasAtras(29), hasta: hoy() },
  {
    clave: 'mes',
    label: 'Este mes',
    desde: inicioDelMes(),
    hasta: hoy(),
  },
  {
    clave: 'anterior',
    label: 'Mes anterior',
    desde: mesAnterior().desde,
    hasta: mesAnterior().hasta,
  },
]

export function SelectorRangoFechas({
  desde,
  hasta,
  atajoActivo,
  onChange,
}: SelectorRangoFechasProps) {
  function seleccionarAtajo(atajo: (typeof ATAJOS)[number]) {
    onChange(toInputDate(atajo.desde), toInputDate(atajo.hasta), atajo.clave)
  }

  function cambiarFecha(campo: 'desde' | 'hasta', valor: string) {
    const nuevoDesde = campo === 'desde' ? valor : desde
    const nuevoHasta = campo === 'hasta' ? valor : hasta
    onChange(nuevoDesde, nuevoHasta, null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ATAJOS.map((atajo) => (
        <button
          key={atajo.clave}
          onClick={() => seleccionarAtajo(atajo)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            atajoActivo === atajo.clave
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {atajo.label}
        </button>
      ))}

      <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-2">
        <input
          type="date"
          value={desde}
          onChange={(e) => cambiarFecha('desde', e.target.value)}
          className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
        />
        <span className="text-xs text-gray-400">a</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => cambiarFecha('hasta', e.target.value)}
          className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
        />
      </div>
    </div>
  )
}
