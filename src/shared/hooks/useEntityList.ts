import { useCallback, useEffect, useState } from 'react'

interface UseEntityListOptions<T, F> {
  fetcher: (filtro: F) => Promise<T[]>
  filtro: F
  errorMsg?: string
}

export function useEntityList<T, F>({ fetcher, filtro, errorMsg = 'No se pudieron cargar los datos' }: UseEntityListOptions<T, F>) {
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<{ clave: string; data: T[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clave = JSON.stringify({ ...filtro, reloadToken })

  useEffect(() => {
    let cancelado = false
    fetcher(filtro)
      .then((data) => {
        if (cancelado) return
        setResultado({ clave, data })
        setError(null)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : errorMsg)
      })
    return () => { cancelado = true }
  }, [fetcher, filtro, reloadToken, clave, errorMsg])

  const cargando = resultado?.clave !== clave
  const items = resultado?.clave === clave ? resultado.data : []

  const recargar = useCallback(() => setReloadToken((v) => v + 1), [])

  return { items, cargando, error, recargar }
}
