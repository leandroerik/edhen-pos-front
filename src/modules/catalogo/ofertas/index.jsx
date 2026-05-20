import React, { useState } from 'react';
import { useOffers } from './hooks/useOffers';
import OffersForm from './components/OffersForm';
import { CatalogoTable, SearchFilterBar, ConfirmDeleteModal } from '../components';
import { variantLabel } from './variantHelpers';

const OfertasList = () => {
  const {
    offers,
    products,
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
  } = useOffers();

  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const columns = [
    {
      key: 'nombre',
      label: 'Oferta',
      width: '26%',
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#fff3cd', color: '#856404',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>
            <i className="fa fa-percent" style={{ fontSize: '0.7rem' }}></i>
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'productoId',
      label: 'Aplica a',
      width: '28%',
      render: (value, row) => {
        const prod = products.find((p) => p.id === value);
        const variant = prod?.variants?.find((v) => v.variantId === row.varianteId);
        return prod ? (
          <div>
            <div className="small fw-semibold">{prod.nombre}</div>
            {variant && (
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {variantLabel(variant)}
              </div>
            )}
          </div>
        ) : <span className="text-muted">—</span>;
      },
    },
    {
      key: 'descuento',
      label: 'Descuento',
      width: '16%',
      render: (value, row) => {
        if (!value && value !== 0) return <span className="text-muted">—</span>;
        const label = row.tipoDescuento === 'porcentaje'
          ? `${value}% OFF`
          : `$${parseFloat(value).toFixed(2)} OFF`;
        return (
          <span className="badge rounded-pill text-bg-warning" style={{ fontWeight: 500 }}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'precioOferta',
      label: 'Precio',
      width: '14%',
      render: (value) => (
        <span className="fw-semibold text-success">
          ${parseFloat(value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      width: '16%',
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
            <i className="fa fa-percent me-3 text-primary"></i>Ofertas
          </h1>
          <p className="text-muted mb-0 small">Administrá las promociones y descuentos del catálogo</p>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn btn-primary" onClick={abrirCrear} disabled={loading}>
            <i className="fa fa-plus me-2"></i>Nueva Oferta
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
        data={offers}
        columns={columns}
        loading={loading}
        onEdit={abrirEditar}
        onDelete={(id) => {
          const oferta = offers.find((o) => o.id === id);
          if (oferta) setConfirmEliminar(oferta);
        }}
      />

      {showModal && (
        <OffersForm
          editingId={editingId}
          formData={formData}
          onChange={handleChange}
          errors={errors}
          products={products}
          onSave={handleGuardar}
          onCancel={cerrarModal}
          loading={saving}
        />
      )}

      {confirmEliminar && (
        <ConfirmDeleteModal
          nombre={confirmEliminar.nombre}
          entidad="oferta"
          onConfirm={() => { handleEliminar(confirmEliminar.id); setConfirmEliminar(null); }}
          onCancel={() => setConfirmEliminar(null)}
        />
      )}
    </div>
  );
};

export default OfertasList;
