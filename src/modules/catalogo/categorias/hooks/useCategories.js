/**
 * Hook personalizado para la lógica de Categorías
 * Maneja estado, validaciones y llamadas al servicio
 */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchCategories, saveCategory, deleteCategory } from '../services/categoriesService';
import { usePagination, useSearchFilter } from '../../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../../utils/validators';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: 'fa-cube',
    activo: true
  });
  const [errors, setErrors] = useState({});

  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(categories);
  const pagination = usePagination(filteredItems, 10);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const fieldValidations = {
      nombre: validaciones.nombre,
      descripcion: validaciones.descripcion
    };
    const newErrors = validateObject(formData, fieldValidations);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }

    try {
      const savedCategory = await saveCategory(formData, editingId);
      
      if (editingId) {
        setCategories(prev => 
          prev.map(c => c.id === editingId ? savedCategory : c)
        );
        toast.success('Categoría actualizada');
      } else {
        setCategories(prev => [...prev, savedCategory]);
        toast.success('Categoría creada');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Categoría eliminada');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error al eliminar');
      }
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowModal(true);
  };

  const handleToggleActivo = async (id) => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) return;
      
      const updatedCategory = await saveCategory(
        { ...category, activo: !category.activo },
        id
      );
      
      setCategories(prev => 
        prev.map(c => c.id === id ? updatedCategory : c)
      );
      toast.success(updatedCategory.activo ? 'Categoría activada' : 'Categoría desactivada');
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      icono: 'fa-cube',
      activo: true
    });
    setEditingId(null);
    setErrors({});
  };

  return {
    categories,
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
    handleDelete,
    handleEdit,
    handleOpenModal,
    handleToggleActivo,
    validateForm
  };
};
