// Constantes globales para el proyecto

// Clientes
export const CLIENTE_MINORISTA = { id: 0, nombre: 'Cliente Minorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Minorista' };
export const CLIENTE_MAYORISTA = { id: -1, nombre: 'Cliente Mayorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Mayorista' };

// Motivos de devolución
export const MOTIVOS_DEVOLUCION = ['Falla', 'Devolución', 'Rotura', 'Pérdida'];

// Estados de pedidos online/envíos
export const ESTADOS_ENVIO = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO',
  EN_PREPARACION: 'EN_PREPARACION',
  ENVIADO: 'ENVIADO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO'
};

// Métodos de envío
export const METODOS_ENVIO = [
  { 
    id: 'correo_argentino', 
    nombre: 'Correo Argentino', 
    costoBase: 500,
    camposRequeridos: ['peso', 'dimensiones', 'numero_seguimiento', 'fecha_entrega_estimada']
  },
  { 
    id: 'andreani', 
    nombre: 'Andreani', 
    costoBase: 800,
    camposRequeridos: ['peso', 'dimensiones', 'numero_transportista', 'monto_minimo', 'numero_seguimiento', 'fecha_entrega_estimada']
  },
  { 
    id: 'oca', 
    nombre: 'OCA', 
    costoBase: 600,
    camposRequeridos: ['peso', 'dimensiones', 'valor_declarado', 'numero_transportista', 'numero_seguimiento', 'fecha_entrega_estimada']
  },
  { 
    id: 'retiro_tienda', 
    nombre: 'Retiro en Tienda', 
    costoBase: 0,
    camposRequeridos: ['fecha_retiro']
  }
];

// Atributos de envío (campos dinámicos para datos variables de envío)
export const ATRIBUTOS_ENVIO_DEFAULT = [
  {
    id: 'peso',
    nombre: 'Peso (kg)',
    tipo: 'numero',
    requerido: false,
    descripcion: 'Peso total del paquete',
    placeholder: 'Ej: 2.5'
  },
  {
    id: 'dimensiones',
    nombre: 'Dimensiones (cm)',
    tipo: 'texto',
    requerido: false,
    descripcion: 'Alto x Ancho x Largo',
    placeholder: 'Ej: 30x20x10'
  },
  {
    id: 'valor_declarado',
    nombre: 'Valor Declarado',
    tipo: 'numero',
    requerido: false,
    descripcion: 'Valor para seguro del envío',
    placeholder: 'Ej: 5000'
  },
  {
    id: 'numero_seguimiento',
    nombre: 'Número de Seguimiento',
    tipo: 'texto',
    requerido: false,
    descripcion: 'Código de seguimiento del transportista',
    placeholder: 'Ej: ARD123456789'
  },
  {
    id: 'fecha_entrega_estimada',
    nombre: 'Fecha Entrega Estimada',
    tipo: 'fecha',
    requerido: false,
    descripcion: 'Fecha aproximada de entrega'
  },
  {
    id: 'numero_transportista',
    nombre: 'Número de Transportista',
    tipo: 'texto',
    requerido: false,
    descripcion: 'Referencia del transportista',
    placeholder: 'Ej: T-2026-001234'
  },
  {
    id: 'monto_minimo',
    nombre: 'Monto Mínimo',
    tipo: 'numero',
    requerido: false,
    descripcion: 'Monto mínimo para envío especial',
    placeholder: 'Ej: 10000'
  },
  {
    id: 'fecha_retiro',
    nombre: 'Fecha Retiro en Tienda',
    tipo: 'fecha',
    requerido: false,
    descripcion: 'Fecha estimada de retiro'
  },
  {
    id: 'horario_retiro',
    nombre: 'Horario Retiro',
    tipo: 'texto',
    requerido: false,
    descripcion: 'Horario disponible para retiro',
    placeholder: 'Ej: 10:00 - 18:00'
  }
];