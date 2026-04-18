import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { usePagination, useSearchFilter } from '../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../utils/validators';
import styles from './CategoriesPage.module.css';

/**
 * Página de Gestión de Categorías
 * ABM (Alta, Baja, Modificación) de categorías
 * @component
 */
const CategoriesPage = () => {
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

  // Hooks de búsqueda y paginación
  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(categories);
  const pagination = usePagination(filteredItems, 10);

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '30%' },
    { key: 'descripcion', label: 'Descripción', width: '35%' },
    { 
      key: 'activo', 
      label: 'Estado', 
      width: '15%',
      render: (value) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
          {value ? 'Activa' : 'Inactiva'}
        </span>
      )
    }
  ];

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Datos de prueba
      setCategories([
        { id: 1, nombre: 'Electrónica', descripcion: 'Productos electrónicos', icono: 'fa-microchip', activo: true },
        { id: 2, nombre: 'Ropa', descripcion: 'Prendas de vestir', icono: 'fa-shirt', activo: true },
        { id: 3, nombre: 'Deportes', descripcion: 'Equipamiento deportivo', icono: 'fa-dumbbell', activo: false }
      ]);
    } catch (error) {
      toast.error('Error al cargar categorías');
      console.error(error);
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
      if (editingId) {
        setCategories(prev => 
          prev.map(c => c.id === editingId ? { ...c, ...formData } : c)
        );
        toast.success('Categoría actualizada');
      } else {
        setCategories(prev => [...prev, { ...formData, id: Date.now() }]);
        toast.success('Categoría creada');
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
      descripcion: '',
      icono: 'fa-cube',
      activo: true
    });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Categoría eliminada');
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className="h4 mb-0">
            <i className="fa fa-list me-2"></i>
            Categorías
          </h2>
          <p className="text-muted small mb-0">Gestión de categorías de productos</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleOpenModal}
        >
          <i className="fa fa-plus me-2"></i>
          Nueva Categoría
        </button>
      </div>

      {/* Búsqueda y Filtros */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />

      {/* Tabla */}
      <CatalogoTable
        columns={columns}
        data={pagination.paginatedItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Paginación */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.handlePageChange}
        onPageSizeChange={pagination.handlePageSizeChange}
      />

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
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
                  <label className="form-label">Descripción</label>
                  <textarea
                    className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                  {errors.descripcion && <div className="invalid-feedback d-block">{errors.descripcion}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Icono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.icono}
                    onChange={(e) => setFormData({...formData, icono: e.target.value})}
                    placeholder="ej: fa-cube"
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="activo">
                      Categoría Activa
                    </label>
                  </div>
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

export default CategoriesPage;
