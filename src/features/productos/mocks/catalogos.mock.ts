import type { Categoria } from '../../../types/categoria'
import type { Color } from '../../../types/color'
import type { Talla } from '../../../types/talla'

export const CATEGORIAS = {
  blusas: { id: 1, nombre: 'Blusas', activo: true },
  remeras: { id: 2, nombre: 'Remeras', activo: true },
  tops: { id: 3, nombre: 'Tops', activo: true },
  musculosas: { id: 4, nombre: 'Musculosas', activo: true },
  poleras: { id: 5, nombre: 'Poleras', activo: true },
  pantalones: { id: 6, nombre: 'Pantalones', activo: true },
  palazos: { id: 7, nombre: 'Palazos', activo: true },
  vestidos: { id: 8, nombre: 'Vestidos', activo: true },
  buzos: { id: 9, nombre: 'Buzos', activo: true },
  accesorios: { id: 10, nombre: 'Accesorios', activo: true },
  ofertas: { id: 11, nombre: 'Ofertas', activo: true },
} satisfies Record<string, Categoria>

export const COLORES = {
  negro: { id: 1, nombre: 'Negro', codigoHex: '#111827' },
  blanco: { id: 2, nombre: 'Blanco', codigoHex: '#F9FAFB' },
  azulMarino: { id: 3, nombre: 'Azul Marino', codigoHex: '#1E3A8A' },
  celeste: { id: 4, nombre: 'Celeste', codigoHex: '#93C5FD' },
  bordo: { id: 5, nombre: 'Bordó', codigoHex: '#800020' },
  beige: { id: 6, nombre: 'Beige', codigoHex: '#D4B996' },
  camel: { id: 7, nombre: 'Camel', codigoHex: '#C19A6B' },
  arena: { id: 8, nombre: 'Arena', codigoHex: '#E2D5C3' },
  terracota: { id: 9, nombre: 'Terracota', codigoHex: '#C25941' },
  chocolate: { id: 10, nombre: 'Chocolate', codigoHex: '#5B3A29' },
  dulceDeLeche: { id: 11, nombre: 'Dulce de Leche', codigoHex: '#9A6B43' },
  verdeOliva: { id: 12, nombre: 'Verde Oliva', codigoHex: '#556B2F' },
  grisMelange: { id: 13, nombre: 'Gris Melange', codigoHex: '#9CA3AF' },
  rosaPastel: { id: 14, nombre: 'Rosa Pastel', codigoHex: '#F4C2C2' },
  lila: { id: 15, nombre: 'Lila', codigoHex: '#A78BFA' },
} satisfies Record<string, Color>

const talleSuperior = (nombre: string, orden: number): Talla => ({
  id: 100 + orden,
  nombre,
  tipo: 'ROPA',
  orden,
})

const talleInferior = (nombre: string, orden: number): Talla => ({
  id: 200 + orden,
  nombre,
  tipo: 'ROPA',
  orden,
})

export const TALLAS_SUPERIOR = {
  s: talleSuperior('S', 1),
  m: talleSuperior('M', 2),
  l: talleSuperior('L', 3),
  xl: talleSuperior('XL', 4),
  xxl: talleSuperior('XXL', 5),
}

export const TALLAS_INFERIOR = {
  t38: talleInferior('38', 6),
  t39: talleInferior('39', 7),
  t40: talleInferior('40', 8),
  t41: talleInferior('41', 9),
  t42: talleInferior('42', 10),
}

export const categoriasMock: Categoria[] = Object.values(CATEGORIAS)
export const coloresMock: Color[] = Object.values(COLORES)
export const tallasMock: Talla[] = [...Object.values(TALLAS_SUPERIOR), ...Object.values(TALLAS_INFERIOR)]
