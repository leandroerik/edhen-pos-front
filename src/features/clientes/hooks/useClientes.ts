import { useCallback } from 'react'
import {
  eliminarCliente,
  listarClientes,
  reactivarCliente,
  type ClientesFiltro,
} from '../../../api/clientes.api'
import type { Cliente } from '../../../types/cliente'
import { useEntityList } from '../../../shared/hooks/useEntityList'

export function useClientes(filtro: ClientesFiltro) {
  const { texto, tipo, activo } = filtro
  const { items: clientes, cargando, error, recargar } = useEntityList<Cliente, ClientesFiltro>({
    fetcher: listarClientes,
    filtro: { texto, tipo, activo },
    errorMsg: 'No se pudieron cargar los clientes',
  })

  const darDeBaja = useCallback(
    async (id: number) => {
      await eliminarCliente(id)
      recargar()
    },
    [recargar],
  )

  const reactivar = useCallback(
    async (id: number) => {
      await reactivarCliente(id)
      recargar()
    },
    [recargar],
  )

  return { clientes, cargando, error, recargar, darDeBaja, reactivar }
}
