import { useCallback, useEffect, useState } from 'react'
import {
  eliminarCliente,
  listarClientes,
  reactivarCliente,
  type ClientesFiltro,
} from '../../../api/clientes.api'
import type { Cliente } from '../../../types/cliente'

interface Resultado {
  clave: string
  clientes: Cliente[]
}

export function useClientes(filtro: ClientesFiltro) {
  const { texto, tipo, activo } = filtro
  const [reloadToken, setReloadToken] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clave = JSON.stringify({ texto, tipo, activo, reloadToken })

  useEffect(() => {
    let cancelado = false
    listarClientes({ texto, tipo, activo })
      .then((data) => {
        if (cancelado) return
        setResultado({ clave, clientes: data })
        setError(null)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los clientes')
      })
    return () => {
      cancelado = true
    }
  }, [texto, tipo, activo, reloadToken, clave])

  const cargando = resultado?.clave !== clave
  const clientes = resultado?.clave === clave ? resultado.clientes : []

  const recargar = useCallback(() => setReloadToken((v) => v + 1), [])

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
