import type { Categoria } from '../../../types/categoria'
import type { Color } from '../../../types/color'
import type { Talla } from '../../../types/talla'

export const CATEGORIAS = {
  remeras: { id: 1, nombre: 'Remeras' },
  vestidos: { id: 2, nombre: 'Vestidos' },
  pantalones: { id: 3, nombre: 'Pantalones' },
  camperas: { id: 4, nombre: 'Camperas' },
  buzos: { id: 5, nombre: 'Buzos' },
  polleras: { id: 6, nombre: 'Polleras' },
  blusas: { id: 7, nombre: 'Blusas' },
  shorts: { id: 8, nombre: 'Shorts' },
} satisfies Record<string, Categoria>

export const COLORES = {
  negro: { id: 1, nombre: 'Negro', codigoHex: '#111111' },
  blanco: { id: 2, nombre: 'Blanco', codigoHex: '#FAFAFA' },
  beige: { id: 3, nombre: 'Beige', codigoHex: '#E3D5B8' },
  denim: { id: 4, nombre: 'Denim', codigoHex: '#4A6FA5' },
  bordo: { id: 5, nombre: 'Bordó', codigoHex: '#7B2D3B' },
  verdeMilitar: { id: 6, nombre: 'Verde militar', codigoHex: '#5C6E49' },
  rosaPalo: { id: 7, nombre: 'Rosa palo', codigoHex: '#E8C4C4' },
  gris: { id: 8, nombre: 'Gris', codigoHex: '#9B9B9B' },
} satisfies Record<string, Color>

const talleSuperior = (nombre: string, orden: number): Talla => ({
  id: 100 + orden,
  nombre,
  tipo: 'ROPA_SUPERIOR',
  orden,
})

const talleInferior = (nombre: string, orden: number): Talla => ({
  id: 200 + orden,
  nombre,
  tipo: 'ROPA_INFERIOR',
  orden,
})

export const TALLAS_SUPERIOR = {
  s: talleSuperior('S', 1),
  m: talleSuperior('M', 2),
  l: talleSuperior('L', 3),
}

export const TALLAS_INFERIOR = {
  t38: talleInferior('38', 1),
  t40: talleInferior('40', 2),
  t42: talleInferior('42', 3),
}

export const categoriasMock: Categoria[] = Object.values(CATEGORIAS)
export const coloresMock: Color[] = Object.values(COLORES)
export const tallasMock: Talla[] = [...Object.values(TALLAS_SUPERIOR), ...Object.values(TALLAS_INFERIOR)]
