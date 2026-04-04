// Validadores reutilizables

export const validadores = {
  // Validar email
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Validar teléfono (formato básico)
  telefono: (telefono) => {
    const regex = /^[\d\s\-\(\)\+]+$/;
    return regex.test(telefono) && telefono.replace(/\D/g, '').length >= 7;
  },

  // Validar que no esté vacío
  requerido: (valor) => {
    return valor && valor.toString().trim().length > 0;
  },

  // Validar número positivo
  numeroPositivo: (valor) => {
    const num = parseFloat(valor);
    return !isNaN(num) && num > 0;
  },

  // Validar entero positivo
  enteroPositivo: (valor) => {
    const num = parseInt(valor);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
  },

  // Validar longitud mínima
  longitudMinima: (valor, minimo) => {
    return valor && valor.toString().trim().length >= minimo;
  },

  // Validar longitud máxima
  longitudMaxima: (valor, maximo) => {
    return valor && valor.toString().trim().length <= maximo;
  },
};

// Mensajes de error personalizados
export const mensajesError = {
  email: 'Por favor ingresa un email válido',
  telefono: 'Por favor ingresa un teléfono válido',
  requerido: 'Este campo es obligatorio',
  numeroPositivo: 'Por favor ingresa un número positivo',
  enteroPositivo: 'Por favor ingresa un número entero positivo',
  longitudMinima: (minimo) => `Mínimo ${minimo} caracteres requeridos`,
  longitudMaxima: (maximo) => `Máximo ${maximo} caracteres permitidos`,
};
