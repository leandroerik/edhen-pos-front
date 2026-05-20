import React, { useMemo } from 'react';
import InformeLayout from '../components/InformeLayout';
import HBarChart from '../components/HBarChart';
import KpiCard from '../components/KpiCard';
import { devolucionesPorCategoria, ventasPorCategoria } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const CategoriasDevueltas = () => {
  const totalDev   = useMemo(() => devolucionesPorCategoria.reduce((s, d) => s + d.cantidad, 0), []);
  const montoDev   = useMemo(() => devolucionesPorCategoria.reduce((s, d) => s + d.monto, 0), []);
  const totalVend  = useMemo(() => ventasPorCategoria['30d'].reduce((s, d) => s + d.unidades, 0), []);
  const pct        = ((totalDev / totalVend) * 100).toFixed(1);
  const masDevuelta = devolucionesPorCategoria[0];

  const dataConPct = useMemo(() =>
    devolucionesPorCategoria.map(d => {
      const vendida = ventasPorCategoria['30d'].find(v => v.categoria === d.categoria);
      return { ...d, pctDevolucion: vendida ? ((d.cantidad / vendida.unidades) * 100).toFixed(1) : '—' };
    }), []);

  return (
    <InformeLayout titulo="Categorías más devueltas" icono="fa-undo" color="text-danger">

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><KpiCard label="Total devueltas" value={totalDev} icon="fa-boxes" accent="#dc3545" bg="#f8d7da" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Monto devuelto" value={$(montoDev)} icon="fa-dollar-sign" accent="#fd7e14" bg="#ffe5d0" /></div>
        <div className="col-6 col-md-3"><KpiCard label="% sobre vendidas" value={`${pct}%`} icon="fa-percent" accent="#6f42c1" bg="#e2d9f3" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Categoría más devuelta" value={masDevuelta.categoria} icon="fa-exclamation-triangle" accent="#ffc107" bg="#fff3cd" sub={`${masDevuelta.cantidad} devoluciones`} /></div>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Devoluciones por categoría</h6></div>
        <div className="card-body">
          <HBarChart data={devolucionesPorCategoria} valueKey="cantidad" labelKey="categoria" color="#dc3545" formatValue={v => `${v} unid.`} />
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Detalle por categoría</h6></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Devueltas</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>% Dev/Venta</th>
              </tr>
            </thead>
            <tbody>
              {dataConPct.map((d, i) => (
                <tr key={i}>
                  <td className="fw-medium">{d.categoria}</td>
                  <td className="text-center fw-bold text-danger">{d.cantidad}</td>
                  <td className="text-end">{$(d.monto)}</td>
                  <td className="text-center">
                    <span className={`badge rounded-pill ${parseFloat(d.pctDevolucion) > 5 ? 'bg-danger' : 'bg-success'}`}>
                      {d.pctDevolucion}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InformeLayout>
  );
};

export default CategoriasDevueltas;
