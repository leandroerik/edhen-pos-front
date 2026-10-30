import type { Talla } from '../types/talla'

// Orden esperado de las talles en toda la UI: primero las letras de ropa
// (S, M, L, XL, XXL…) de menor a mayor, después las numéricas ascendentes
// (38, 39, 40…) y al final todo lo no reconocido en orden alfabético.
//
// No se usa `Talla.orden` porque ese campo refleja el orden de alta en el
// catálogo (S=1 … 42=10 y una "22" dada de alta tarde = 11), con lo que un
// talle nuevo numerico queda siempre después de los más chicos sin importar
// su valor.
const ORDEN_LETRAS: Record<string, number> = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  XXXL: 7,
  XXXXL: 8,
}

interface ClaveTalla {
  // 0 = letra conocida, 1 = letra no catalogada, 2 = numérica, 3 = resto
  grupo: number
  clave: number
  texto: string
}

function claveDeTalla(nombre: string): ClaveTalla {
  const texto = nombre.trim().toUpperCase()
  // "2XL" / "3XL" son el alias de XXL / XXXL y tienen que caer en la misma
  // posición que sus equivalentes, no al final con lo no reconocido.
  const aliasXL = texto.match(/^(\d+)XL$/)
  const normalizado = aliasXL ? `${'X'.repeat(Number(aliasXL[1]))}L` : texto
  const letra = ORDEN_LETRAS[normalizado]
  if (letra !== undefined) return { grupo: 0, clave: letra, texto: normalizado }
  if (/^\d+([.,]\d+)?$/.test(texto)) {
    return { grupo: 2, clave: Number(texto.replace(',', '.')), texto }
  }
  if (/^[A-ZÁÉÍÓÚÜÑ]+$/i.test(texto)) return { grupo: 1, clave: 0, texto }
  return { grupo: 3, clave: 0, texto }
}

export function compararTallas(a?: Talla | null, b?: Talla | null): number {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  const ka = claveDeTalla(a.nombre)
  const kb = claveDeTalla(b.nombre)
  if (ka.grupo !== kb.grupo) return ka.grupo - kb.grupo
  if (ka.clave !== kb.clave) return ka.clave - kb.clave
  const porTexto = ka.texto.localeCompare(kb.texto)
  if (porTexto !== 0) return porTexto
  return (a.orden ?? 0) - (b.orden ?? 0)
}

export function ordenarTallas(tallas: Talla[]): Talla[] {
  return [...tallas].sort(compararTallas)
}
