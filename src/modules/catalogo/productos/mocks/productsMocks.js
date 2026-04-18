/**
 * Mock data para Productos con Variantes
 * Simula datos de base de datos
 */

// Productos base
export const PRODUCTS_MOCK = [
  { 
    id: 1, 
    nombre: 'Remera Básica Blanca', 
    descripcion: 'Remera 100% algodón, cómoda y versátil',
    categoriaId: 1,
    precioBase: 29.99,
    codigoBarras: '9780201637606',
    atributosUsados: ['Talla', 'Color'],
    activo: true,
    variants: [
      { variantId: '1-M-Negro', Talla: 'M', Color: 'Negro', stock: 10, precio: 29.99 },
      { variantId: '1-M-Blanco', Talla: 'M', Color: 'Blanco', stock: 15, precio: 29.99 },
      { variantId: '1-M-Gris', Talla: 'M', Color: 'Gris', stock: 8, precio: 29.99 },
      { variantId: '1-L-Negro', Talla: 'L', Color: 'Negro', stock: 12, precio: 29.99 },
      { variantId: '1-L-Blanco', Talla: 'L', Color: 'Blanco', stock: 20, precio: 29.99 },
      { variantId: '1-L-Gris', Talla: 'L', Color: 'Gris', stock: 9, precio: 29.99 }
    ]
  },
  { 
    id: 2, 
    nombre: 'Buzo Oversize', 
    descripcion: 'Buzo deportivo, corte oversize muy cómodo',
    categoriaId: 2,
    precioBase: 49.99,
    codigoBarras: '9780134685991',
    atributosUsados: ['Talla'],
    activo: true,
    variants: [
      { variantId: '2-S', Talla: 'S', stock: 5, precio: 49.99 },
      { variantId: '2-M', Talla: 'M', stock: 8, precio: 49.99 },
      { variantId: '2-L', Talla: 'L', stock: 12, precio: 49.99 },
      { variantId: '2-XL', Talla: 'XL', stock: 10, precio: 49.99 }
    ]
  }
];

// Variantes por producto (stock por combinación de atributos) - Para compatibilidad
export const PRODUCT_VARIANTS_MOCK = {
  1: [ // Remera Básica - Variantes por Talla x Color
    { variantId: '1-M-Negro', productoId: 1, Talla: 'M', Color: 'Negro', stock: 10 },
    { variantId: '1-M-Blanco', productoId: 1, Talla: 'M', Color: 'Blanco', stock: 15 },
    { variantId: '1-M-Gris', productoId: 1, Talla: 'M', Color: 'Gris', stock: 8 },
    { variantId: '1-L-Negro', productoId: 1, Talla: 'L', Color: 'Negro', stock: 12 },
    { variantId: '1-L-Blanco', productoId: 1, Talla: 'L', Color: 'Blanco', stock: 20 },
    { variantId: '1-L-Gris', productoId: 1, Talla: 'L', Color: 'Gris', stock: 9 },
    { variantId: '1-XL-Negro', productoId: 1, Talla: 'XL', Color: 'Negro', stock: 5 },
    { variantId: '1-XL-Blanco', productoId: 1, Talla: 'XL', Color: 'Blanco', stock: 18 },
    { variantId: '1-XL-Gris', productoId: 1, Talla: 'XL', Color: 'Gris', stock: 7 }
  ],
  2: [ // Buzo Oversize - Variantes por Talla solo
    { variantId: '2-S', productoId: 2, Talla: 'S', stock: 5 },
    { variantId: '2-M', productoId: 2, Talla: 'M', stock: 8 },
    { variantId: '2-L', productoId: 2, Talla: 'L', stock: 12 },
    { variantId: '2-XL', productoId: 2, Talla: 'XL', stock: 10 }
  ]
};
