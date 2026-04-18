import React from 'react';
import styles from './AddressTable.module.css';

/**
 * Componente AddressTable
 * Tabla para mostrar direcciones de envío con acciones
 */
const AddressTable = ({ addresses, onEdit, onDelete, onSetDefault }) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="fa fa-info-circle me-2"></i>
        No hay direcciones de envío registradas
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className={`table table-sm table-hover ${styles.addressTable}`}>
        <thead className="table-light">
          <tr>
            <th style={{ width: '5%' }}>Def.</th>
            <th>Dirección</th>
            <th>Localidad</th>
            <th>Provincia</th>
            <th>CP</th>
            <th>Transportista</th>
            <th>Tipo</th>
            <th>Código Cliente</th>
            <th style={{ width: '10%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map(address => (
            <tr key={address.id} className={address.esPorDefecto ? 'table-info' : ''}>
              <td>
                {address.esPorDefecto ? (
                  <span className="badge bg-success" title="Dirección predeterminada">
                    <i className="fa fa-check"></i>
                  </span>
                ) : (
                  <button
                    className="btn btn-sm btn-link text-muted"
                    onClick={() => onSetDefault(address.id)}
                    title="Establecer como predeterminada"
                  >
                    <i className="fa fa-circle-notch"></i>
                  </button>
                )}
              </td>
              <td>
                <div>
                  <strong>{address.calle} {address.numero}</strong>
                  {address.piso && <span>, Piso {address.piso}</span>}
                  {address.depto && <span>, Depto {address.depto}</span>}
                </div>
              </td>
              <td>{address.localidad}</td>
              <td>{address.provincia}</td>
              <td>
                <span className="badge bg-light text-dark">{address.codigoPostal}</span>
              </td>
              <td>
                <span className="badge bg-primary">{address.transportista}</span>
              </td>
              <td>
                <span className="badge bg-secondary">{address.tipoEnvio}</span>
              </td>
              <td>
                <small className="text-muted">{address.codigoCliente}</small>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-warning"
                    onClick={() => onEdit(address)}
                    title="Editar"
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(address.id)}
                    title="Eliminar"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddressTable;