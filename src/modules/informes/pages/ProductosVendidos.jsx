import React, { useState, useMemo } from 'react';
import InformeLayout from '../components/InformeLayout';
import HBarChart from '../components/HBarChart';
import KpiCard from '../components/KpiCard';
import { topProductos } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const ProductosVendidos = () => {
  const [periodo, setPeriodo] = useState('7d');
  const [vista, setVista] = useState('unidades');
  const data = topProductos[periodo];

  const totalUnidades = useMemo(() => data.reduce((s, d) => s + d.unidades, 0), [data]);
  const totalMonto    = useMemo(() => data.reduce((s, d) => s + d.monto, 0), [data]);
  const estrella      = data[0];

  return (
    <InformeLayout titulo="Productos más vendidos" icono="fa-star" color="text-warning" periodo={periodo} onPeriodo={setPeriodo}>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4"><KpiCard label="Unidades vendidas" value={totalUnidades.toLocaleString('es-AR')} icon="fa-boxes" accent="#198754" bg="#d1e7dd" /></div>
        <div className="col-6 col-md-4"><KpiCard label="Monto total" value={$(totalMonto)} icon="fa-dollar-sign" accent="#0d6efd" bg="#cfe2ff" /></div>
        <div className="col-12 col-md-4"><KpiCard label="Producto estrella" value={estrella.nombre} icon="fa-trophy" accent="#ffc107" bg="#fff3cd" sub={`${estrella.unidades} unidades — ${$(estrella.monto)}`} /></div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between py-3">
          <h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Ranking de productos</h6>
          <div className="btn-group btn-group-sm">
            <button className={`btn ${vista === 'unidades' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('unidades')}>Unidades</button>
            <button className={`btn ${vista === 'monto' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('monto')}>Monto</button>
          </div>
        </div>
        <div className="card-body">
          <HBarChart
            data={data}
            valueKey={vista}
            labelKey="nombre"
            color="#0d6efd"
            formatValue={vista === 'monto' ? v => $(v) : v => `${v} u.`}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Detalle completo</h6></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unidades</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>% del total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}>
                  <td><span className={`badge rounded-pill ${i === 0 ? 'bg-warning text-dark' : 'bg-secondary'}`}>{i + 1}</span></td>
                  <td className="fw-medium">{p.nombre}</td>
                  <td><span className="badge bg-light text-dark border">{p.categoria}</span></td>
                  <td className="text-center fw-bold">{p.unidades}</td>
                  <td className="text-end">{$(p.monto)}</td>
                  <td className="text-end text-muted">{((p.monto / totalMonto) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InformeLayout>
  );
};

export default ProductosVendidos;
