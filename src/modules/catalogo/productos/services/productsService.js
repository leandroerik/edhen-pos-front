/**
 * Service para Productos
 * Maneja las llamadas a la API (mock por ahora)
 */
import { toast } from 'react-hot-toast';
import { PRODUCTS_MOCK } from '../mocks/productsMocks';

// Estado en memoria para guardar productos con variantes
let productsInMemory = JSON.parse(JSON.stringify(PRODUCTS_MOCK));

/**
 * Obtener todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export const fetchProducts = async () => {
  try {
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return productsInMemory;
  } catch (error) {
    toast.error('Error al obtener productos');
    throw error;
  }
};

/**
 * Guardar o actualizar un producto
 * @param {Object} formData - Datos del producto
 * @param {number|null} editingId - ID del producto si se está editando
 * @returns {Promise<Object>} Producto guardado
 */
export const saveProduct = async (formData, editingId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (editingId) {
      // Actualizar producto existente
      const productIndex = productsInMemory.findIndex(p => p.id === editingId);
      if (productIndex !== -1) {
        productsInMemory[productIndex] = { ...formData, id: editingId };
        console.log('✓ Producto actualizado en memoria:', productsInMemory[productIndex]);
        return productsInMemory[productIndex];
      }
      return { ...formData, id: editingId };
    } else {
      // Crear nuevo producto
      const newProduct = { 
        ...formData, 
        id: Math.max(...productsInMemory.map(p => p.id), 0) + 1 
      };
      productsInMemory.push(newProduct);
      console.log('✓ Producto creado en memoria:', newProduct);
      return newProduct;
    }
  } catch (error) {
    toast.error('Error al guardar producto');
    throw error;
  }
};

/**
 * Eliminar un producto
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 150));
    productsInMemory = productsInMemory.filter(p => p.id !== id);
    console.log('✓ Producto eliminado. Productos restantes:', productsInMemory);
  } catch (error) {
    toast.error('Error al eliminar producto');
    throw error;
  }
};
