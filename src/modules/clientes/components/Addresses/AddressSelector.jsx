import React, { useState, useEffect } from 'react';
import AddressTable from './AddressTable';
import styles from './AddressSelector.module.css';

/**
 * Componente Wrapper: AddressSelector
 * Simplifica la selección de direcciones del cliente
 * 
 * Uso:
 * <AddressSelector
 *   cliente={cliente}
 *   onSeleccionar={handleDireccion}
 *   onCerrar={handleCerrar}
 * />
 */
const AddressSelector = ({ cliente, onSeleccionar, onCerrar }) => {
  const [direcciones, setDirecciones] = useState([]);

  useEffect(() => {
    if (cliente?.direcciones) {
      setDirecciones(cliente.direcciones);
    }
  }, [cliente]);

  if (!cliente) return null;

  return (
    <div 
      className={styles.modalOverlay}
    >
      <div 
        className={`modal-dialog modal-lg ${styles.modalDialog}`}
      >
        <div className={`modal-content ${styles.modalContent}`}>
          <div className={`modal-header ${styles.modalHeader}`}>
            <h5 className="modal-title">
              Seleccionar Dirección - {cliente.nombre}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCerrar}
            ></button>
          </div>

          <div className={`modal-body ${styles.modalBody}`}>
            {direcciones.length === 0 ? (
              <div className="alert alert-info">
                <i className="fa fa-info-circle me-2"></i>
                Este cliente no tiene direcciones registradas
              </div>
            ) : (
              <div className="row g-2">
                {direcciones.map((dir, idx) => (
                  <div key={idx} className="col-12">
                    <div 
                      className={`card p-3 ${styles.addressCard}`}
                      onClick={() => onSeleccionar(dir)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {dir.calle} {dir.numero}
                            {dir.piso && `, Piso ${dir.piso}`}
                            {dir.depto && `, Depto ${dir.depto}`}
                          </h6>
                          <p className="mb-0 small text-muted">
                            {dir.localidad}, {dir.provincia} - CP {dir.codigoPostal}
                          </p>
                          {dir.referencias && (
                            <p className="mb-0 small text-secondary">
                              📝 {dir.referencias}
                            </p>
                          )}
                        </div>
                        {dir.default && (
                          <span className="badge bg-success ms-2">Por Defecto</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`modal-footer ${styles.modalFooter}`}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCerrar}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;