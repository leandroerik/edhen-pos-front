import type { Cliente } from '../../../types/cliente'

export const clientesMock: Cliente[] = [
  {
    id: 1,
    nombre: 'Marisa',
    apellido: 'Fernández',
    tipo: 'MAYORISTA',
    telefono: '3814001122',
    email: 'marisa.fernandez@example.com',
    dni: '28444555',
    fechaRegistro: '2025-11-03T12:00:00.000Z',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Julieta',
    apellido: 'Gómez',
    tipo: 'MINORISTA',
    telefono: '3815552233',
    fechaRegistro: '2026-01-15T12:00:00.000Z',
    activo: true,
  },
  {
    id: 3,
    nombre: 'Textiles del Norte',
    apellido: 'S.R.L.',
    tipo: 'MAYORISTA',
    telefono: '3813009988',
    email: 'compras@textilesdelnorte.com.ar',
    dni: '30712345678',
    fechaRegistro: '2025-09-20T12:00:00.000Z',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Romina',
    apellido: 'Acosta',
    tipo: 'OTRO',
    telefono: '3816667788',
    fechaRegistro: '2026-02-01T12:00:00.000Z',
    activo: true,
  },
]
