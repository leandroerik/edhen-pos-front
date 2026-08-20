import type { Producto, ProductoVariante } from '../../../types/producto'
import { generarCodigoBarrasInterno, generarCodigoBarrasProducto } from '../lib/codigoBarras'
import { CATEGORIAS, COLORES, TALLAS_INFERIOR, TALLAS_SUPERIOR } from './catalogos.mock'

type ProductoMock = Omit<Producto, 'codigoBarras' | 'variantes'> & {
  variantes: Array<Omit<ProductoVariante, 'codigoBarras' | 'stockDisponible'>>
}

const productosMockBase: ProductoMock[] = [
  {
    id: 1,
    categoria: CATEGORIAS.remeras,
    nombre: 'Remera básica algodón',
    descripcion: 'Remera de algodón peinado, corte clásico',
    precioBase: 14000,
    activo: true,
    variantes: [
      { id: 1, productoId: 1, color: COLORES.negro, talla: TALLAS_SUPERIOR.s, sku: 'REM-BAS-NEG-S', stock: 12, stockReservado: 0, stockMinimo: 5, activo: true },
      { id: 2, productoId: 1, color: COLORES.negro, talla: TALLAS_SUPERIOR.m, sku: 'REM-BAS-NEG-M', stock: 3, stockReservado: 0, stockMinimo: 5, activo: true },
      { id: 3, productoId: 1, color: COLORES.blanco, talla: TALLAS_SUPERIOR.m, sku: 'REM-BAS-BLA-M', stock: 8, stockReservado: 1, stockMinimo: 5, activo: true },
    ],
  },
  {
    id: 2,
    categoria: CATEGORIAS.vestidos,
    nombre: 'Vestido floreado midi',
    descripcion: 'Vestido midi con estampa floral, tela liviana',
    precioBase: 32000,
    activo: true,
    variantes: [
      { id: 4, productoId: 2, color: COLORES.beige, talla: TALLAS_SUPERIOR.s, sku: 'VES-FLO-BEI-S', stock: 6, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 5, productoId: 2, color: COLORES.beige, talla: TALLAS_SUPERIOR.m, sku: 'VES-FLO-BEI-M', stock: 2, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 6, productoId: 2, color: COLORES.rosaPastel, talla: TALLAS_SUPERIOR.l, sku: 'VES-FLO-ROS-L', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
    ],
  },
  {
    id: 3,
    categoria: CATEGORIAS.pantalones,
    nombre: 'Jean tiro alto',
    descripcion: 'Jean chupín tiro alto, elastizado',
    precioBase: 28000,
    activo: true,
    variantes: [
      { id: 7, productoId: 3, color: COLORES.azulMarino, talla: TALLAS_INFERIOR.t38, sku: 'PAN-JEA-AZU-38', stock: 9, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 8, productoId: 3, color: COLORES.azulMarino, talla: TALLAS_INFERIOR.t40, sku: 'PAN-JEA-AZU-40', stock: 4, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 9, productoId: 3, color: COLORES.celeste, talla: TALLAS_INFERIOR.t42, sku: 'PAN-JEA-CEL-42', stock: 1, stockReservado: 0, stockMinimo: 4, activo: true },
    ],
  },
  {
    id: 4,
    categoria: CATEGORIAS.palazos,
    nombre: 'Pantalón palazzo dralón',
    descripcion: 'Pantalón palazzo en tejido dralón suave con caída pesada',
    precioBase: 28500,
    activo: true,
    variantes: [
      { id: 10, productoId: 4, color: COLORES.negro, talla: TALLAS_INFERIOR.t38, sku: 'PAL-DRA-NEG-38', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 11, productoId: 4, color: COLORES.camel, talla: TALLAS_INFERIOR.t40, sku: 'PAL-DRA-CAM-40', stock: 2, stockReservado: 0, stockMinimo: 3, activo: true },
    ],
  },
  {
    id: 5,
    categoria: CATEGORIAS.buzos,
    nombre: 'Buzo oversize frisa',
    descripcion: 'Buzo con friza interior, capucha',
    precioBase: 26000,
    activo: true,
    variantes: [
      { id: 12, productoId: 5, color: COLORES.grisMelange, talla: TALLAS_SUPERIOR.m, sku: 'BUZ-OVE-GRI-M', stock: 7, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 13, productoId: 5, color: COLORES.grisMelange, talla: TALLAS_SUPERIOR.l, sku: 'BUZ-OVE-GRI-L', stock: 3, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 14, productoId: 5, color: COLORES.negro, talla: TALLAS_SUPERIOR.m, sku: 'BUZ-OVE-NEG-M', stock: 10, stockReservado: 2, stockMinimo: 4, activo: true },
    ],
  },
  {
    id: 6,
    categoria: CATEGORIAS.poleras,
    nombre: 'Polera de morley suave',
    descripcion: 'Polera ajustada de morley elastizado',
    precioBase: 18000,
    activo: true,
    variantes: [
      { id: 15, productoId: 6, color: COLORES.verdeOliva, talla: TALLAS_SUPERIOR.s, sku: 'POL-MOR-VER-S', stock: 4, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 16, productoId: 6, color: COLORES.verdeOliva, talla: TALLAS_SUPERIOR.m, sku: 'POL-MOR-VER-M', stock: 1, stockReservado: 0, stockMinimo: 3, activo: true },
    ],
  },
  {
    id: 7,
    categoria: CATEGORIAS.blusas,
    nombre: 'Blusa de gasa manga larga',
    descripcion: 'Blusa de gasa liviana, puño elastizado',
    precioBase: 19000,
    activo: true,
    variantes: [
      { id: 17, productoId: 7, color: COLORES.blanco, talla: TALLAS_SUPERIOR.s, sku: 'BLU-GAS-BLA-S', stock: 6, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 18, productoId: 7, color: COLORES.blanco, talla: TALLAS_SUPERIOR.m, sku: 'BLU-GAS-BLA-M', stock: 2, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 19, productoId: 7, color: COLORES.bordo, talla: TALLAS_SUPERIOR.m, sku: 'BLU-GAS-BOR-M', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
    ],
  },
  {
    id: 8,
    categoria: CATEGORIAS.tops,
    nombre: 'Top morley ribb',
    descripcion: 'Top corto de morley elastizado',
    precioBase: 9500,
    activo: true,
    variantes: [
      { id: 20, productoId: 8, color: COLORES.arena, talla: TALLAS_SUPERIOR.s, sku: 'TOP-MOR-ARE-S', stock: 8, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 21, productoId: 8, color: COLORES.dulceDeLeche, talla: TALLAS_SUPERIOR.m, sku: 'TOP-MOR-DUL-M', stock: 3, stockReservado: 0, stockMinimo: 4, activo: true },
    ],
  },
  {
    id: 9,
    categoria: CATEGORIAS.musculosas,
    nombre: 'Musculosa canalé bretel ancho',
    descripcion: 'Musculosa de canalé, escote redondo',
    precioBase: 11000,
    activo: true,
    variantes: [
      { id: 22, productoId: 9, color: COLORES.negro, talla: TALLAS_SUPERIOR.s, sku: 'MUS-CAN-NEG-S', stock: 15, stockReservado: 0, stockMinimo: 5, activo: true },
      { id: 23, productoId: 9, color: COLORES.blanco, talla: TALLAS_SUPERIOR.s, sku: 'MUS-CAN-BLA-S', stock: 4, stockReservado: 0, stockMinimo: 5, activo: true },
      { id: 24, productoId: 9, color: COLORES.bordo, talla: TALLAS_SUPERIOR.m, sku: 'MUS-CAN-BOR-M', stock: 9, stockReservado: 0, stockMinimo: 5, activo: true },
    ],
  },
  {
    id: 10,
    categoria: CATEGORIAS.ofertas,
    nombre: 'Top Morley Ribb (Oferta Especial)',
    descripcion: 'Top de morley suave. Edición especial en oferta.',
    precioBase: 7900,
    activo: true,
    variantes: [
      { id: 25, productoId: 10, color: COLORES.arena, talla: TALLAS_SUPERIOR.m, sku: 'OFE-TOP-ARE-M', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 26, productoId: 10, color: COLORES.dulceDeLeche, talla: TALLAS_SUPERIOR.l, sku: 'OFE-TOP-DUL-L', stock: 2, stockReservado: 0, stockMinimo: 3, activo: true },
    ],
  },
]

export const productosMock: Producto[] = productosMockBase.map((producto) => ({
  ...producto,
  codigoBarras: generarCodigoBarrasProducto(producto.id),
  variantes: producto.variantes.map((variante) => ({
    ...variante,
    codigoBarras: generarCodigoBarrasInterno(variante.id),
    stockDisponible: variante.stock - variante.stockReservado,
  })),
}))
