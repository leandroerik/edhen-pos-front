import JsBarcode from 'jsbarcode'
import { useEffect, useRef } from 'react'

interface CodigoBarrasProps {
  valor: string
  alto?: number
}

const EAN13_VALIDO = /^\d{13}$/

export function CodigoBarras({ valor, alto = 60 }: CodigoBarrasProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !valor) return
    try {
      JsBarcode(svgRef.current, valor, {
        format: EAN13_VALIDO.test(valor) ? 'EAN13' : 'CODE128',
        height: alto,
        fontSize: 14,
        margin: 4,
      })
    } catch {
      // El valor cargado no es un código válido para el formato elegido (ej.
      // un código de fábrica mal tipeado); se deja el SVG vacío en vez de romper la página.
    }
  }, [valor, alto])

  if (!valor) {
    return <p className="text-xs text-gray-400">Sin código de barras</p>
  }

  return <svg ref={svgRef} />
}
