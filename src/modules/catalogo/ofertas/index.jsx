import React from 'react';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { useOffers } from './hooks/useOffers';
import { OffersForm } from './components/OffersForm';

/**
 * Página de Gestión de Ofertas
 * ABM de promociones y descuentos
 * @component
 */
const OffersPage = () => {
  const {
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
    handleToggleActive
  } = useOffers();

  const selectedProduct = products.find(p => p.id === Number(formData.productoId));

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '18%' },
    { key: 'productoId', label: 'Producto', width: '18%', render: (value) => {
      const product = products.find(p => p.id === value);
      return product ? product.nombre : '-';
    }},
    { key: 'varianteId', label: 'Variante', width: '18%', render: (value, row) => {
      const product = products.find(p => p.id === row.productoId);
      const variant = product?.variants?.find(v => v.variantId === value);
      if (!variant) return value ? value : '-';
      return Object.entries(variant)
        .filter(([key]) => !['variantId', 'productoId', 'stock', 'precio'].includes(key))
        .map(([key, val]) => `${key}: ${val}`)
        .join(' / ') || value;
    }},
    { key: 'precioOferta', label: 'Precio Oferta', width: '12%', render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : '-' },
    { key: 'stockOferta', label: 'Stock Oferta', width: '12%' },
    { 
      key: 'activo', 
      label: 'Estado', 
      width: '12%',
      render: (value, row) => (
        <button
          className={`btn btn-sm ${value ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => handleToggleActive(row.id, !value)}
          title="Click para cambiar estado"
        >
          {value ? 'Activa' : 'Inactiva'}
        </button>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-5 pb-3 border-bottom">
        <div className="col-md-8">
          <h2 className="h3 fw-bold mb-2">
            <i className="fa fa-percent me-2 text-primary"></i>
            Gestión de Ofertas
          </h2>
          <p className="text-muted small mb-0">Crear y editar promociones y descuentos</p>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleOpenModal}
          >
            <i className="fa fa-plus me-2"></i>
            Nueva Oferta
          </button>
        </div>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <CatalogoTable
            columns={columns}
            data={pagination.paginatedItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>

      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.handlePageChange}
        onPageSizeChange={pagination.handlePageSizeChange}
      />

      {showModal && (
        <OffersForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          products={products}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default OffersPage;
