import React from 'react';

const EnDesarrollo = ({ titulo, descripcion }) => (
  <div className="container-fluid p-4">
    <div className="text-center py-5">
      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
        style={{ width: 72, height: 72, backgroundColor: '#e9ecef' }}
      >
        <i className="fa fa-tools fa-2x text-muted" />
      </div>
      <h3 className="fw-bold mb-2">{titulo}</h3>
      <p className="text-muted mb-0">{descripcion ?? 'Esta sección está en desarrollo.'}</p>
    </div>
  </div>
);

export default EnDesarrollo;
