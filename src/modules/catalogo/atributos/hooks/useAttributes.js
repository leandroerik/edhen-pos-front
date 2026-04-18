/**
 * Hook personalizado para la lógica de Atributos
 * 
 * BACKEND INTEGRATION NOTES:
 * ============================================================================
 * Este hook está diseñado para funcionar sin cambios cuando el backend esté listo.
 * 
 * El flujo de datos es:
 * 1. Component llama handleSave(), handleUpdateValores(), etc.
 * 2. Hook actualiza estado local (optimistic update)
 * 3. Llama al service (attributesService.js)
 * 4. Service hace la llamada HTTP (cuando backend esté implementado)
 * 5. Hook actualiza estado con respuesta del servidor
 * 
 * CAMBIOS NECESARIOS EN BACKEND:
 * - Ver src/modules/catalogo/atributos/services/attributesService.js
 * - Solo necesitas descomentar las líneas de axios
 * - El hook seguirá funcionando exactamente igual
 * ============================================================================
 * 
 * Maneja estado, validaciones y llamadas al servicio
 */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchAttributes, saveAttribute, deleteAttribute } from '../services/attributesService';
import { usePagination, useSearchFilter } from '../../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../../utils/validators';

export const useAttributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'select',
    valores: '',
    activo: true
  });
  const [errors, setErrors] = useState({});

  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(attributes);
  const pagination = usePagination(filteredItems, 10);

  // Cargar atributos al montar
  useEffect(() => {
    loadAttributesData();
  }, []);

  /**
   * Cargar todos los atributos desde el servicio
   * @async
   */
  const loadAttributesData = async () => {
    setLoading(true);
    try {
      const data = await fetchAttributes();
      setAttributes(data);
    } catch (error) {
      console.error('Error loading attributes:', error);
      toast.error('Error al cargar atributos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validar formulario antes de guardar
   * @returns {boolean} True si es válido
   */
  const validateForm = () => {
    const fieldValidations = {
      nombre: validaciones.nombre
    };
    const newErrors = validateObject(formData, fieldValidations);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Guardar atributo (crear o actualizar)
   * Valida antes de enviar al servicio
   * @async
   */
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }

    // Validar que haya al menos un valor
    if (!formData.valores || formData.valores.trim().length === 0) {
      toast.error('Debes agregar al menos un valor');
      return;
    }

    try {
      const savedAttribute = await saveAttribute(formData, editingId);
      
      if (editingId) {
        setAttributes(prev => 
          prev.map(a => a.id === editingId ? savedAttribute : a)
        );
        toast.success('Atributo actualizado');
      } else {
        setAttributes(prev => [...prev, savedAttribute]);
        toast.success('Atributo creado');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving attribute:', error);
      toast.error('Error al guardar');
    }
  };

  /**
   * Guardar atributo con valores desde TagInput (inline edit)
   * Se usa cuando se editan valores en la tabla
   * @param {string} valoresString - Valores separados por comas
   * @async
   * 
   * BACKEND INTEGRATION:
   * Este método podría usar updateAttributeValores() para operaciones PATCH parciales
   * si el backend las soporta. Por ahora usa saveAttribute() completo.
   */
  const handleSaveWithValues = async (valoresString) => {
    // Crear formData actualizado con los valores
    const updatedFormData = { ...formData, valores: valoresString };

    if (!updatedFormData.nombre || updatedFormData.nombre.trim().length === 0) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!valoresString || valoresString.trim().length === 0) {
      toast.error('Debes agregar al menos un valor');
      return;
    }

    try {
      const savedAttribute = await saveAttribute(updatedFormData, editingId);
      
      if (editingId) {
        setAttributes(prev => 
          prev.map(a => a.id === editingId ? savedAttribute : a)
        );
        toast.success('Atributo actualizado');
      } else {
        setAttributes(prev => [...prev, savedAttribute]);
        toast.success('Atributo creado');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving attribute:', error);
      toast.error('Error al guardar');
    }
  };

  /**
   * Eliminar un atributo
   * Requiere confirmación del usuario
   * @param {number} id - ID del atributo a eliminar
   * @async
   */
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await deleteAttribute(id);
        setAttributes(prev => prev.filter(a => a.id !== id));
        toast.success('Atributo eliminado');
      } catch (error) {
        console.error('Error deleting attribute:', error);
        toast.error('Error al eliminar');
      }
    }
  };

  /**
   * Cargar atributo para edición en el modal
   * @param {Object} attribute - Atributo a editar
   */
  const handleEdit = (attribute) => {
    setFormData(attribute);
    setEditingId(attribute.id);
    setShowModal(true);
  };

  /**
   * Abrir modal para crear nuevo atributo
   */
  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  /**
   * Actualizar valores de un atributo existente
   * Se usa desde ValoresEditableCell en la tabla
   * @param {number} id - ID del atributo
   * @param {string} nuevoValores - Nuevos valores (separados por comas)
   * @async
   * 
   * BACKEND OPTIMIZATION:
   * Podría usar updateAttributeValores() de attributesService para PATCH parcial
   * para solo actualizar el campo 'valores'
   */
  const handleUpdateValores = async (id, nuevoValores) => {
    try {
      const attribute = attributes.find(a => a.id === id);
      const updatedAttribute = await saveAttribute({ ...attribute, valores: nuevoValores }, id);
      setAttributes(prev => 
        prev.map(a => a.id === id ? updatedAttribute : a)
      );
      toast.success('Valores actualizados');
    } catch (error) {
      console.error('Error updating values:', error);
      toast.error('Error al actualizar');
    }
  };

  /**
   * Alternar estado activo/inactivo de un atributo
   * Se usa desde el botón Estado en la tabla
   * @param {number} id - ID del atributo
   * @async
   * 
   * BACKEND OPTIMIZATION:
   * Podría usar updateAttributeEstado() de attributesService para PATCH parcial
   * para solo actualizar el campo 'activo'
   */
  const handleToggleActivo = async (id) => {
    try {
      const attribute = attributes.find(a => a.id === id);
      const updatedAttribute = await saveAttribute({ ...attribute, activo: !attribute.activo }, id);
      setAttributes(prev => 
        prev.map(a => a.id === id ? updatedAttribute : a)
      );
      toast.success(updatedAttribute.activo ? 'Atributo activado' : 'Atributo desactivado');
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('Error al actualizar');
    }
  };

  /**
   * Resetear formulario a valores iniciales
   */
  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'select',
      valores: '',
      activo: true
    });
    setEditingId(null);
    setErrors({});
  };

  return {
    attributes,
    loading,
    showModal,
    setShowModal,
    editingId,
    formData,
    setFormData,
    errors,
    searchTerm,
    setSearchTerm,
    filteredItems,
    pagination,
    handleSave,
    handleSaveWithValues,
    handleDelete,
    handleEdit,
    handleOpenModal,
    handleUpdateValores,
    handleToggleActivo,
    validateForm
  };
};
