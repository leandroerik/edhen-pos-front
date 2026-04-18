import React from 'react';
import { CatalogoTable, SearchFilterBar, PaginationControls } from '../components';
import { useAttributes } from './hooks/useAttributes';
import { AttributesForm } from './components/AttributesForm';

/**
 * Componente para editar valores inline
 */
const ValoresEditableCell = ({ valores, attributeId, onUpdate }) => {
  const [valueTags, setValueTags] = React.useState([]);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingValue, setEditingValue] = React.useState('');

  React.useEffect(() => {
    if (valores) {
      const tags = valores.split(',').map(v => v.trim()).filter(v => v);
      setValueTags(tags);
    }
  }, [valores]);

  const handleEditTag = (index) => {
    setEditingIndex(index);
    setEditingValue(valueTags[index]);
  };

  const handleSaveTag = (index) => {
    if (!editingValue.trim()) {
      const newTags = valueTags.filter((_, i) => i !== index);
      setValueTags(newTags);
      onUpdate(attributeId, newTags.join(','));
    } else {
      const newTags = [...valueTags];
      newTags[index] = editingValue.trim();
      setValueTags(newTags);
      onUpdate(attributeId, newTags.join(','));
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleRemoveTag = (index) => {
    const newTags = valueTags.filter((_, i) => i !== index);
    setValueTags(newTags);
    onUpdate(attributeId, newTags.join(','));
  };

  return (
    <div>
      {valueTags.map((tag, index) => (
        <span key={index} className="me-2 mb-2 d-inline-block">
          {editingIndex === index ? (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => handleSaveTag(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTag(index);
                if (e.key === 'Escape') setEditingIndex(null);
              }}
              autoFocus
              className="form-control form-control-sm"
              style={{ width: '130px', display: 'inline-block' }}
            />
          ) : (
            <span
              onClick={() => handleEditTag(index)}
              className="badge bg-primary"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Click para editar"
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(index);
                }}
                className="btn-close btn-close-white ms-1"
                style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0 0.125rem' }}
                title="Eliminar"
              ></button>
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

/**
 * Página de Gestión de Atributos
 * ABM de atributos de productos (Tamaño, Color, etc)
 * @component
 */
const AttributesPage = () => {
  const {
    attributes,
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
    handleSaveWithValues,
    handleDelete,
    handleEdit,
    handleOpenModal,
    handleUpdateValores,
    handleToggleActivo
  } = useAttributes();

  const columns = [
    { key: 'nombre', label: 'Nombre', width: '30%' },
    { 
      key: 'valores', 
      label: 'Valores', 
      width: '50%',
      render: (value, row) => (
        <ValoresEditableCell 
          valores={value} 
          attributeId={row.id}
          onUpdate={handleUpdateValores}
        />
      )
    },
    { 
      key: 'activo', 
      label: 'Estado', 
      width: '20%',
      render: (value, row) => (
        <button
          className={`btn btn-sm ${value ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => handleToggleActivo(row.id)}
          title="Click para cambiar estado"
        >
          {value ? 'Activo' : 'Inactivo'}
        </button>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-5">
        <div className="col-md-8">
          <h2 className="h3 fw-bold mb-2">
            <i className="fa fa-tag me-2 text-primary"></i>
            Gestión de Atributos
          </h2>
          <p className="text-muted small mb-0">Crear y editar atributos de productos (Talla, Color, etc)</p>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleOpenModal}
          >
            <i className="fa fa-plus me-2"></i>
            Nuevo Atributo
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
        <AttributesForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSave={handleSave}
          onSaveWithValues={handleSaveWithValues}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AttributesPage;
