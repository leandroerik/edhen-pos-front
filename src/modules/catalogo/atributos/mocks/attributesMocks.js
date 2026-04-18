/**
 * Mock data para Atributos
 * Estructura preparada para ser reemplazada por API REST
 * 
 * BACKEND INTEGRATION:
 * - Reemplazar fetchAttributes() en service para llamar a GET /api/atributos
 * - Reemplazar saveAttribute() para POST/PUT a /api/atributos/:id
 * - Reemplazar deleteAttribute() para DELETE /api/atributos/:id
 * 
 * ESTRUCTURA DE DATOS:
 * {
 *   id: number (PK),
 *   nombre: string (nombre del atributo),
 *   tipo: 'select' | 'text' | 'number' (tipo de dato),
 *   valores: string (valores separados por comas, sin espacios),
 *   activo: boolean (estado del atributo),
 *   createdAt?: timestamp (para auditoría),
 *   updatedAt?: timestamp (para auditoría)
 * }
 */
export const ATTRIBUTES_MOCK = [
  { 
    id: 1, 
    nombre: 'Talla', 
    tipo: 'select', 
    valores: 'XS,S,M,L,XL,XXL',
    activo: true,
    createdAt: '2026-04-11T10:00:00Z',
    updatedAt: '2026-04-11T10:00:00Z'
  },
  { 
    id: 2, 
    nombre: 'Color', 
    tipo: 'select', 
    valores: 'Negro,Blanco,Gris,Azul,Rojo,Verde',
    activo: true,
    createdAt: '2026-04-11T10:00:00Z',
    updatedAt: '2026-04-11T10:00:00Z'
  }
];
