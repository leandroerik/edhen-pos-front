interface EmptyStateProps {
  mensaje: string
}

export function EmptyState({ mensaje }: EmptyStateProps) {
  return (
    <p className="py-6 text-center text-sm text-gray-400">{mensaje}</p>
  )
}
