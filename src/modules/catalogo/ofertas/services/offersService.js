/**
 * Service para Ofertas
 * Maneja las llamadas a la API (mock por ahora)
 */
import { toast } from 'react-hot-toast';
import { OFFERS_MOCK } from '../mocks/offersMocks';

/**
 * Obtener todas las ofertas
 * @returns {Promise<Array>} Lista de ofertas
 */
export const fetchOffers = async () => {
  try {
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return OFFERS_MOCK;
  } catch (error) {
    toast.error('Error al obtener ofertas');
    throw error;
  }
};

/**
 * Guardar o actualizar una oferta
 * @param {Object} formData - Datos de la oferta
 * @param {number|null} editingId - ID de la oferta si se está editando
 * @returns {Promise<Object>} Oferta guardada
 */
export const saveOffer = async (formData, editingId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (editingId) {
      return { ...formData, id: editingId };
    } else {
      return { ...formData, id: Date.now() };
    }
  } catch (error) {
    toast.error('Error al guardar oferta');
    throw error;
  }
};

/**
 * Eliminar una oferta
 * @param {number} id - ID de la oferta a eliminar
 * @returns {Promise<void>}
 */
export const deleteOffer = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 150));
  } catch (error) {
    toast.error('Error al eliminar oferta');
    throw error;
  }
};
