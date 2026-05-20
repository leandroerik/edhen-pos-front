import React from 'react';

/**
 * Modal para visualizar detalles de atributos de un transportista
 */
const AtributosModal = ({ show, transportista, onClose }) => {
  if (!show || !transportista) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border">
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title">
              <i className="fa fa-list-ul me-2"></i>
              Atributos de {transportista.nombre}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-4">
              <p className="mb-1 text-muted small">Detalle de atributos disponibles</p>
              <span className="badge bg-secondary text-white rounded-pill">
                {transportista.atributos?.length || 0} {transportista.atributos?.length === 1 ? 'atributo' : 'atributos'}
              </span>
            </div>

            {transportista.atributos && transportista.atributos.length > 0 ? (
              <ul className="list-group">
                {transportista.atributos.map((atributo, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{atributo}</span>
                    <span className="badge bg-primary rounded-pill">{index + 1}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="alert alert-info mb-0" role="alert">
                <i className="fa fa-info-circle me-2"></i>
                Este transportista no tiene atributos definidos.
              </div>
            )}
          </div>

          <div className="modal-footer border-top py-3">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtributosModal;
