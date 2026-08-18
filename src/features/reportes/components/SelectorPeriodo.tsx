function toInputDate(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export { toInputDate }

interface SelectorPeriodoProps {
  label: string
  desde: string
  hasta: string
  atajoActivo: string | null
  atajos: { clave: string; label: string; desde: Date; hasta: Date }[]
  onChange: (desde: string, hasta: string, atajo: string | null) => void
}

export function SelectorPeriodo({
  label,
  desde,
  hasta,
  atajoActivo,
  atajos,
  onChange,
}: SelectorPeriodoProps) {
  function seleccionarAtajo(atajo: (typeof atajos)[number]) {
    onChange(toInputDate(atajo.desde), toInputDate(atajo.hasta), atajo.clave)
  }

  function cambiarFecha(campo: 'desde' | 'hasta', valor: string) {
    const nuevoDesde = campo === 'desde' ? valor : desde
    const nuevoHasta = campo === 'hasta' ? valor : hasta
    onChange(nuevoDesde, nuevoHasta, null)
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {atajos.map((atajo) => (
          <button
            key={atajo.clave}
            onClick={() => seleccionarAtajo(atajo)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              atajoActivo === atajo.clave
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {atajo.label}
          </button>
        ))}
        <div className="ml-1 flex items-center gap-1.5 border-l border-gray-200 pl-1.5">
          <input
            type="date"
            value={desde}
            onChange={(e) => cambiarFecha('desde', e.target.value)}
            className="rounded-md border border-gray-200 px-1.5 py-1 text-[11px] text-gray-700 focus:border-gray-400 focus:outline-none"
          />
          <span className="text-[11px] text-gray-400">a</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => cambiarFecha('hasta', e.target.value)}
            className="rounded-md border border-gray-200 px-1.5 py-1 text-[11px] text-gray-700 focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
