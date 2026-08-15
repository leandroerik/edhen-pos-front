import { useCallback, useEffect, useState } from 'react'
import {
  eliminarProducto,
  listarProductos,
  reactivarProducto,
  type ProductosFiltro,
} from '../../../api/productos.api'
import type { Producto } from '../../../types/producto'

interface Resultado {
  clave: string
  productos: Producto[]
}

export function useProductos(filtro: ProductosFiltro) {
  const { texto, categoriaId, activo } = filtro
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clave = JSON.stringify({ texto, categoriaId, activo, reloadToken })

  useEffect(() => {
    let cancelado = false
    listarProductos({ texto, categoriaId, activo })
      .then((data) => {
        if (cancelado) return
        setResultado({ clave, productos: data })
        setError(null)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos')
      })
    return () => {
      cancelado = true
    }
  }, [texto, categoriaId, activo, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const productos = resultado?.clave === clave ? resultado.productos : []

  const recargar = useCallback(() => setReloadToken((v) => v + 1), [])

  const darDeBaja = useCallback(
    async (id: number) => {
      await eliminarProducto(id)
      recargar()
    },
    [recargar],
  )

  const reactivar = useCallback(
    async (id: number) => {
      await reactivarProducto(id)
      recargar()
    },
    [recargar],
  )

  return { productos, cargando, error, recargar, darDeBaja, reactivar }
}
