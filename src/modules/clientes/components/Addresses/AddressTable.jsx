import React from 'react';

const AddressTable = ({ addresses, onEdit, onDelete, onSetDefault }) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fa fa-map-pin fa-2x mb-2 d-block"></i>
        <span className="small">Sin direcciones. Agregá una para comenzar.</span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`border rounded p-3 ${address.esPorDefecto ? 'border-primary bg-primary bg-opacity-10' : ''}`}
        >
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                {address.esPorDefecto && (
                  <span className="badge text-bg-primary rounded-pill">
                    <i className="fa fa-star me-1"></i>Predeterminada
                  </span>
                )}
                <span className="fw-semibold">
                  {address.calle} {address.numero}
                  {address.piso   ? `, Piso ${address.piso}`   : ''}
                  {address.depto  ? ` Depto ${address.depto}`  : ''}
                </span>
              </div>
              <div className="text-muted small">
                {address.localidad}, {address.provincia} — CP {address.codigoPostal}
              </div>
            </div>
            <div className="d-flex gap-1 flex-shrink-0">
              {!address.esPorDefecto && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => onSetDefault(address.id)}
                  title="Marcar como predeterminada"
                >
                  <i className="fa fa-star"></i>
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onEdit(address)}
                title="Editar"
              >
                <i className="fa fa-pen"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(address.id)}
                title="Eliminar"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressTable;
