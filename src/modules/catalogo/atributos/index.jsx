import React, { useState } from 'react';
import { useAttributes } from './hooks/useAttributes';
import AttributesForm from './components/AttributesForm';
import { CatalogoTable, SearchFilterBar, ConfirmDeleteModal } from '../components';

const AttributesList = () => {
  const {
    attributes,
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
  } = useAttributes();

  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const columns = [
    {
      key: 'nombre',
      label: 'Atributo',
      width: '25%',
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#e9ecef', color: '#495057',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>
            {value.charAt(0).toUpperCase()}
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'valores',
      label: 'Valores',
      width: '60%',
      render: (value) => (
        <div className="d-flex flex-wrap gap-1">
          {value
            ? value.split(',').map((v) => v.trim()).filter(Boolean).map((tag) => (
                <span
                  key={tag}
                  className="badge rounded-pill border text-body-secondary"
                  style={{ fontWeight: 400, fontSize: '0.78rem' }}
                >
                  {tag}
                </span>
              ))
            : <span className="text-muted">—</span>}
        </div>
      ),
    },
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
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-3 pb-2 border-bottom">
        <div className="col-md-8">
          <h1 className="h3 fw-bold mb-1">
            <i className="fa fa-tags me-3 text-primary"></i>Atributos
          </h1>
          <p className="text-muted mb-0 small">Administrá los atributos de productos (Talla, Color, etc.)</p>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn btn-primary" onClick={abrirCrear} disabled={loading}>
            <i className="fa fa-plus me-2"></i>Nuevo Atributo
          </button>
        </div>
      </div>

      <div className="mb-3">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar atributo..."
        />
      </div>

      <CatalogoTable
        data={attributes}
        columns={columns}
        loading={loading}
        onEdit={abrirEditar}
        onDelete={(id) => {
          const attr = attributes.find((a) => a.id === id);
          if (attr) setConfirmEliminar(attr);
        }}
      />

      {showModal && (
        <AttributesForm
          editingId={editingId}
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
          entidad="atributo"
          onConfirm={() => { handleEliminar(confirmEliminar.id); setConfirmEliminar(null); }}
          onCancel={() => setConfirmEliminar(null)}
        />
      )}
    </div>
  );
};

export default AttributesList;
