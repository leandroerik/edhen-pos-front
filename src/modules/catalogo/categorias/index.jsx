import React from 'react';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { useCategories } from './hooks/useCategories';
import { CategoriesForm } from './components/CategoriesForm';

/**
 * Página de Gestión de Categorías
 * ABM (Alta, Baja, Modificación) de categorías
 * @component
 */
const CategoriesPage = () => {
  const {
    categories,
    loading,
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
    handleEdit,
    handleOpenModal,
    handleToggleActivo
  } = useCategories();

  const columns = [
    { 
      key: 'icono', 
      label: '', 
      width: '8%',
      render: (value) => (
        <div className="text-center">
          <i className={`fa ${value || 'fa-cube'} fa-2x text-primary`}></i>
        </div>
      )
    },
    { key: 'nombre', label: 'Categoría', width: '30%' },
    { 
      key: 'activo', 
      label: 'Estado', 
      width: '20%',
      render: (value, row) => (
        <button
          className={`btn btn-sm fw-semibold ${value ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => handleToggleActivo(row.id)}
          title="Click para cambiar estado"
        >
          <i className={`fa ${value ? 'fa-check-circle me-2' : 'fa-circle-xmark me-2'}`}></i>
          {value ? 'Activa' : 'Inactiva'}
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
              <i className="fa fa-shirt me-3 text-primary"></i>
              Categorías de Ropa
            </h1>
            <p className="text-muted mb-0 small">
              <i className="fa fa-info-circle me-2"></i>
              Gestiona las categorías para organizar tu catálogo de prendas
            </p>
          </div>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button 
            className="btn btn-primary"
            onClick={handleOpenModal}
          >
            <i className="fa fa-plus me-2"></i>
            Nueva Categoría
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
            <i className="fa fa-list me-1"></i>
            Total: <strong>{categories.length}</strong>
          </div>
        </div>
        <div className="col-auto">
          <div className="badge bg-success p-2">
            <i className="fa fa-check-circle me-1"></i>
            Activas: <strong>{categories.filter(c => c.activo).length}</strong>
          </div>
        </div>
        <div className="col-auto">
          <div className="badge bg-secondary p-2">
            <i className="fa fa-circle-xmark me-1"></i>
            Inactivas: <strong>{categories.filter(c => !c.activo).length}</strong>
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

      {/* Modal */}
      {showModal && (
        <CategoriesForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
