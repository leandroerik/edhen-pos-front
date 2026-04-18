import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { usePagination, useSearchFilter } from '../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../utils/validators';
import styles from './AttributesPage.module.css';

/**
 * Página de Gestión de Atributos
 * ABM de atributos de productos (Tamaño, Color, etc)
 * @component
 */
const AttributesPage = () => {
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

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '30%' },
    { 
      key: 'tipo', 
      label: 'Tipo', 
      width: '20%',
      render: (value) => (
        <span className="badge bg-secondary">{value}</span>
      )
    },
    { key: 'valores', label: 'Valores', width: '25%' },
    { 
      key: 'activo', 
      label: 'Estado', 
      width: '15%',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    setLoading(true);
    try {
      setAttributes([
        { 
          id: 1, 
          nombre: 'Color', 
          tipo: 'select', 
          valores: 'Rojo, Azul, Verde, Negro',
          activo: true 
        },
        { 
          id: 2, 
          nombre: 'Tamaño', 
          tipo: 'select', 
          valores: 'XS, S, M, L, XL, XXL',
          activo: true 
        }
      ]);
    } catch (error) {
      toast.error('Error al cargar atributos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const fieldValidations = {
      nombre: validaciones.nombre
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
      if (editingId) {
        setAttributes(prev => 
          prev.map(a => a.id === editingId ? { ...a, ...formData } : a)
        );
        toast.success('Atributo actualizado');
      } else {
        setAttributes(prev => [...prev, { ...formData, id: Date.now() }]);
        toast.success('Atributo creado');
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

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

  const handleEdit = (attribute) => {
    setFormData(attribute);
    setEditingId(attribute.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro?')) {
      setAttributes(prev => prev.filter(a => a.id !== id));
      toast.success('Atributo eliminado');
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className="h4 mb-0">
            <i className="fa fa-tag me-2"></i>
            Atributos
          </h2>
          <p className="text-muted small mb-0">Gestión de atributos de productos</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleOpenModal}
        >
          <i className="fa fa-plus me-2"></i>
          Nuevo Atributo
        </button>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />

      <CatalogoTable
        columns={columns}
        data={pagination.paginatedItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.handlePageChange}
        onPageSizeChange={pagination.handlePageSizeChange}
      />

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? 'Editar Atributo' : 'Nuevo Atributo'}
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                  {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="select">Selección</option>
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Valores (separados por comas)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.valores}
                    onChange={(e) => setFormData({...formData, valores: e.target.value})}
                    placeholder="Ej: Rojo, Azul, Verde"
                  />
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="activo">
                    Atributo Activo
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributesPage;
