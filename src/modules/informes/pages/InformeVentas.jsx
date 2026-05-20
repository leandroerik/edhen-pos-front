import React, { useState, useMemo } from 'react';
import InformeLayout from '../components/InformeLayout';
import VBarChart from '../components/VBarChart';
import KpiCard from '../components/KpiCard';
import { ventasPorDia } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const InformeVentas = () => {
  const [periodo, setPeriodo] = useState('7d');
  const data = ventasPorDia[periodo];

  const total  = useMemo(() => data.reduce((s, d) => s + d.ventas, 0), [data]);
  const txTotal = useMemo(() => data.reduce((s, d) => s + d.transacciones, 0), [data]);
  const prom   = Math.round(total / data.length);
  const ticket = Math.round(total / txTotal);
  const mejor  = data.reduce((b, d) => d.ventas > b.ventas ? d : b, data[0]);

  return (
    <InformeLayout titulo="Ventas" icono="fa-chart-bar" color="text-success" periodo={periodo} onPeriodo={setPeriodo}>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><KpiCard label="Total período" value={$(total)} icon="fa-dollar-sign" accent="#198754" bg="#d1e7dd" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Transacciones" value={txTotal} icon="fa-receipt" accent="#0d6efd" bg="#cfe2ff" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Promedio diario" value={$(prom)} icon="fa-calendar-day" accent="#0dcaf0" bg="#cff4fc" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Ticket promedio" value={$(ticket)} icon="fa-tag" accent="#fd7e14" bg="#ffe5d0" /></div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between py-3">
          <h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Evolución de ventas</h6>
          <small className="text-muted">Mejor: {mejor.label} — {$(mejor.ventas)}</small>
        </div>
        <div className="card-body">
          <VBarChart data={data} valueKey="ventas" labelKey="label" color="#198754" />
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3">
          <h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Detalle por período</h6>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventas</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transacciones</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket prom.</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td className="fw-medium">{d.label}</td>
                  <td className="text-end fw-bold text-success">{$(d.ventas)}</td>
                  <td className="text-center"><span className="badge bg-primary rounded-pill">{d.transacciones}</span></td>
                  <td className="text-end text-muted">{$(Math.round(d.ventas / d.transacciones))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light fw-bold">
              <tr>
                <td>Total</td>
                <td className="text-end text-success">{$(total)}</td>
                <td className="text-center">{txTotal}</td>
                <td className="text-end">{$(ticket)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </InformeLayout>
  );
};

export default InformeVentas;
