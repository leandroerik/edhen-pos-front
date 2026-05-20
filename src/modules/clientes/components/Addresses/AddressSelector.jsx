import React, { useState, useEffect } from 'react';

const AddressSelector = ({ cliente, onSeleccionar, onCerrar }) => {
  const [direcciones, setDirecciones] = useState([]);

  useEffect(() => {
    if (cliente?.direcciones) setDirecciones(cliente.direcciones);
  }, [cliente]);

  if (!cliente) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className="fa fa-map-pin me-2"></i>
              Seleccionar dirección — {cliente.nombre}
            </h5>
            <button type="button" className="btn-close" onClick={onCerrar} />
          </div>

          <div className="modal-body p-4">
            {direcciones.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fa fa-map-pin fa-2x mb-2 d-block"></i>
                <span className="small">Este cliente no tiene direcciones registradas.</span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {direcciones.map((dir) => (
                  <div
                    key={dir.id}
                    className={`border rounded p-3 ${dir.esPorDefecto ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSeleccionar(dir)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">
                          {dir.calle} {dir.numero}
                          {dir.piso  ? `, Piso ${dir.piso}`  : ''}
                          {dir.depto ? `, Depto ${dir.depto}` : ''}
                        </div>
                        <div className="text-muted small">
                          {dir.localidad}, {dir.provincia} — CP {dir.codigoPostal}
                        </div>
                      </div>
                      {dir.esPorDefecto && (
                        <span className="badge text-bg-primary rounded-pill ms-2">
                          <i className="fa fa-star me-1"></i>Predeterminada
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-top">
            <button type="button" className="btn btn-secondary" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
