import type { Producto } from '../../../types/producto'
import { generarCodigoBarrasInterno, generarCodigoBarrasProducto } from '../lib/codigoBarras'
import { CATEGORIAS, COLORES, TALLAS_INFERIOR, TALLAS_SUPERIOR } from './catalogos.mock'

const productosMockBase: Producto[] = [
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
      { id: 6, productoId: 2, color: COLORES.rosaPalo, talla: TALLAS_SUPERIOR.l, sku: 'VES-FLO-ROS-L', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
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
      { id: 7, productoId: 3, color: COLORES.denim, talla: TALLAS_INFERIOR.t38, sku: 'PAN-JEA-DEN-38', stock: 9, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 8, productoId: 3, color: COLORES.denim, talla: TALLAS_INFERIOR.t40, sku: 'PAN-JEA-DEN-40', stock: 4, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 9, productoId: 3, color: COLORES.denim, talla: TALLAS_INFERIOR.t42, sku: 'PAN-JEA-DEN-42', stock: 1, stockReservado: 0, stockMinimo: 4, activo: true },
    ],
  },
  {
    id: 4,
    categoria: CATEGORIAS.camperas,
    nombre: 'Campera de jean oversize',
    descripcion: 'Campera de jean clásica, calce oversize',
    precioBase: 45000,
    activo: true,
    variantes: [
      { id: 10, productoId: 4, color: COLORES.denim, talla: TALLAS_SUPERIOR.m, sku: 'CAM-JEA-DEN-M', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 11, productoId: 4, color: COLORES.denim, talla: TALLAS_SUPERIOR.l, sku: 'CAM-JEA-DEN-L', stock: 2, stockReservado: 0, stockMinimo: 3, activo: true },
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
      { id: 12, productoId: 5, color: COLORES.gris, talla: TALLAS_SUPERIOR.m, sku: 'BUZ-OVE-GRI-M', stock: 7, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 13, productoId: 5, color: COLORES.gris, talla: TALLAS_SUPERIOR.l, sku: 'BUZ-OVE-GRI-L', stock: 3, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 14, productoId: 5, color: COLORES.negro, talla: TALLAS_SUPERIOR.m, sku: 'BUZ-OVE-NEG-M', stock: 10, stockReservado: 2, stockMinimo: 4, activo: true },
    ],
  },
  {
    id: 6,
    categoria: CATEGORIAS.polleras,
    nombre: 'Pollera tiro alto plisada',
    descripcion: 'Pollera plisada, tiro alto, tela fluida',
    precioBase: 22000,
    activo: true,
    variantes: [
      { id: 15, productoId: 6, color: COLORES.verdeMilitar, talla: TALLAS_INFERIOR.t38, sku: 'POL-PLI-VER-38', stock: 4, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 16, productoId: 6, color: COLORES.verdeMilitar, talla: TALLAS_INFERIOR.t40, sku: 'POL-PLI-VER-40', stock: 1, stockReservado: 0, stockMinimo: 3, activo: true },
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
    categoria: CATEGORIAS.shorts,
    nombre: 'Short de jean',
    descripcion: 'Short de jean tiro alto, dobladillo crudo',
    precioBase: 17000,
    activo: true,
    variantes: [
      { id: 20, productoId: 8, color: COLORES.denim, talla: TALLAS_INFERIOR.t38, sku: 'SHO-JEA-DEN-38', stock: 8, stockReservado: 0, stockMinimo: 4, activo: true },
      { id: 21, productoId: 8, color: COLORES.denim, talla: TALLAS_INFERIOR.t40, sku: 'SHO-JEA-DEN-40', stock: 3, stockReservado: 0, stockMinimo: 4, activo: true },
    ],
  },
  {
    id: 9,
    categoria: CATEGORIAS.remeras,
    nombre: 'Musculosa canalé',
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
    categoria: CATEGORIAS.buzos,
    nombre: 'Cárdigan tejido',
    descripcion: 'Cárdigan de punto, abotonado',
    precioBase: 31000,
    activo: true,
    variantes: [
      { id: 25, productoId: 10, color: COLORES.beige, talla: TALLAS_SUPERIOR.m, sku: 'CAR-TEJ-BEI-M', stock: 5, stockReservado: 0, stockMinimo: 3, activo: true },
      { id: 26, productoId: 10, color: COLORES.beige, talla: TALLAS_SUPERIOR.l, sku: 'CAR-TEJ-BEI-L', stock: 0, stockReservado: 0, stockMinimo: 3, activo: true },
    ],
  },
]

// El array de arriba no pasa por crearProducto()/crearVariante(), así que
// se les asigna acá el mismo código de barras que generaría la API real
// (interno por variante + genérico por producto) — para poder ver/probar
// el escaneo (docs/07-proceso-de-venta.md) sin tener que dar de alta un
// producto nuevo primero.
export const productosMock: Producto[] = productosMockBase.map((producto) => ({
  ...producto,
  codigoBarras: producto.codigoBarras ?? generarCodigoBarrasProducto(producto.id),
  variantes: producto.variantes.map((variante) => ({
    ...variante,
    codigoBarras: variante.codigoBarras ?? generarCodigoBarrasInterno(variante.id),
  })),
}))
