import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchAttributes, saveAttribute, deleteAttribute } from '../services/attributesService';

const FORM_INICIAL = { nombre: '', valores: '', activo: true };

export const useAttributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [errors,     setErrors]     = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { cargarAtributos(); }, []);

  const cargarAtributos = async () => {
    setLoading(true);
    try {
      setAttributes(await fetchAttributes());
    } catch {
      toast.error('Error al cargar atributos');
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

  const abrirEditar = (attr) => {
    setEditingId(attr.id);
    setFormData({ nombre: attr.nombre, valores: attr.valores || '', activo: attr.activo ?? true });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingId(null);
    setErrors({});
  };

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const handleGuardar = async (finalData) => {
    const e = {};
    if (!finalData.nombre?.trim() || finalData.nombre.trim().length < 2)
      e.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!finalData.valores?.trim())
      e.valores = 'Agregá al menos un valor';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Corregí los errores antes de guardar');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveAttribute(finalData, editingId);
      if (editingId) {
        setAttributes((prev) => prev.map((a) => (a.id === editingId ? saved : a)));
        toast.success('Atributo actualizado');
      } else {
        setAttributes((prev) => [...prev, saved]);
        toast.success('Atributo creado');
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
      await deleteAttribute(id);
      setAttributes((prev) => prev.filter((a) => a.id !== id));
      toast.success('Atributo eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const toggleActivo = async (attr) => {
    try {
      const updated = await saveAttribute({ ...attr, activo: !attr.activo }, attr.id);
      setAttributes((prev) => prev.map((a) => (a.id === attr.id ? updated : a)));
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const filtrados = attributes.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    attributes: filtrados,
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
