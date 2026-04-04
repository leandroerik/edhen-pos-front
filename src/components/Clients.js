import React from 'react';
import { clientesData } from '../services/mocks';

const Clients = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="fa fa-users me-2"></i>
          Clientes
        </h1>
        <button className="btn btn-success">
          <i className="fa fa-plus me-2"></i>
          Nuevo Cliente
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Lista de Clientes</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesData.map(cliente => (
                  <tr key={cliente.id}>
                    <td className="fw-bold">{cliente.nombre}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.ciudad}</td>
                    <td>
                      <span className="badge bg-success">Activo</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary">
                        <i className="fa fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-danger ms-1">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
