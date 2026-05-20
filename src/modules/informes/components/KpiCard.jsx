import React from 'react';

const KpiCard = ({ label, value, icon, accent = '#0d6efd', bg = '#cfe2ff', sub }) => (
  <div className="card border-0 h-100" style={{ borderLeft: `4px solid ${accent}` }}>
    <div className="card-body p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <small style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6c757d', fontWeight: 600 }}>
            {label}
          </small>
          <div className="fw-bold fs-5 mt-1" style={{ color: accent }}>{value}</div>
          {sub && <small className="text-muted">{sub}</small>}
        </div>
        <div className="rounded-2 p-2 flex-shrink-0" style={{ backgroundColor: bg }}>
          <i className={`fa ${icon}`} style={{ color: accent }} />
        </div>
      </div>
    </div>
  </div>
);

export default KpiCard;
