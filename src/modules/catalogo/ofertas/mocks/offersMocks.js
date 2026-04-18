/**
 * Mock data para Ofertas
 * Simula datos de base de datos
 */
export const OFFERS_MOCK = [
  { 
    id: 1, 
    nombre: 'Remera Negra en Liquidación', 
    descripcion: 'Últimas unidades de remera negra con descuento especial',
    productoId: 1,
    varianteId: '1-M-Negro',
    precioOferta: 24.99,
    stockOferta: 3,
    descuento: 15,
    tipoDescuento: 'porcentaje',
    fechaInicio: '2026-04-01',
    fechaFin: '2026-04-30',
    activo: true
  },
  { 
    id: 2, 
    nombre: 'Buzo Oversize - Pack Promo', 
    descripcion: 'Precio especial para buzo talla L',
    productoId: 2,
    varianteId: '2-L',
    precioOferta: 39.99,
    stockOferta: 4,
    descuento: 0,
    tipoDescuento: 'monto',
    fechaInicio: '2026-04-10',
    fechaFin: '2026-05-10',
    activo: true
  },
  { 
    id: 3, 
    nombre: 'Remera Gris Oferta', 
    descripcion: 'Remera gris con descuento por fin de stock',
    productoId: 1,
    varianteId: '1-L-Gris',
    precioOferta: 26.99,
    stockOferta: 5,
    descuento: 10,
    tipoDescuento: 'porcentaje',
    fechaInicio: '2026-04-05',
    fechaFin: '2026-04-25',
    activo: false
  },
  { 
    id: 4, 
    nombre: 'Remera Blanca - Última Oferta', 
    descripcion: 'Oferta limitada para stock restante de remera blanca',
    productoId: 1,
    varianteId: '1-M-Blanco',
    precioOferta: 22.99,
    stockOferta: 2,
    descuento: 20,
    tipoDescuento: 'porcentaje',
    fechaInicio: '2026-04-15',
    fechaFin: '2026-05-01',
    activo: true
  },
  { 
    id: 5, 
    nombre: 'Buzo Oversize - Remate', 
    descripcion: 'Últimas unidades de buzo oversize',
    productoId: 2,
    varianteId: '2-XL',
    precioOferta: 34.99,
    stockOferta: 1,
    descuento: 30,
    tipoDescuento: 'porcentaje',
    fechaInicio: '2026-04-12',
    fechaFin: '2026-04-30',
    activo: true
  }
];
