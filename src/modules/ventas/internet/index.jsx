import React from 'react';

/**
 * Página - Ventas en Internet
 * @component
 */
const VentasInternet = () => {
  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <h1 className="h3 fw-bold mb-1">
            <i className="fa fa-globe me-2 text-primary"></i>
            Ventas en Internet
          </h1>
          <p className="text-muted mb-0">Gestión de ventas realizadas a través del sitio web</p>
        </div>
      </div>

      <div className="alert alert-info" role="alert">
        <i className="fa fa-info-circle me-2"></i>
        Esta sección está en desarrollo.
      </div>
    </div>
  );
};

export default VentasInternet;
