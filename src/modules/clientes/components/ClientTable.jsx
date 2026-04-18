import React from 'react';
import styles from './ClientTable.module.css';

/**
 * Componente ClientTable
 * Tabla con listado de clientes, edición, eliminación y gestión de direcciones
 * Responsabilidad única: renderizar la tabla
 */
const ClientTable = ({ clients, loading, onEdit, onDelete, onToggleEstado, onManageAddresses }) => {
  return (
    <div className="table-responsive">
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <table className={`table table-hover ${styles.clientTable}`}>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Direcciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  <i className="fa fa-inbox me-2"></i>No hay clientes que mostrar
                </td>
              </tr>
            ) : (
              clients.map(client => (
                <tr key={client.id}>
                  <td><strong>#{client.id}</strong></td>
                  <td>
                    <div className={styles.clientName}>
                      <i className={`fa ${client.tipoCliente === 'empresa' ? 'fa-building' : 'fa-user'} me-2`}></i>
                      {client.nombre}
                    </div>
                  </td>
                  <td>{client.email}</td>
                  <td>{client.telefono}</td>
                  <td>
                    <span className={`badge ${client.tipoCliente === 'empresa' ? 'bg-warning' : 'bg-info'}`}>
                      {client.tipoCliente === 'empresa' ? 'Empresa' : 'Individual'}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">
                      <i className="fa fa-map-location-dot me-1"></i>
                      {client.direcciones?.length || 0}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${client.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}
                      onClick={() => onToggleEstado(client.id)}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click para cambiar estado"
                    >
                      {client.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-info"
                        onClick={() => onManageAddresses(client)}
                        title="Gestionar dirección de envíos"
                      >
                        <i className="fa fa-map-pin"></i>
                      </button>
                      <button
                        className="btn btn-warning"
                        onClick={() => onEdit(client)}
                        title="Editar"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onDelete(client.id)}
                        title="Eliminar"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientTable;