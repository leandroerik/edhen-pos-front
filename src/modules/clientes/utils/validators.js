/**
 * Validadores para Clientes
 */

export const clienteValidadores = {
  nombre: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'El nombre es requerido';
    }
    if (valor.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    return '';
  },

  email: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(valor)) {
      return 'Email no válido';
    }
    return '';
  },

  telefono: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'El teléfono es requerido';
    }
    if (!/^\d{7,15}$/.test(valor.replace(/[-\s.]/g, ''))) {
      return 'Teléfono no válido';
    }
    return '';
  }
};