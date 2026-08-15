import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ColaEtiquetasContext, type ItemColaEtiqueta, type ItemConCantidad } from './useColaEtiquetas'

const CLAVE_STORAGE = 'edhen-pos:colaEtiquetas'

function leerInicial(): ItemConCantidad[] {
  try {
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    return guardado ? (JSON.parse(guardado) as ItemConCantidad[]) : []
  } catch {
    return []
  }
}

// Cola de etiquetas para imprimir varias de una en una sola hoja A4 (ver
// EtiquetasColaPage) — pedido explícito: "un carrito o armador de
// códigos de barra a imprimir". Vive en Context (no prop-drilling) porque
// se agrega desde ProductoDetallePage (una página por producto) y se
// consume desde el Sidebar (contador) y EtiquetasColaPage (cualquier
// pantalla) — necesita ser accesible desde cualquier punto de la app, no
// solo desde donde se agregó. Se persiste en localStorage además de en
// memoria, para que sobreviva una recarga de página mientras se arma la
// tanda a imprimir (mismo criterio que la preferencia de "ocultar
// facturado" de Inicio).
//
// El contexto y el hook `useColaEtiquetas` viven en `useColaEtiquetas.ts`
// (archivo aparte, sin JSX) — Fast Refresh exige que un archivo que
// exporta un componente no exporte nada más (`react-refresh/only-export-components`).
export function ColaEtiquetasProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemConCantidad[]>(leerInicial)

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items])

  const agregar = useCallback((item: ItemColaEtiqueta) => {
    setItems((actual) => {
      const existente = actual.find((i) => i.id === item.id)
      if (existente) {
        return actual.map((i) => (i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...actual, { ...item, cantidad: 1 }]
    })
  }, [])

  const quitar = useCallback((id: string) => {
    setItems((actual) => actual.filter((i) => i.id !== id))
  }, [])

  const cambiarCantidad = useCallback((id: string, cantidad: number) => {
    setItems((actual) => actual.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i)))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const totalEtiquetas = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <ColaEtiquetasContext.Provider
      value={{ items, agregar, quitar, cambiarCantidad, vaciar, totalEtiquetas }}
    >
      {children}
    </ColaEtiquetasContext.Provider>
  )
}
