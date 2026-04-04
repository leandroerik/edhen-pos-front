import React from 'react';
import { ventasData } from '../services/mocks';

const Sales = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="fa fa-shopping-cart me-2"></i>
          Ventas
        </h1>
        <button className="btn btn-success">
          <i className="fa fa-plus me-2"></i>
          Nueva Venta
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Historial de Ventas</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasData.map(venta => (
                  <tr key={venta.id}>
                    <td>#{venta.id}</td>
                    <td>{venta.fecha}</td>
                    <td>{venta.cliente}</td>
                    <td className="fw-bold">${venta.total.toFixed(2)}</td>
                    <td>
                      <span className={`badge bg-${venta.estado === 'Completada' ? 'success' : 'warning'}`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-info">
                        <i className="fa fa-eye"></i>
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

export default Sales;
