import React, { useState, useMemo } from 'react';
import InformeLayout from '../components/InformeLayout';
import HBarChart from '../components/HBarChart';
import KpiCard from '../components/KpiCard';
import { ventasPorCategoria } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const COLORES_CAT = ['#0d6efd', '#198754', '#0dcaf0', '#fd7e14', '#6f42c1', '#20c997'];

const CategoriasVendidas = () => {
  const [periodo, setPeriodo] = useState('7d');
  const [vista, setVista] = useState('monto');
  const data = ventasPorCategoria[periodo];

  const totalMonto    = useMemo(() => data.reduce((s, d) => s + d.monto, 0), [data]);
  const totalUnidades = useMemo(() => data.reduce((s, d) => s + d.unidades, 0), [data]);
  const lider         = data.reduce((b, d) => d[vista] > b[vista] ? d : b, data[0]);

  return (
    <InformeLayout titulo="Categorías más vendidas" icono="fa-tags" color="text-info" periodo={periodo} onPeriodo={setPeriodo}>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><KpiCard label="Monto total" value={$(totalMonto)} icon="fa-dollar-sign" accent="#0d6efd" bg="#cfe2ff" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Unidades vendidas" value={totalUnidades.toLocaleString()} icon="fa-boxes" accent="#198754" bg="#d1e7dd" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Categorías activas" value={data.length} icon="fa-layer-group" accent="#6f42c1" bg="#e2d9f3" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Categoría líder" value={lider.categoria} icon="fa-crown" accent="#ffc107" bg="#fff3cd" sub={vista === 'monto' ? $(lider.monto) : `${lider.unidades} u.`} /></div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between py-3">
          <h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Ventas por categoría</h6>
          <div className="btn-group btn-group-sm">
            <button className={`btn ${vista === 'monto' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('monto')}>Monto</button>
            <button className={`btn ${vista === 'unidades' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setVista('unidades')}>Unidades</button>
          </div>
        </div>
        <div className="card-body">
          <HBarChart
            data={data}
            valueKey={vista}
            labelKey="categoria"
            color="#0d6efd"
            formatValue={vista === 'monto' ? v => $(v) : v => `${v} u.`}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Participación por categoría</h6></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unidades</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 140 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => {
                const pct = ((d.monto / totalMonto) * 100).toFixed(1);
                return (
                  <tr key={i}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="rounded" style={{ width: 10, height: 10, backgroundColor: COLORES_CAT[i], flexShrink: 0 }} />
                        <span className="fw-medium">{d.categoria}</span>
                      </div>
                    </td>
                    <td className="text-center">{d.unidades}</td>
                    <td className="text-end fw-bold">{$(d.monto)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1 bg-light rounded" style={{ height: 6 }}>
                          <div className="rounded" style={{ height: 6, width: `${pct}%`, backgroundColor: COLORES_CAT[i] }} />
                        </div>
                        <small className="text-muted">{pct}%</small>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </InformeLayout>
  );
};

export default CategoriasVendidas;
