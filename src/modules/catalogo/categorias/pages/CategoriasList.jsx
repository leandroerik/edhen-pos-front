import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCategories } from '../hooks/useCategories';
import CategoriesForm, { FORM_INICIAL } from '../components/CategoriesForm';
import { CatalogoTable, SearchFilterBar, ConfirmDeleteModal } from '../../components';

const CategoriasList = () => {
  const { categories, loading, crear, actualizar, eliminar, toggleActivo } = useCategories();

  const [searchTerm, setSearchTerm]             = useState('');
  const [showModal, setShowModal]               = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData]                 = useState(FORM_INICIAL);
  const [errors, setErrors]                     = useState({});
  const [saving, setSaving]                     = useState(false);
  const [confirmEliminar, setConfirmEliminar]   = useState(null);

  const filtradas = categories.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = () => {
    const e = {};
    if (!formData.nombre.trim() || formData.nombre.trim().length < 2)
      e.nombre = 'El nombre debe tener al menos 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const abrirCrear = () => {
    setEditingCategoria(null);
    setFormData(FORM_INICIAL);
    setErrors({});
    setShowModal(true);
  };

  const abrirEditar = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre:      categoria.nombre      || '',
      descripcion: categoria.descripcion || '',
      icono:       categoria.icono       || 'fa-cube',
      activo:      categoria.activo      ?? true,
    });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setErrors({});
  };

  const handleGuardar = async () => {
    if (!validar()) {
      toast.error('Corregí los errores antes de guardar');
      return;
    }
    setSaving(true);
    try {
      if (editingCategoria) {
        actualizar(editingCategoria.id, formData);
      } else {
        crear(formData);
      }
      cerrarModal();
    } catch {
      toast.error('Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    if (!confirmEliminar) return;
    try {
      eliminar(confirmEliminar.id);
    } catch {
      toast.error('Error al eliminar la categoría');
    } finally {
      setConfirmEliminar(null);
    }
  };

  const columns = [
    {
      key: 'icono',
      label: '',
      width: '6%',
      render: (value) => (
        <div className="text-center">
          <i className={`fa ${value || 'fa-cube'} fa-lg text-primary`}></i>
        </div>
      ),
    },
    { key: 'nombre',      label: 'Categoría',   width: '25%' },
    { key: 'descripcion', label: 'Descripción',  width: '40%' },
    {
      key: 'activo',
      label: 'Estado',
      width: '15%',
      render: (value, row) => (
        <span
          onClick={() => toggleActivo(row)}
          style={{ cursor: 'pointer' }}
          className={`badge rounded-pill px-3 py-2 ${value ? 'text-bg-success' : 'text-bg-secondary'}`}
        >
          {value ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-3 pb-2 border-bottom">
        <div className="col-md-8">
          <h1 className="h3 fw-bold mb-1">
            <i className="fa fa-shirt me-3 text-primary"></i>Categorías
          </h1>
          <p className="text-muted mb-0 small">Organizá el catálogo de prendas por categoría</p>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn btn-primary" onClick={abrirCrear} disabled={loading}>
            <i className="fa fa-plus me-2"></i>Nueva Categoría
          </button>
        </div>
      </div>

      <div className="mb-3">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar por nombre o descripción..."
        />
      </div>

      <CatalogoTable
        data={filtradas}
        columns={columns}
        loading={loading}
        onEdit={abrirEditar}
        onDelete={(id) => {
          const categoria = filtradas.find((c) => c.id === id);
          if (categoria) setConfirmEliminar(categoria);
        }}
      />

      {showModal && (
        <CategoriesForm
          editingId={editingCategoria?.id}
          formData={formData}
          onChange={handleChange}
          errors={errors}
          onSave={handleGuardar}
          onCancel={cerrarModal}
          loading={saving}
        />
      )}

      {confirmEliminar && (
        <ConfirmDeleteModal
          nombre={confirmEliminar.nombre}
          entidad="categoría"
          onConfirm={handleEliminar}
          onCancel={() => setConfirmEliminar(null)}
        />
      )}
    </div>
  );
};

export default CategoriasList;
