import React, { useState, useEffect } from 'react';
import AddressForm from './AddressForm';
import AddressTable from './AddressTable';

const AddressModal = ({ cliente, onClose, onAgregar, onActualizar, onEliminar, onSetDefault }) => {
  const [showForm,       setShowForm]       = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    setShowForm(false);
    setEditingAddress(null);
  }, [cliente?.id]);

  const handleSubmit = (data) => {
    if (editingAddress) {
      onActualizar(editingAddress.id, data);
    } else {
      onAgregar(data);
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEditar = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  if (!cliente) return null;

  const total = (cliente.direcciones || []).length;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <div>
              <h5 className="modal-title fw-bold">
                <i className="fa fa-map-pin me-2"></i>
                Direcciones de envío — {cliente.nombre}
              </h5>
              <p className="text-muted mb-0 small">
                {total === 0 ? 'Sin direcciones registradas' : `${total} dirección${total > 1 ? 'es' : ''} registrada${total > 1 ? 's' : ''}`}
              </p>
            </div>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {showForm ? (
              <AddressForm
                address={editingAddress}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditingAddress(null); }}
              />
            ) : (
              <>
                <div className="mb-3">
                  <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                    <i className="fa fa-plus me-2"></i>Agregar dirección
                  </button>
                </div>
                <AddressTable
                  addresses={cliente.direcciones || []}
                  onEdit={handleEditar}
                  onDelete={onEliminar}
                  onSetDefault={onSetDefault}
                />
              </>
            )}
          </div>

          <div className="modal-footer border-top">
            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
