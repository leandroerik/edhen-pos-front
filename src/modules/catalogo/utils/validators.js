/**
 * Validadores comunes para el Catálogo
 */

export const validaciones = {
  nombre: (valor) => {
    if (!valor || valor.trim().length === 0) {
      return 'El nombre es requerido';
    }
    if (valor.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (valor.length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    return '';
  },

  descripcion: (valor) => {
    if (valor && valor.length > 500) {
      return 'La descripción no puede exceder 500 caracteres';
    }
    return '';
  },

  precio: (valor) => {
    const numValue = parseFloat(valor);
    if (isNaN(numValue) || numValue < 0) {
      return 'Debe ser un número positivo';
    }
    return '';
  },

  cantidad: (valor) => {
    const numValue = parseInt(valor, 10);
    if (isNaN(numValue) || numValue < 0) {
      return 'Debe ser un número positivo entero';
    }
    return '';
  }
};

/**
 * Valida un objeto completo
 * @param {Object} data - Datos a validar
 * @param {Object} fieldValidations - Mapeo de campos a validadores
 * @returns {Object} Errores encontrados
 */
export const validateObject = (data, fieldValidations) => {
  const errors = {};

  Object.entries(fieldValidations).forEach(([field, validator]) => {
    const error = validator(data[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};
