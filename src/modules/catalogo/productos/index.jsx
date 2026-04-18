import React from 'react';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { useProducts } from './hooks/useProducts';
import { ProductsForm } from './components/ProductsForm';

/**
 * Página de Gestión de Productos
 * ABM de productos con variantes y atributos
 * @component
 */
const ProductsPage = () => {
  const {
    loading,
    products,
    categories,
    showModal,
    setShowModal,
    editingId,
    formData,
    setFormData,
    errors,
    searchTerm,
    setSearchTerm,
    pagination,
    handleSave,
    handleDelete,
    handleToggleActive,
    handleEdit,
    handleOpenModal,
    // Variantes y Atributos
    attributes,
    variants,
    handleVariantStockChange,
    handleVariantPriceChange
  } = useProducts();

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '30%' },
    {
      key: 'categoriaId',
      label: 'Categoría',
      width: '20%',
      render: (value) => {
        const category = categories.find(cat => cat.id === Number(value));
        return category ? (
          <span className="d-flex align-items-center gap-2">
            <i className={`fa ${category.icono || 'fa-tag'} text-primary`}></i>
            <span>{category.nombre}</span>
          </span>
        ) : 'Sin categoría';
      }
    },
    { 
      key: 'atributosUsados', 
      label: 'Atributos', 
      width: '25%',
      render: (value) => (
        <small className="text-muted">
          {Array.isArray(value) && value.length > 0 
            ? value.join(', ') 
            : 'Sin variantes'}
        </small>
      )
    },
    { 
      key: 'activo', 
      label: 'Estado', 
      width: '15%',
      render: (value, row) => (
        <button
          className={`btn btn-sm ${value ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => handleToggleActive(row.id, !value)}
          title="Click para cambiar estado"
        >
          {value ? 'Activo' : 'Inactivo'}
        </button>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-3 pb-2 border-bottom">
        <div className="col-md-8">
          <div>
            <h1 className="h3 fw-bold mb-1">
              <i className="fa fa-box me-3 text-primary"></i>
              Gestión de Productos
            </h1>
            <p className="text-muted mb-0 small">
              <i className="fa fa-info-circle me-2"></i>
              Crear y editar productos con variantes de atributos
            </p>
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button 
            className="btn btn-primary"
            onClick={handleOpenModal}
          >
            <i className="fa fa-plus me-2"></i>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="mb-2">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Tarjetas Informativas Pequeñas */}
      <div className="row g-2 mb-2">
        <div className="col-auto">
          <div className="badge bg-primary p-2">
            <i className="fa fa-box me-1"></i>
            Total: <strong>{products?.length || 0}</strong>
          </div>
        </div>
        <div className="col-auto">
          <div className="badge bg-success p-2">
            <i className="fa fa-check-circle me-1"></i>
            Activos: <strong>{products?.filter(p => p.activo)?.length || 0}</strong>
          </div>
        </div>
        <div className="col-auto">
          <div className="badge bg-secondary p-2">
            <i className="fa fa-circle-xmark me-1"></i>
            Inactivos: <strong>{products?.filter(p => !p.activo)?.length || 0}</strong>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card shadow-sm mb-3">
        <div className="table-responsive">
          <CatalogoTable
            columns={columns}
            data={pagination.paginatedItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>

      {/* Paginación */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.handlePageChange}
        onPageSizeChange={pagination.handlePageSizeChange}
      />

      {showModal && (
        <ProductsForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
          attributes={attributes}
          categories={categories}
          initialVariants={variants}
          onVariantStockChange={handleVariantStockChange}
          onVariantPriceChange={handleVariantPriceChange}
        />
      )}
    </div>
  );
};

export default ProductsPage;
