interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

/**
 * Fila de carga para tablas: reemplaza el "Cargando..." en texto plano por
 * barras pulsantes que imitan el ritmo de las filas reales. Va dentro de un
 * <tbody> y ocupa todas las columnas via colSpan.
 */
export function SkeletonRow({ colSpan, rows = 5 }: { colSpan: number; rows?: number }) {
  const anchos = ['92%', '78%', '86%', '70%', '88%', '74%']
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-3" role="status">
        <span className="sr-only">Cargando...</span>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-3.5 animate-pulse rounded bg-gray-200"
              style={{ width: anchos[i % anchos.length] }}
            />
          ))}
        </div>
      </td>
    </tr>
  )
}

/** Carga de pagina completa (detalle, formularios): titulo + lineas + bloques. */
export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status">
      <span className="sr-only">Cargando...</span>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
