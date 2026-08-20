import { useEffect, useRef } from 'react'

type Variant = 'danger' | 'warning' | 'default'

interface ConfirmModalProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoAccion?: string
  variant?: Variant
  cargando?: boolean
  onConfirmar: () => void | Promise<void>
  onCancelar: () => void
}

const VARIANT_STYLES: Record<Variant, string> = {
  danger: 'bg-red-600 hover:bg-red-700',
  warning: 'bg-amber-600 hover:bg-amber-700',
  default: 'bg-gray-900 hover:bg-gray-800',
}

export function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  textoAccion = 'Confirmar',
  variant = 'default',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) {
  const cancelarBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (abierto) cancelarBtnRef.current?.focus()
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onCancelar}>
      <div
        className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
        <p className="mt-2 text-sm text-gray-600">{mensaje}</p>

        <div className="mt-4 flex gap-2">
          <button
            ref={cancelarBtnRef}
            type="button"
            onClick={onCancelar}
            disabled={cargando}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void onConfirmar()}
            disabled={cargando}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_STYLES[variant]}`}
          >
            {cargando ? 'Procesando...' : textoAccion}
          </button>
        </div>
      </div>
    </div>
  )
}
