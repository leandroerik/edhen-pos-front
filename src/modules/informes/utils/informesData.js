// Mock data centralizado para todos los informes

export const PERIODOS = [
  { value: '7d',  label: 'Última semana' },
  { value: '30d', label: 'Último mes' },
  { value: '90d', label: 'Últimos 3 meses' },
];

// ── VENTAS ────────────────────────────────────────────────────────────────────
export const ventasPorDia = {
  '7d': [
    { label: 'Lun 13', ventas: 18500, transacciones: 12 },
    { label: 'Mar 14', ventas: 22300, transacciones: 15 },
    { label: 'Mié 15', ventas: 14800, transacciones: 9  },
    { label: 'Jue 16', ventas: 31200, transacciones: 21 },
    { label: 'Vie 17', ventas: 27600, transacciones: 18 },
    { label: 'Sáb 18', ventas: 45800, transacciones: 32 },
    { label: 'Dom 19', ventas: 19400, transacciones: 13 },
  ],
  '30d': [
    { label: 'Sem 1', ventas: 142000, transacciones: 95  },
    { label: 'Sem 2', ventas: 168500, transacciones: 112 },
    { label: 'Sem 3', ventas: 131200, transacciones: 87  },
    { label: 'Sem 4', ventas: 189300, transacciones: 128 },
  ],
  '90d': [
    { label: 'Feb',    ventas: 512000, transacciones: 341 },
    { label: 'Mar',    ventas: 638000, transacciones: 428 },
    { label: 'Abr',    ventas: 631000, transacciones: 422 },
  ],
};

// ── DEVOLUCIONES ──────────────────────────────────────────────────────────────
export const devolucionesPorMotivo = [
  { motivo: 'Talle incorrecto', cantidad: 28, monto: 12600 },
  { motivo: 'Falla / defecto',  cantidad: 12, monto:  5400 },
  { motivo: 'Color diferente',  cantidad:  8, monto:  3600 },
  { motivo: 'No le gustó',      cantidad:  6, monto:  2700 },
  { motivo: 'Duplicado',        cantidad:  3, monto:  1350 },
];

export const productosDevueltos = [
  { nombre: 'Remera de Algodón Clásica',  categoria: 'Remeras',    cantidad: 14, monto:  4186 },
  { nombre: 'Pantalón Darlón Clásico',    categoria: 'Pantalones', cantidad: 11, monto:  4939 },
  { nombre: 'Buzo Canguro',               categoria: 'Buzos',      cantidad:  9, monto:  5391 },
  { nombre: 'Remera Estampada',           categoria: 'Remeras',    cantidad:  8, monto:  2632 },
  { nombre: 'Campera Rompeviento',        categoria: 'Camperas',   cantidad:  5, monto:  4495 },
];

// ── PRODUCTOS MÁS VENDIDOS ────────────────────────────────────────────────────
export const topProductos = {
  '7d': [
    { nombre: 'Remera de Algodón Clásica', categoria: 'Remeras',    unidades: 48, monto: 14352 },
    { nombre: 'Pantalón Darlón Clásico',   categoria: 'Pantalones', unidades: 35, monto: 15715 },
    { nombre: 'Buzo Canguro',              categoria: 'Buzos',      unidades: 29, monto: 17371 },
    { nombre: 'Calza Deportiva',           categoria: 'Calzas',     unidades: 26, monto:  6994 },
    { nombre: 'Campera Rompeviento',       categoria: 'Camperas',   unidades: 22, monto: 19778 },
    { nombre: 'Short Running',             categoria: 'Shorts',     unidades: 19, monto:  4939 },
    { nombre: 'Remera Estampada',          categoria: 'Remeras',    unidades: 17, monto:  5593 },
    { nombre: 'Pantalón Cargo',            categoria: 'Pantalones', unidades: 14, monto:  7546 },
  ],
  '30d': [
    { nombre: 'Remera de Algodón Clásica', categoria: 'Remeras',    unidades: 186, monto:  55614 },
    { nombre: 'Pantalón Darlón Clásico',   categoria: 'Pantalones', unidades: 142, monto:  63758 },
    { nombre: 'Buzo Canguro',              categoria: 'Buzos',      unidades: 118, monto:  70682 },
    { nombre: 'Calza Deportiva',           categoria: 'Calzas',     unidades: 103, monto:  27707 },
    { nombre: 'Campera Rompeviento',       categoria: 'Camperas',   unidades:  89, monto:  80011 },
    { nombre: 'Short Running',             categoria: 'Shorts',     unidades:  76, monto:  19228 },
    { nombre: 'Remera Estampada',          categoria: 'Remeras',    unidades:  71, monto:  23359 },
    { nombre: 'Pantalón Cargo',            categoria: 'Pantalones', unidades:  58, monto:  31262 },
  ],
  '90d': [
    { nombre: 'Remera de Algodón Clásica', categoria: 'Remeras',    unidades: 542, monto: 162058 },
    { nombre: 'Pantalón Darlón Clásico',   categoria: 'Pantalones', unidades: 418, monto: 187682 },
    { nombre: 'Buzo Canguro',              categoria: 'Buzos',      unidades: 341, monto: 204199 },
    { nombre: 'Calza Deportiva',           categoria: 'Calzas',     unidades: 298, monto:  80162 },
    { nombre: 'Campera Rompeviento',       categoria: 'Camperas',   unidades: 267, monto: 240003 },
    { nombre: 'Short Running',             categoria: 'Shorts',     unidades: 214, monto:  54140 },
    { nombre: 'Remera Estampada',          categoria: 'Remeras',    unidades: 198, monto:  65142 },
    { nombre: 'Pantalón Cargo',            categoria: 'Pantalones', unidades: 171, monto:  92259 },
  ],
};

