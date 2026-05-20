import React from 'react';
import InformeLayout from '../components/InformeLayout';
import HBarChart from '../components/HBarChart';
import KpiCard from '../components/KpiCard';
import { devolucionesPorMotivo, productosDevueltos, ventasPorDia } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const InformeDevoluciones = () => {
  const totalDev   = devolucionesPorMotivo.reduce((s, d) => s + d.cantidad, 0);
  const montoDev   = devolucionesPorMotivo.reduce((s, d) => s + d.monto, 0);
  const totalVentas = ventasPorDia['30d'].reduce((s, d) => s + d.ventas, 0);
  const pct        = ((montoDev / totalVentas) * 100).toFixed(1);
  const motivoPpal = devolucionesPorMotivo[0];

  return (
    <InformeLayout titulo="Devoluciones" icono="fa-undo-alt" color="text-warning">

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><KpiCard label="Total devoluciones" value={totalDev} icon="fa-box-open" accent="#dc3545" bg="#f8d7da" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Monto devuelto" value={$(montoDev)} icon="fa-dollar-sign" accent="#fd7e14" bg="#ffe5d0" /></div>
        <div className="col-6 col-md-3"><KpiCard label="% sobre ventas (mes)" value={`${pct}%`} icon="fa-percent" accent="#6f42c1" bg="#e2d9f3" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Motivo principal" value={motivoPpal.motivo} icon="fa-exclamation-circle" accent="#0dcaf0" bg="#cff4fc" sub={`${motivoPpal.cantidad} casos`} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Por motivo</h6></div>
            <div className="card-body">
              <HBarChart data={devolucionesPorMotivo} valueKey="cantidad" labelKey="motivo" color="#dc3545" formatValue={v => `${v} unid.`} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-dollar-sign me-2 text-muted" />Monto por motivo</h6></div>
            <div className="card-body">
              <HBarChart data={devolucionesPorMotivo} valueKey="monto" labelKey="motivo" color="#fd7e14" formatValue={v => $(v)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Productos más devueltos</h6></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cantidad</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {productosDevueltos.map((p, i) => (
                <tr key={i}>
                  <td><span className="badge bg-secondary rounded-pill">{i + 1}</span></td>
                  <td className="fw-medium">{p.nombre}</td>
                  <td><span className="badge bg-light text-dark border">{p.categoria}</span></td>
                  <td className="text-center fw-bold text-danger">{p.cantidad}</td>
                  <td className="text-end">{$(p.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InformeLayout>
  );
};

export default InformeDevoluciones;
