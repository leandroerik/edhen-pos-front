import React, { useState } from 'react';

const SalesTable = ({ ventas, loading, onDelete, onView, onPrint, onDuplicate, onReturn }) => {
  const [showMenuId, setShowMenuId] = useState(null);

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Historial de Ventas</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead>
              <tr>
                <th style={{width: '10%'}}>ID</th>
                <th style={{width: '14%'}}>Fecha</th>
                <th style={{width: '18%'}}>Cliente</th>
                <th style={{width: '12%'}}>Pago</th>
                <th style={{width: '10%'}}>Items</th>
                <th style={{width: '12%'}}>Total</th>
                <th style={{width: '12%'}}>Estado</th>
                <th style={{width: '12%'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Cargando ventas...
                  </td>
                </tr>
              ) : ventas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td><strong>#{venta.id}</strong></td>
                    <td>{venta.fecha}</td>
                    <td>{venta.cliente}</td>
                    <td>
                      <small className="badge bg-info text-dark">{venta.formaPago}</small>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-secondary">{venta.items?.length || 0}</span>
                    </td>
                    <td className="fw-bold text-success">${venta.total?.toFixed(2) ?? '0.00'}</td>
                    <td>
                      <small className={`badge bg-${venta.estado === 'Completada' ? 'success' : venta.estado === 'Devuelta' ? 'danger' : 'warning'}`}>
                        {venta.estado}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex gap-1 position-relative">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onView && onView(venta)}
                          title="Ver detalle"
                        >
                          <i className="fa fa-eye me-1"></i>Ver
                        </button>
                        <div className="position-relative">
                          <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            onClick={() => setShowMenuId(showMenuId === venta.id ? null : venta.id)}
                            title="Más acciones"
                          >
                            <i className="fa fa-ellipsis-v"></i>
                          </button>
                          {showMenuId === venta.id && (
                            <div className="position-absolute top-100 end-0 bg-white border rounded shadow-lg mt-1" style={{zIndex: 1000, minWidth: '140px'}}>
                              <button
                                className="dropdown-item d-block w-100 text-start p-2 border-0 bg-transparent"
                                onClick={() => {
                                  onPrint && onPrint(venta);
                                  setShowMenuId(null);
                                }}
                              >
                                <i className="fa fa-print me-2 text-primary"></i>Imprimir
                              </button>
                              <button
                                className="dropdown-item d-block w-100 text-start p-2 border-top bg-transparent"
                                onClick={() => {
                                  onDuplicate && onDuplicate(venta);
                                  setShowMenuId(null);
                                }}
                              >
                                <i className="fa fa-copy me-2 text-warning"></i>Duplicar
                              </button>
                              <button
                                className="dropdown-item d-block w-100 text-start p-2 border-top bg-transparent"
                                onClick={() => {
                                  onReturn && onReturn(venta);
                                  setShowMenuId(null);
                                }}
                              >
                                <i className="fa fa-undo me-2 text-secondary"></i>Devolución
                              </button>
                              <button
                                className="dropdown-item d-block w-100 text-start p-2 border-top bg-transparent text-danger"
                                onClick={() => {
                                  onDelete && onDelete(venta.id);
                                  setShowMenuId(null);
                                }}
                              >
                                <i className="fa fa-trash me-2"></i>Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