// ── CATEGORÍAS ────────────────────────────────────────────────────────────────
export const ventasPorCategoria = {
  '7d': [
    { categoria: 'Remeras',    unidades: 65,  monto: 19945 },
    { categoria: 'Pantalones', unidades: 49,  monto: 23261 },
    { categoria: 'Buzos',      unidades: 29,  monto: 17371 },
    { categoria: 'Camperas',   unidades: 22,  monto: 19778 },
    { categoria: 'Calzas',     unidades: 26,  monto:  6994 },
    { categoria: 'Shorts',     unidades: 19,  monto:  4939 },
  ],
  '30d': [
    { categoria: 'Remeras',    unidades: 257, monto:  78973 },
    { categoria: 'Pantalones', unidades: 200, monto:  95020 },
    { categoria: 'Buzos',      unidades: 118, monto:  70682 },
    { categoria: 'Camperas',   unidades:  89, monto:  80011 },
    { categoria: 'Calzas',     unidades: 103, monto:  27707 },
    { categoria: 'Shorts',     unidades:  76, monto:  19228 },
  ],
  '90d': [
    { categoria: 'Remeras',    unidades: 740,  monto: 227200 },
    { categoria: 'Pantalones', unidades: 589,  monto: 279941 },
    { categoria: 'Buzos',      unidades: 341,  monto: 204199 },
    { categoria: 'Camperas',   unidades: 267,  monto: 240003 },
    { categoria: 'Calzas',     unidades: 298,  monto:  80162 },
    { categoria: 'Shorts',     unidades: 214,  monto:  54140 },
  ],
};

export const devolucionesPorCategoria = [
  { categoria: 'Remeras',    cantidad: 22, monto:  7218 },
  { categoria: 'Pantalones', cantidad: 15, monto:  6735 },
  { categoria: 'Buzos',      cantidad:  9, monto:  5391 },
  { categoria: 'Camperas',   cantidad:  5, monto:  4495 },
  { categoria: 'Calzas',     cantidad:  5, monto:  1345 },
  { categoria: 'Shorts',     cantidad:  1, monto:   260 },
];

// ── VENDEDORES ────────────────────────────────────────────────────────────────
export const ventasPorVendedor = {
  '7d': [
    { vendedor: 'Lucía Martínez',  ventas: 52300, transacciones: 35, ticket: 1494, devoluciones: 2 },
    { vendedor: 'Carlos Ruiz',     ventas: 48700, transacciones: 31, ticket: 1571, devoluciones: 3 },
    { vendedor: 'Valentina López', ventas: 43600, transacciones: 28, ticket: 1557, devoluciones: 1 },
    { vendedor: 'Matías González', ventas: 35000, transacciones: 26, ticket: 1346, devoluciones: 4 },
  ],
  '30d': [
    { vendedor: 'Lucía Martínez',  ventas: 198400, transacciones: 131, ticket: 1514, devoluciones:  8 },
    { vendedor: 'Carlos Ruiz',     ventas: 187200, transacciones: 122, ticket: 1534, devoluciones: 12 },
    { vendedor: 'Valentina López', ventas: 162800, transacciones: 108, ticket: 1507, devoluciones:  6 },
    { vendedor: 'Matías González', ventas: 138600, transacciones:  99, ticket: 1400, devoluciones: 15 },
  ],
  '90d': [
    { vendedor: 'Lucía Martínez',  ventas: 584000, transacciones: 391, ticket: 1493, devoluciones: 21 },
    { vendedor: 'Carlos Ruiz',     ventas: 548000, transacciones: 362, ticket: 1514, devoluciones: 28 },
    { vendedor: 'Valentina López', ventas: 491000, transacciones: 328, ticket: 1497, devoluciones: 17 },
    { vendedor: 'Matías González', ventas: 408000, transacciones: 296, ticket: 1378, devoluciones: 34 },
  ],
};
