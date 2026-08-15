import { useCallback, useEffect, useState } from 'react'
import { contarUsoCatalogo } from '../../../api/productos.api'
import { listarCategorias, listarColores, listarTallas } from '../../../api/catalogos.api'
import type { Categoria } from '../../../types/categoria'
import type { Color } from '../../../types/color'
import type { Talla } from '../../../types/talla'

// Ordena por cuántas variantes activas del catálogo ya usan ese color/talla
// (más usado primero) — a igual uso, mantiene el orden de alta original
// (`sort` es estable). Un color/talla recién creado tiene 0 usos, así que
// naturalmente cae al final hasta que se use en alguna variante.
function ordenarPorUso<T extends { id: number }>(items: T[], usos: Record<number, number>): T[] {
  return [...items].sort((a, b) => (usos[b.id] ?? 0) - (usos[a.id] ?? 0))
}

async function cargarCatalogos() {
  const [categorias, colores, tallas, usos] = await Promise.all([
    listarCategorias(),
    listarColores(),
    listarTallas(),
    contarUsoCatalogo(),
  ])
  return {
    categorias,
    colores: ordenarPorUso(colores, usos.colores),
    tallas: ordenarPorUso(tallas, usos.tallas),
  }
}

export function useCatalogos() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [colores, setColores] = useState<Color[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])
  const [cargando, setCargando] = useState(true)

  // Expuesto para volver a cargar después de dar de alta un color/talla
  // "otro" desde el generador de variantes — sin esto, el nuevo color
  // quedaba disponible en la variante recién creada pero no aparecía como
  // chip elegible para el resto de talles hasta recargar la página.
  const recargar = useCallback(() => {
    return cargarCatalogos().then((datos) => {
      setCategorias(datos.categorias)
      setColores(datos.colores)
      setTallas(datos.tallas)
      setCargando(false)
    })
  }, [])

  useEffect(() => {
    let cancelado = false
    cargarCatalogos().then((datos) => {
      if (cancelado) return
      setCategorias(datos.categorias)
      setColores(datos.colores)
      setTallas(datos.tallas)
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [])

  return { categorias, colores, tallas, cargando, recargar }
}
