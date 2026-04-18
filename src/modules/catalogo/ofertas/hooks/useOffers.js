/**
 * Hook personalizado para la lógica de Ofertas
 * Maneja estado, validaciones y llamadas al servicio
 */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchOffers, saveOffer, deleteOffer } from '../services/offersService';
import { fetchProducts } from '../../productos/services/productsService';
import { usePagination, useSearchFilter } from '../../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../../utils/validators';

export const useOffers = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    productoId: '',
    varianteId: '',
    precioOferta: '',
    stockOferta: '',
    fechaInicio: '',
    fechaFin: '',
    activo: true
  });
  const [errors, setErrors] = useState({});

  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(offers);
  const pagination = usePagination(filteredItems, 10);

  // Cargar ofertas y productos al montar
  useEffect(() => {
    loadOffersData();
    loadProductsData();
  }, []);

  const loadProductsData = async () => {
    try {
      const productData = await fetchProducts();
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    }
  };

  const loadOffersData = async () => {
    setLoading(true);
    try {
      const data = await fetchOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
      toast.error('Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const fieldValidations = {
      nombre: validaciones.nombre,
      precioOferta: validaciones.precio,
      stockOferta: validaciones.precio
    };
    const newErrors = validateObject(formData, fieldValidations);

    if (!formData.productoId) {
      newErrors.productoId = 'Selecciona un producto';
    }
    if (formData.productoId && products.find(p => p.id === Number(formData.productoId))?.variants?.length > 0 && !formData.varianteId) {
      newErrors.varianteId = 'Selecciona una variante';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }

    try {
      const savedOffer = await saveOffer(formData, editingId);
      
      if (editingId) {
        setOffers(prev => 
          prev.map(o => o.id === editingId ? savedOffer : o)
        );
        toast.success('Oferta actualizada');
      } else {
        setOffers(prev => [...prev, savedOffer]);
        toast.success('Oferta creada');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await deleteOffer(id);
        setOffers(prev => prev.filter(o => o.id !== id));
        toast.success('Oferta eliminada');
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error('Error al eliminar');
      }
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      ...offer,
      productoId: offer.productoId || '',
      varianteId: offer.varianteId || '',
      precioOferta: offer.precioOferta || '',
      stockOferta: offer.stockOferta || ''
    });
    setEditingId(offer.id);
    setShowModal(true);
  };

  const handleToggleActive = async (id, activo) => {
    try {
      setOffers(prev => prev.map(offer => offer.id === id ? { ...offer, activo } : offer));
      const offerToUpdate = offers.find(offer => offer.id === id);
      if (!offerToUpdate) return;
      await saveOffer({ ...offerToUpdate, activo }, id);
      toast.success(activo ? 'Oferta activada' : 'Oferta desactivada');
    } catch (error) {
      console.error('Error toggling offer state:', error);
      toast.error('Error al cambiar estado de la oferta');
      setOffers(prev => prev.map(offer => offer.id === id ? { ...offer, activo: !activo } : offer));
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
      productoId: '',
      varianteId: '',
      precioOferta: '',
      stockOferta: '',
      fechaInicio: '',
      fechaFin: '',
      activo: true
    });
    setEditingId(null);
    setErrors({});
  };

  return {
    offers,
    products,
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
    handleToggleActive,
    validateForm
  };
};
