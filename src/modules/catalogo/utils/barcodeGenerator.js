/**
 * Utilidad para generar códigos de barras EAN-13
 */

/**
 * Calcula el dígito verificador para EAN-13
 * @param {string} code - Primeros 12 dígitos
 * @returns {number} Dígito verificador
 */
const calculateCheckDigit = (code) => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
};

/**
 * Genera un código de barras EAN-13 único
 * @returns {string} Código EAN-13 de 13 dígitos
 */
export const generateBarcode = () => {
  // Generar 12 dígitos aleatorios
  const randomPart = Array.from({ length: 12 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  
  // Calcular dígito verificador
  const checkDigit = calculateCheckDigit(randomPart);
  
  // Retornar código completo
  return randomPart + checkDigit;
};

/**
 * Valida si un código EAN-13 es válido
 * @param {string} code - Código a validar
 * @returns {boolean} True si es válido
 */
export const validateBarcode = (code) => {
  // Verificar que sean exactamente 13 dígitos
  if (!/^\d{13}$/.test(code)) {
    return false;
  }
  
  // Calcular dígito verificador
  const checkDigit = calculateCheckDigit(code.substring(0, 12));
  
  // Comparar con el último dígito
  return parseInt(code[12]) === checkDigit;
};

/**
 * Formatea un código de barras para mostrar
 * @param {string} code - Código sin formato
 * @returns {string} Código formateado: XXXX-XXXX-XXXX-X
 */
export const formatBarcode = (code) => {
  if (!code || code.length !== 13) return code;
  return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}-${code[12]}`;
};
