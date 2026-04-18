import React from 'react';

const TPVClientPicker = ({
  show,
  clientes,
  defaultClientes = [],
  busquedaCliente,
  onBusquedaClienteChange,
  onSelectCliente,
  onClose
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Seleccionar Cliente</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="d-flex gap-2 mb-3">
              {defaultClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => onSelectCliente(cliente)}
                >
                  {cliente.nombre}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => onBusquedaClienteChange(e.target.value)}
            />
            <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => onSelectCliente(cliente)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{cliente.nombre}</div>
                      <small className="text-muted">{cliente.email}</small>
                    </div>
                    <span className="badge bg-secondary">{cliente.ciudad}</span>
                  </div>
                </button>
              ))}
              {clientes.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <i className="fa fa-search fa-2x mb-2"></i>
                  <p>No se encontraron clientes</p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVClientPicker;
