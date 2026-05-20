import React, { useState, useMemo } from 'react';
import InformeLayout from '../components/InformeLayout';
import HBarChart from '../components/HBarChart';
import KpiCard from '../components/KpiCard';
import { ventasPorVendedor } from '../utils/informesData';

const $ = n => `$${n.toLocaleString('es-AR')}`;

const AVATARES = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1'];

const InformeVendedores = () => {
  const [periodo, setPeriodo] = useState('7d');
  const data = ventasPorVendedor[periodo];

  const totalVentas = useMemo(() => data.reduce((s, d) => s + d.ventas, 0), [data]);
  const totalTx     = useMemo(() => data.reduce((s, d) => s + d.transacciones, 0), [data]);
  const estrella    = data[0];

  return (
    <InformeLayout titulo="Informe de Vendedores" icono="fa-users" color="text-primary" periodo={periodo} onPeriodo={setPeriodo}>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><KpiCard label="Total ventas equipo" value={$(totalVentas)} icon="fa-dollar-sign" accent="#0d6efd" bg="#cfe2ff" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Transacciones" value={totalTx} icon="fa-receipt" accent="#198754" bg="#d1e7dd" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Vendedores activos" value={data.length} icon="fa-user-check" accent="#6f42c1" bg="#e2d9f3" /></div>
        <div className="col-6 col-md-3"><KpiCard label="Vendedor estrella" value={estrella.vendedor.split(' ')[0]} icon="fa-trophy" accent="#ffc107" bg="#fff3cd" sub={$(estrella.ventas)} /></div>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-chart-bar me-2 text-muted" />Ventas por vendedor</h6></div>
        <div className="card-body">
          <HBarChart data={data} valueKey="ventas" labelKey="vendedor" color="#0d6efd" formatValue={v => $(v)} />
        </div>
      </div>

      <div className="card">
        <div className="card-header py-3"><h6 className="mb-0 fw-bold"><i className="fa fa-table me-2 text-muted" />Comparativa de rendimiento</h6></div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendedor</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventas</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tx</th>
                <th className="text-end" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket prom.</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dev.</th>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 120 }}>% del total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v, i) => {
                const pct = ((v.ventas / totalVentas) * 100).toFixed(1);
                return (
                  <tr key={i}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                          style={{ width: 30, height: 30, backgroundColor: AVATARES[i], color: '#fff', fontSize: '0.7rem' }}>
                          {v.vendedor.split(' ').map(p => p[0]).join('').slice(0, 2)}
                        </div>
                        <span className="fw-medium">{v.vendedor}</span>
                        {i === 0 && <span className="badge bg-warning text-dark ms-1">⭐</span>}
                      </div>
                    </td>
                    <td className="text-end fw-bold">{$(v.ventas)}</td>
                    <td className="text-center"><span className="badge bg-primary rounded-pill">{v.transacciones}</span></td>
                    <td className="text-end text-muted">{$(v.ticket)}</td>
                    <td className="text-center"><span className={`badge rounded-pill ${v.devoluciones > 10 ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>{v.devoluciones}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1 bg-light rounded" style={{ height: 6 }}>
                          <div className="rounded" style={{ height: 6, width: `${pct}%`, backgroundColor: AVATARES[i] }} />
                        </div>
                        <small className="text-muted">{pct}%</small>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-light fw-bold">
              <tr>
                <td>Total equipo</td>
                <td className="text-end">{$(totalVentas)}</td>
                <td className="text-center">{totalTx}</td>
                <td className="text-end">{$(Math.round(totalVentas / totalTx))}</td>
                <td className="text-center">{data.reduce((s, d) => s + d.devoluciones, 0)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </InformeLayout>
  );
};

export default InformeVendedores;
