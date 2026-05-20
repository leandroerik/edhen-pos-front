import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  getTransportes,
  createTransporte,
  updateTransporte,
  deleteTransporte,
  searchTransportes
} from '../services/transportesService';

/**
 * Hook personalizado para gestión de transportistas
 * Maneja estado, operaciones CRUD y búsqueda
 */
export const useTransportes = () => {
  const [transportes, setTransportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar transportistas al inicializar
  useEffect(() => {
    loadTransportes();
  }, []);

  /**
   * Cargar todos los transportistas
   */
  const loadTransportes = async () => {
    setLoading(true);
    try {
      const data = await getTransportes();
      setTransportes(data);
    } catch (error) {
      toast.error('Error al cargar transportistas');
      console.error('Error loading transportes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear nuevo transportista
   */
  const handleCreate = async (transporteData) => {
    try {
      const newTransporte = await createTransporte(transporteData);
      setTransportes(prev => [...prev, newTransporte]);
      toast.success('Transportista creado exitosamente');
      return newTransporte;
    } catch (error) {
      toast.error('Error al crear transportista');
      console.error('Error creating transporte:', error);
      throw error;
    }
  };

  /**
   * Actualizar transportista existente
   */
  const handleUpdate = async (id, updates) => {
    try {
      const updatedTransporte = await updateTransporte(id, updates);
      if (updatedTransporte) {
        setTransportes(prev =>
          prev.map(t => t.id === id ? updatedTransporte : t)
        );
        toast.success('Transportista actualizado exitosamente');
        return updatedTransporte;
      } else {
        toast.error('Transportista no encontrado');
        return null;
      }
    } catch (error) {
      toast.error('Error al actualizar transportista');
      console.error('Error updating transporte:', error);
      throw error;
    }
  };

  /**
   * Alternar estado activo/inactivo de un transportista
   */
  const handleToggleActive = async (id) => {
    try {
      const transporte = transportes.find(t => t.id === id);
      if (!transporte) {
        toast.error('Transportista no encontrado');
        return;
      }

      const updatedTransporte = await updateTransporte(id, { activo: !transporte.activo });
      if (updatedTransporte) {
        setTransportes(prev =>
          prev.map(t => t.id === id ? updatedTransporte : t)
        );
        toast.success(`Transportista ${updatedTransporte.activo ? 'activado' : 'desactivado'}`);
      }
    } catch (error) {
      toast.error('Error al cambiar estado del transportista');
      console.error('Error toggling transporte active state:', error);
    }
  };

  /**
   * Buscar transportistas
   */
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      await loadTransportes();
      return;
    }

    setLoading(true);
    try {
      const filtered = await searchTransportes(term);
      setTransportes(filtered);
    } catch (error) {
      toast.error('Error en la búsqueda');
      console.error('Error searching transportes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar transportista
   */
  const handleDelete = async (id) => {
    try {
      await deleteTransporte(id);
      setTransportes(prev => prev.filter(t => t.id !== id));
      toast.success('Transportista eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar transportista');
      console.error('Error deleting transporte:', error);
      throw error;
    }
  };

  /**
   * Limpiar búsqueda
   */
  const clearSearch = () => {
    setSearchTerm('');
    loadTransportes();
  };

  return {
    // Estado
    transportes,
    loading,
    searchTerm,

    // Acciones
    loadTransportes,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    handleSearch,
    clearSearch,

    // Utilidades
    isEmpty: transportes.length === 0,
    totalCount: transportes.length,
    activeCount: transportes.filter(t => t.activo).length,
    inactiveCount: transportes.filter(t => !t.activo).length
  };
};
