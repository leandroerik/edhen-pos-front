/**
 * Service para Variantes de Productos
 * Maneja las variantes y combinaciones de atributos
 */
import { PRODUCT_VARIANTS_MOCK } from '../mocks/productsMocks';

/**
 * Obtener todas las variantes de un producto
 * @param {number} productId - ID del producto
 * @returns {Promise<Array>} Lista de variantes
 */
export const fetchProductVariants = async (productId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    return PRODUCT_VARIANTS_MOCK[productId] || [];
  } catch (error) {
    console.error('Error fetching variants:', error);
    throw error;
  }
};

/**
 * Generar todas las combinaciones de variantes posibles
 * @param {Array} selectedAttributes - Atributos seleccionados [{ nombre: 'talla', valores: ['S', 'M', 'L'] }]
 * @returns {Array} Array de combinaciones posibles
 */
export const generateVariantCombinations = (selectedAttributes) => {
  if (!selectedAttributes || selectedAttributes.length === 0) return [];

  const combinations = [];
  
  // Obtener los valores de cada atributo
  const attributeValues = selectedAttributes.map(attr => ({
    nombre: attr.nombre,
    valores: attr.valores.split(',').map(v => v.trim())
  }));

  // Generar combinaciones recursivamente
  const generateCombos = (index, currentCombo) => {
    if (index === attributeValues.length) {
      combinations.push({ ...currentCombo });
      return;
    }

    const { nombre, valores } = attributeValues[index];
    valores.forEach(valor => {
      generateCombos(index + 1, { ...currentCombo, [nombre]: valor });
    });
  };

  generateCombos(0, {});
  return combinations;
};

/**
 * Guardar variantes de un producto
 * @param {number} productId - ID del producto
 * @param {Array} variants - Array de variantes con stock
 * @returns {Promise<void>}
 */
export const saveProductVariants = async (productId, variants) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    // En producción, aquí iría la llamada POST a la API
  } catch (error) {
    console.error('Error saving variants:', error);
    throw error;
  }
};
