import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { usePagination, useSearchFilter } from '../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../utils/validators';
import { fetchProducts } from '../productos/services/productsService';
import styles from './OffersPage.module.css';

/**
 * Página de Gestión de Ofertas
 * ABM de promociones y descuentos sobre productos y variantes
 * @component
 */
const OffersPage = () => {
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

  const selectedProduct = useMemo(
    () => products.find(p => p.id === Number(formData.productoId)) || null,
    [products, formData.productoId]
  );

  const productVariantOptions = selectedProduct?.variants || [];

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '18%' },
    { key: 'productoId', label: 'Producto', width: '18%', render: (value) => {
      const product = products.find(p => p.id === value);
      return product ? product.nombre : '-';
    }},
    { key: 'varianteId', label: 'Variante', width: '18%', render: (value, row) => {
      const product = products.find(p => p.id === row.productoId);
      const variant = product?.variants?.find(v => v.variantId === value);
      if (!variant) return '-';
      const attrs = Object.entries(variant)
        .filter(([key]) => !['variantId', 'productoId', 'stock', 'precio'].includes(key))
        .map(([key, attrValue]) => `${key}: ${attrValue}`)
        .join(' / ');
      return attrs || value;
    }},
    { key: 'precioOferta', label: 'Precio Oferta', width: '12%', render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-' },
    { key: 'stockOferta', label: 'Stock Oferta', width: '12%' },
    { key: 'fechaFin', label: 'Vence', width: '12%', render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'activo', label: 'Estado', width: '10%', render: (value) => (
      <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
        {value ? 'Activa' : 'Inactiva'}
      </span>
    )}
  ];

  useEffect(() => {
    loadOffers();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productData = await fetchProducts();
      setProducts(productData);
    } catch (error) {
      toast.error('Error al cargar productos');
    }
  };

  const loadOffers = async () => {
    setLoading(true);
    try {
      setOffers([
        {
          id: 1,
          nombre: 'Últimas unidades Negra',
          descripcion: 'Oferta de remera negra, últimas unidades',
          productoId: 1,
          varianteId: '1-M-Negro',
          precioOferta: 24.99,
          stockOferta: 3,
          fechaInicio: '2026-10-01',
          fechaFin: '2026-10-10',
          activo: true
        },
        {
          id: 2,
          nombre: 'Buzo Oversize descuento',
          descripcion: 'Precio especial por falla en stock',
          productoId: 2,
          varianteId: '2-L',
          precioOferta: 39.99,
          stockOferta: 2,
          fechaInicio: '2026-09-15',
          fechaFin: '2026-09-30',
          activo: false
        }
      ]);
    } catch (error) {
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
    if (productVariantOptions.length > 0 && !formData.varianteId) {
      newErrors.varianteId = 'Selecciona la variante';
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
      if (editingId) {
        setOffers(prev => 
          prev.map(o => o.id === editingId ? { ...o, ...formData } : o)
        );
        toast.success('Oferta actualizada');
      } else {
        setOffers(prev => [...prev, { ...formData, id: Date.now() }]);
        toast.success('Oferta creada');
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

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro?')) {
      setOffers(prev => prev.filter(o => o.id !== id));
      toast.success('Oferta eliminada');
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
            <i className="fa fa-percent me-2"></i>
            Ofertas
          </h2>
          <p className="text-muted small mb-0">Gestión de promociones sobre productos y variantes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleOpenModal}
        >
          <i className="fa fa-plus me-2"></i>
          Nueva Oferta
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
                  {editingId ? 'Editar Oferta' : 'Nueva Oferta'}
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
                    className="form-control"
                    rows="2"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Producto *</label>
                    <select
                      className={`form-select ${errors.productoId ? 'is-invalid' : ''}`}
                      value={formData.productoId}
                      onChange={(e) => setFormData({
                        ...formData,
                        productoId: e.target.value,
                        varianteId: ''
                      })}
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.productoId && <div className="invalid-feedback d-block">{errors.productoId}</div>}
                  </div>

                  {productVariantOptions.length > 0 && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Variante *</label>
                      <select
                        className={`form-select ${errors.varianteId ? 'is-invalid' : ''}`}
                        value={formData.varianteId}
                        onChange={(e) => setFormData({ ...formData, varianteId: e.target.value })}
                      >
                        <option value="">Selecciona una variante</option>
                        {productVariantOptions.map(variant => (
                          <option key={variant.variantId} value={variant.variantId}>
                            {Object.entries(variant)
                              .filter(([key]) => !['variantId', 'productoId', 'stock', 'precio'].includes(key))
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(' / ')}
                          </option>
                        ))}
                      </select>
                      {errors.varianteId && <div className="invalid-feedback d-block">{errors.varianteId}</div>}
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Precio de Oferta *</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className={`form-control ${errors.precioOferta ? 'is-invalid' : ''}`}
                        value={formData.precioOferta}
                        onChange={(e) => setFormData({...formData, precioOferta: e.target.value})}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.precioOferta && <div className="invalid-feedback d-block">{errors.precioOferta}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Stock en Oferta *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.stockOferta ? 'is-invalid' : ''}`}
                      value={formData.stockOferta}
                      onChange={(e) => setFormData({...formData, stockOferta: e.target.value})}
                      min="0"
                    />
                    {errors.stockOferta && <div className="invalid-feedback d-block">{errors.stockOferta}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha Inicio</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha Fin</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                    />
                  </div>
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
                    Oferta Activa
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

export default OffersPage;
