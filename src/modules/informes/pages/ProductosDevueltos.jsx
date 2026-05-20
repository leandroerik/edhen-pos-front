import React from 'react';
import InformeLayout from '../components/InformeLayout';
import HBarChart from '../components/HBarChart';
import KpiCard from '../components/KpiCard';
import { productosDevueltos, topProductos } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const ProductosDevueltos = () => {
  const totalDev   = productosDevueltos.reduce((s, d) => s + d.cantidad, 0);
  const montoDev   = productosDevueltos.reduce((s, d) => s + d.monto, 0);
  const totalVend  = topProductos['30d'].reduce((s, d) => s + d.unidades, 0);
  const pct        = ((totalDev / totalVend) * 100).toFixed(1);
  const masDevuelto = productosDevueltos[0];

  return (
    <InformeLayout titulo="Productos más devueltos" icono="fa-undo" color="text-danger">

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><KpiCard label="Total devueltos" value={totalDev} icon="fa-box-open" accent="#dc3545" bg="#f8d7da" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Monto total" value={$(montoDev)} icon="fa-dollar-sign" accent="#fd7e14" bg="#ffe5d0" /></div>
        <div className="col-6 col-md-3"><KpiCard label="% sobre vendidos" value={`${pct}%`} icon="fa-percent" accent="#6f42c1" bg="#e2d9f3" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Más devuelto" value={masDevuelto.nombre} icon="fa-exclamation-triangle" accent="#ffc107" bg="#fff3cd" sub={`${masDevuelto.cantidad} devoluciones`} /></div>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Productos por cantidad de devoluciones</h6></div>
        <div className="card-body">
          <HBarChart data={productosDevueltos} valueKey="cantidad" labelKey="nombre" color="#dc3545" formatValue={v => `${v} unid.`} />
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Detalle</h6></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Devueltos</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {productosDevueltos.map((p, i) => (
                <tr key={i}>
                  <td><span className="badge bg-danger rounded-pill">{i + 1}</span></td>
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

export default ProductosDevueltos;
