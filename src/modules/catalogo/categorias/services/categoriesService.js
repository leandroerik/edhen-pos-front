/**
 * Service para Categorías
 * Maneja las llamadas a la API (mock por ahora)
 */
import { toast } from 'react-hot-toast';
import { CATEGORIES_MOCK } from '../mocks/categoriesMocks';

/**
 * Obtener todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const fetchCategories = async () => {
  try {
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return CATEGORIES_MOCK;
  } catch (error) {
    toast.error('Error al obtener categorías');
    throw error;
  }
};

/**
 * Guardar o actualizar una categoría
 * @param {Object} formData - Datos de la categoría
 * @param {number|null} editingId - ID de la categoría si se está editando
 * @returns {Promise<Object>} Categoría guardada
 */
export const saveCategory = async (formData, editingId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (editingId) {
      return { ...formData, id: editingId };
    } else {
      return { ...formData, id: Date.now() };
    }
  } catch (error) {
    toast.error('Error al guardar categoría');
    throw error;
  }
};

/**
 * Eliminar una categoría
 * @param {number} id - ID de la categoría a eliminar
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 150));
  } catch (error) {
    toast.error('Error al eliminar categoría');
    throw error;
  }
};
