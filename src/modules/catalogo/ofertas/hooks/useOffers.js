import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchOffers, saveOffer, deleteOffer } from '../services/offersService';

const FORM_INICIAL = {
  nombre:        '',
  descripcion:   '',
  productoId:    '',
  varianteId:    '',
  descuento:     '',
  tipoDescuento: 'porcentaje',
  precioOferta:  '',
  stockOferta:   '',
  fechaInicio:   '',
  fechaFin:      '',
  activo:        true,
};

const MOCK_PRODUCTOS = [
  {
    id: 1, nombre: 'Remera Básica', precioBase: 29.99,
    variants: [
      { variantId: '1-M-Negro',  Talla: 'M', Color: 'Negro',  stock: 10, precio: 29.99 },
      { variantId: '1-M-Blanco', Talla: 'M', Color: 'Blanco', stock: 15, precio: 29.99 },
      { variantId: '1-L-Negro',  Talla: 'L', Color: 'Negro',  stock: 12, precio: 29.99 },
    ],
  },
  {
    id: 2, nombre: 'Buzo Oversize', precioBase: 49.99,
    variants: [
      { variantId: '2-S', Talla: 'S', stock: 5,  precio: 49.99 },
      { variantId: '2-M', Talla: 'M', stock: 8,  precio: 49.99 },
      { variantId: '2-L', Talla: 'L', stock: 12, precio: 49.99 },
    ],
  },
];

export const useOffers = () => {
  const [offers,     setOffers]     = useState([]);
  const [products]                  = useState(MOCK_PRODUCTOS);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [errors,     setErrors]     = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { cargarOfertas(); }, []);

  const cargarOfertas = async () => {
    setLoading(true);
    try {
      setOffers(await fetchOffers());
    } catch {
      toast.error('Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear = () => {
    setEditingId(null);
    setFormData(FORM_INICIAL);
    setErrors({});
    setShowModal(true);
  };

  const abrirEditar = (offer) => {
    setEditingId(offer.id);
    setFormData({
      nombre:        offer.nombre        || '',
      descripcion:   offer.descripcion   || '',
      productoId:    offer.productoId    || '',
      varianteId:    offer.varianteId    || '',
      descuento:     offer.descuento     ?? '',
      tipoDescuento: offer.tipoDescuento || 'porcentaje',
      precioOferta:  offer.precioOferta  || '',
      stockOferta:   offer.stockOferta   || '',
      fechaInicio:   offer.fechaInicio   || '',
      fechaFin:      offer.fechaFin      || '',
      activo:        offer.activo        ?? true,
    });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingId(null);
    setErrors({});
  };

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
      ...(campo === 'productoId' ? { varianteId: '' } : {}),
    }));
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const handleGuardar = async (finalData) => {
    const e = {};
    if (!finalData.nombre?.trim() || finalData.nombre.trim().length < 2)
      e.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!finalData.productoId)
      e.productoId = 'Seleccioná un producto';
    const prod = products.find((p) => p.id === Number(finalData.productoId));
    if (prod?.variants?.length > 0 && !finalData.varianteId)
      e.varianteId = 'Seleccioná una variante';
    if (!finalData.precioOferta || parseFloat(finalData.precioOferta) <= 0)
      e.precioOferta = 'El precio de oferta es inválido';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Corregí los errores antes de guardar');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveOffer(finalData, editingId);
      if (editingId) {
        setOffers((prev) => prev.map((o) => (o.id === editingId ? saved : o)));
        toast.success('Oferta actualizada');
      } else {
        setOffers((prev) => [...prev, saved]);
        toast.success('Oferta creada');
      }
      cerrarModal();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteOffer(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
      toast.success('Oferta eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const toggleActivo = async (offer) => {
    const next = { ...offer, activo: !offer.activo };
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? next : o)));
    try {
      await saveOffer(next, offer.id);
    } catch {
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? offer : o)));
      toast.error('Error al actualizar');
    }
  };

  const filtrados = offers.filter((o) =>
    o.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    offers: filtrados,
    products,
    loading,
    saving,
    showModal,
    editingId,
    formData,
    errors,
    searchTerm,
    setSearchTerm,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    handleChange,
    handleGuardar,
    handleEliminar,
    toggleActivo,
  };
};
