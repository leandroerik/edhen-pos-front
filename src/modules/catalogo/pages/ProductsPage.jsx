import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { usePagination, useSearchFilter } from '../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../utils/validators';
import styles from './ProductsPage.module.css';

/**
 * Página de Gestión de Productos
 * ABM de productos con variantes y atributos
 * @component
 */
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    precio: '',
    cantidad: '',
    categoria: '',
    descripcion: '',
    activo: true
  });
  const [errors, setErrors] = useState({});

  // Hooks de búsqueda y paginación
  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(products);
  const pagination = usePagination(filteredItems, 10);

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '25%' },
    { key: 'sku', label: 'SKU', width: '15%' },
    { 
      key: 'precio', 
      label: 'Precio', 
      width: '15%',
      render: (value) => `$${value}`
    },
    { 
      key: 'cantidad', 
      label: 'Stock', 
      width: '15%',
      render: (value) => (
        <span className={value > 10 ? 'text-success' : value > 0 ? 'text-warning' : 'text-danger'}>
          {value}
        </span>
      )
    },
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
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      setProducts([
        { 
          id: 1, 
          nombre: 'Laptop Dell XPS', 
          sku: 'DELL-XPS-001', 
          precio: 1299.99, 
          cantidad: 5, 
          categoria: 'Electrónica',
          descripcion: 'Laptop de alta performance',
          activo: true 
        },
        { 
          id: 2, 
          nombre: 'Mouse Logitech', 
          sku: 'LOG-MOUSE-002', 
          precio: 29.99, 
          cantidad: 0, 
          categoria: 'Accesorios',
          descripcion: 'Mouse inalámbrico',
          activo: true 
        }
      ]);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const fieldValidations = {
      nombre: validaciones.nombre,
      precio: validaciones.precio,
      cantidad: validaciones.cantidad
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
        setProducts(prev => 
          prev.map(p => p.id === editingId ? { ...p, ...formData } : p)
        );
        toast.success('Producto actualizado');
      } else {
        setProducts(prev => [...prev, { ...formData, id: Date.now() }]);
        toast.success('Producto creado');
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
      sku: '',
      precio: '',
      cantidad: '',
      categoria: '',
      descripcion: '',
      activo: true
    });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado');
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
            <i className="fa fa-box me-2"></i>
            Productos
          </h2>
          <p className="text-muted small mb-0">Gestión de catálogo de productos</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleOpenModal}
        >
          <i className="fa fa-plus me-2"></i>
          Nuevo Producto
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
                  {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                    {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">SKU</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Precio *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                      value={formData.precio}
                      onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    />
                    {errors.precio && <div className="invalid-feedback d-block">{errors.precio}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cantidad *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.cantidad ? 'is-invalid' : ''}`}
                      value={formData.cantidad}
                      onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                    />
                    {errors.cantidad && <div className="invalid-feedback d-block">{errors.cantidad}</div>}
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                      />
                      <label className="form-check-label" htmlFor="activo">
                        Producto Activo
                      </label>
                    </div>
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

export default ProductsPage;
