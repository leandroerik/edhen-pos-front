export const VENTAS_SECTIONS = [
  { id: 'tpv',          label: 'TPV Tienda',           icon: 'fa-cash-register' },
  { id: 'historial',    label: 'Historial',             icon: 'fa-history'       },
  { id: 'devoluciones', label: 'Devoluciones y Fallas', icon: 'fa-undo'          },
];

export const ESTADO_VENTA = {
  COMPLETADA: 'Completada',
  PENDIENTE:  'Pendiente',
  DEVUELTA:   'Devuelta',
  CANCELADA:  'Cancelada',
};

export const METODO_PAGO = {
  EFECTIVO:      'Efectivo',
  TARJETA:       'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE:        'Cheque',
};

export const VENTAS_CONFIG = {
  defaultPageSize: 10,
};
