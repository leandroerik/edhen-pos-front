import type { Color } from '../../../types/color'
import type { Talla, TallaTipo } from '../../../types/talla'

export interface VarianteDraft {
  localId: string
  id?: number
  colorId: number | 'otro'
  colorNombreNuevo: string
  colorHexNuevo: string
  tallaId: number | 'otro'
  tallaNombreNueva: string
  tallaTipoNueva: TallaTipo
  codigoBarras: string
  precio: string
  stock: string
  stockMinimo: string
  stockMinimoTocado: boolean
  activo: boolean
}

export function crearVarianteDraftVacia(colores: Color[], tallas: Talla[]): VarianteDraft {
  return {
    localId: crypto.randomUUID(),
    colorId: colores[0]?.id ?? 'otro',
    colorNombreNuevo: '',
    colorHexNuevo: '#000000',
    tallaId: tallas[0]?.id ?? 'otro',
    tallaNombreNueva: '',
    tallaTipoNueva: 'ROPA',
    codigoBarras: '',
    precio: '',
    stock: '0',
    stockMinimo: '0',
    stockMinimoTocado: false,
    activo: true,
  }
}
