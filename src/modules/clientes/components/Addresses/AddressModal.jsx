import React, { useState, useEffect } from 'react';
import AddressForm from './AddressForm';
import AddressTable from './AddressTable';
import styles from './AddressModal.module.css';

/**
 * Componente AddressModal
 * Modal para gestionar direcciones de envío de un cliente
 * Integra tabla de direcciones y formulario para crear/editar
 */
const AddressModal = ({ 
  showModal, 
  client, 
  onClose, 
  onAddAddress, 
  onDeleteAddress,
  onSetDefault 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (!showModal) {
      setShowForm(false);
      setEditingAddress(null);
    }
  }, [showModal]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleFormSubmit = (formData) => {
    onAddAddress(formData);
    handleFormClose();
  };

  if (!showModal || !client) return null;

  return (
    <>
      <div className={`modal show d-block ${styles.modal}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className={`modal-content ${styles.modalContent}`}>
            <div className={`modal-header ${styles.modalHeader}`}>
              <div>
                <h5 className="modal-title">
                  <i className="fa fa-map-location-dot me-2"></i>
                  Direcciones de Envío - {client.nombre}
                </h5>
                <small className="text-muted">
                  Transportistas: Correo Argentino, OCA, Andreani, Otros
                </small>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
              ></button>
            </div>

            <div className={`modal-body ${styles.modalBody}`} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {showForm ? (
                <AddressForm
                  address={editingAddress}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormClose}
                />
              ) : (
                <>
                  <div className="mb-3">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleAddNew}
                    >
                      <i className="fa fa-plus me-2"></i>Agregar Nueva Dirección
                    </button>
                  </div>

                  <AddressTable
                    addresses={client.direcciones || []}
                    onEdit={handleEdit}
                    onDelete={(addressId) => onDeleteAddress(client.id, addressId)}
                    onSetDefault={(addressId) => onSetDefault(client.id, addressId)}
                  />

                  {(!client.direcciones || client.direcciones.length === 0) && (
                    <div className="alert alert-info">
                      <i className="fa fa-info-circle me-2"></i>
                      Este cliente no tiene direcciones de envío registradas. Usa el botón "Agregar Nueva Dirección" para comenzar.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={`modal-footer ${styles.modalFooter}`}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className={`modal-backdrop fade show ${styles.backdrop}`}></div>}
    </>
  );
};

export default AddressModal;