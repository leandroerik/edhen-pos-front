import { useCallback } from 'react'
import {
  eliminarProducto,
  listarProductos,
  reactivarProducto,
  type ProductosFiltro,
} from '../../../api/productos.api'
import type { Producto } from '../../../types/producto'
import { useEntityList } from '../../../shared/hooks/useEntityList'

export function useProductos(filtro: ProductosFiltro) {
  const { texto, categoriaId, activo } = filtro
  const { items: productos, cargando, error, recargar } = useEntityList<Producto, ProductosFiltro>({
    fetcher: listarProductos,
    filtro: { texto, categoriaId, activo },
    errorMsg: 'No se pudieron cargar los productos',
  })

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
