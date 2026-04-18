/**
 * Service para Atributos - BACKEND READY
 * 
 * Este archivo está preparado para integración con API REST.
 * Actualmente usa datos mock, pero la estructura permite reemplazar fácilmente
 * las funciones por llamadas HTTP.
 * 
 * ========================================================================
 * IMPLEMENTACIÓN DE BACKEND (Pasos para integración):
 * ========================================================================
 * 
 * 1. Instalar axios (si no está):
 *    npm install axios
 * 
 * 2. Descomentar las importaciones de axios
 * 
 * 3. Reemplazar cada función mock con la llamada HTTP correspondiente
 *    (Ver ejemplos de código comentados abajo)
 * 
 * 4. Endpoints esperados en backend:
 *    - GET    /api/atributos             → Obtener todos
 *    - POST   /api/atributos             → Crear nuevo
 *    - PUT    /api/atributos/:id         → Actualizar
 *    - DELETE /api/atributos/:id         → Eliminar
 *    - PATCH  /api/atributos/:id/valores → Actualizar solo valores
 *    - PATCH  /api/atributos/:id/estado  → Actualizar solo estado
 * ========================================================================
 */

import { toast } from 'react-hot-toast';
import { ATTRIBUTES_MOCK } from '../mocks/attributesMocks';

// DESCOMENTAR PARA BACKEND:
// import axios from 'axios';
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Obtener todos los atributos
 * @returns {Promise<Array>} Lista de atributos con estructura: { id, nombre, tipo, valores, activo, createdAt, updatedAt }
 */
export const fetchAttributes = async () => {
  try {
    // ==================== VERSIÓN MOCK (ACTUAL) ====================
    await new Promise(resolve => setTimeout(resolve, 300));
    return ATTRIBUTES_MOCK;
    
    // ==================== VERSIÓN BACKEND (DESCOMENTA CUANDO ESTÉ LISTO) ====================
    // const response = await axios.get(`${API_BASE_URL}/api/atributos`);
    // return response.data;
    
  } catch (error) {
    const message = error.response?.data?.message || 'Error al obtener atributos';
    toast.error(message);
    console.error('fetchAttributes error:', error);
    throw error;
  }
};

/**
 * Guardar o actualizar un atributo
 * 
 * @param {Object} formData - Datos del atributo
 *   - nombre: string (ej: "Talla")
 *   - tipo: 'select' | 'text' | 'number'
 *   - valores: string (valores separados por comas, ej: "XS,S,M,L,XL")
 * 
 * @param {number|null} editingId - ID del atributo si se está editando (null si es nuevo)
 * 
 * @returns {Promise<Object>} Atributo guardado con estructura: { id, nombre, tipo, valores, activo, createdAt, updatedAt }
 */
export const saveAttribute = async (formData, editingId) => {
  try {
    // ==================== VERSIÓN MOCK (ACTUAL) ====================
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date().toISOString();
    
    if (editingId) {
      // Actualizar atributo existente
      return { 
        ...formData, 
        id: editingId,
        updatedAt: now
      };
    } else {
      // Crear nuevo atributo
      return { 
        ...formData, 
        id: Date.now(),
        activo: true,
        createdAt: now,
        updatedAt: now
      };
    }
    
    // ==================== VERSIÓN BACKEND (DESCOMENTA CUANDO ESTÉ LISTO) ====================
    // if (editingId) {
    //   // PUT (reemplaza todo) o PATCH (solo campos que cambiaron)
    //   const response = await axios.put(`${API_BASE_URL}/api/atributos/${editingId}`, formData);
    //   return response.data;
    // } else {
    //   // POST para crear nuevo
    //   const response = await axios.post(`${API_BASE_URL}/api/atributos`, formData);
    //   return response.data;
    // }
    
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar atributo';
    toast.error(message);
    console.error('saveAttribute error:', error);
    throw error;
  }
};

/**
 * Eliminar un atributo
 * @param {number} id - ID del atributo a eliminar
 * @returns {Promise<void>}
 */
export const deleteAttribute = async (id) => {
  try {
    // ==================== VERSIÓN MOCK (ACTUAL) ====================
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // ==================== VERSIÓN BACKEND (DESCOMENTA CUANDO ESTÉ LISTO) ====================
    // await axios.delete(`${API_BASE_URL}/api/atributos/${id}`);
    
  } catch (error) {
    const message = error.response?.data?.message || 'Error al eliminar atributo';
    toast.error(message);
    console.error('deleteAttribute error:', error);
    throw error;
  }
};

/**
 * MÉTODOS OPCIONALES PARA OPERACIONES ESPECÍFICAS
 * Estos métodos son opcionales. Se pueden usar en lugar de saveAttribute
 * si el backend soporta PATCH para actualizaciones parciales.
 */

/**
 * Actualizar solo los valores de un atributo (operación parcial)
 * @param {number} id - ID del atributo
 * @param {string} nuevoValores - Valores separados por comas
 * @returns {Promise<Object>} Atributo actualizado
 */
export const updateAttributeValores = async (id, nuevoValores) => {
  try {
    // ==================== VERSIÓN MOCK ====================
    await new Promise(resolve => setTimeout(resolve, 150));
    return { id, valores: nuevoValores };
    
    // ==================== VERSIÓN BACKEND (OPCIONAL) ====================
    // const response = await axios.patch(`${API_BASE_URL}/api/atributos/${id}/valores`, {
    //   valores: nuevoValores
    // });
    // return response.data;
    
  } catch (error) {
    toast.error('Error al actualizar valores');
    console.error('updateAttributeValores error:', error);
    throw error;
  }
};

/**
 * Actualizar solo el estado (activo/inactivo) de un atributo
 * @param {number} id - ID del atributo
 * @param {boolean} activo - Nuevo estado
 * @returns {Promise<Object>} Atributo actualizado
 */
export const updateAttributeEstado = async (id, activo) => {
  try {
    // ==================== VERSIÓN MOCK ====================
    await new Promise(resolve => setTimeout(resolve, 150));
    return { id, activo };
    
    // ==================== VERSIÓN BACKEND (OPCIONAL) ====================
    // const response = await axios.patch(`${API_BASE_URL}/api/atributos/${id}/estado`, {
    //   activo
    // });
    // return response.data;
    
  } catch (error) {
    toast.error('Error al actualizar estado');
    console.error('updateAttributeEstado error:', error);
    throw error;
  }
};
