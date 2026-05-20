import React from 'react';
import { PERIODOS } from '../utils/informesData';

const InformeLayout = ({ titulo, icono, color = 'text-primary', periodo, onPeriodo, children }) => (
  <div className="container-fluid p-4">
    <div className="row mb-4 pb-3 border-bottom align-items-center">
      <div className="col">
        <h2 className="h3 fw-bold mb-0">
          <i className={`fa ${icono} me-2 ${color}`} />
          {titulo}
        </h2>
      </div>
      {onPeriodo && (
        <div className="col-auto">
          <div className="btn-group btn-group-sm">
            {PERIODOS.map(p => (
              <button
                key={p.value}
                className={`btn ${periodo === p.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => onPeriodo(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

export default InformeLayout;
