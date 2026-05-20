import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePanelStats } from './hooks/usePanelStats';
import { SALES_DATA, TODAY_SALES_DATA, QUICK_ACTIONS } from './utils/dashboardConfig';

// ─── Colores por índice de stat card ─────────────────────────────────────────
const STAT_PALETTE = [
  { bg: '#d1e7dd', color: '#198754' },
  { bg: '#cfe2ff', color: '#0d6efd' },
  { bg: '#cff4fc', color: '#0a8fa8' },
  { bg: '#ffe5d0', color: '#fd7e14' },
];

// ─── Encabezado coloreado reutilizable ────────────────────────────────────────
const CardHead = ({ icon, title, color, right }) => (
  <div className="d-flex align-items-center justify-content-between px-3 py-2"
    style={{ backgroundColor: color, borderRadius: '0.375rem 0.375rem 0 0' }}>
    <span className="fw-semibold text-white small">
      <i className={`fa ${icon} me-2`} />{title}
    </span>
    {right}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ stat, idx }) => {
  const { bg, color } = STAT_PALETTE[idx % STAT_PALETTE.length];
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 48, height: 48, backgroundColor: bg, color }}>
          <i className={`fa ${stat.icon}`} />
        </div>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="text-muted small">{stat.title}</div>
          <div className="fw-bold" style={{ fontSize: '1.5rem', color, lineHeight: 1.1 }}>{stat.value}</div>
          {stat.subtitle && (
            <div className="text-muted text-truncate" style={{ fontSize: '0.71rem', marginTop: 2 }}>{stat.subtitle}</div>
          )}
        </div>
        {stat.change !== 0 && (
          <span className="badge rounded-pill flex-shrink-0"
            style={{
              backgroundColor: stat.changeType === 'positive' ? '#d1e7dd' : '#f8d7da',
              color: stat.changeType === 'positive' ? '#198754' : '#842029',
              fontSize: '0.7rem', fontWeight: 600,
            }}>
            <i className={`fa fa-arrow-${stat.changeType === 'positive' ? 'up' : 'down'} me-1`}
              style={{ fontSize: '0.58rem' }} />
            {Math.abs(stat.change)}%
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Acciones Rápidas ─────────────────────────────────────────────────────────
const ACTION_COLORS = ['#198754', '#0d6efd', '#6f42c1', '#e07b2e', '#dc3545', '#343a40'];

const QuickActionsCard = ({ actions }) => (
  <div className="card border shadow-sm">
    <CardHead icon="fa-bolt" title="Acciones Rápidas" color="#e07b2e" />
    <div className="card-body p-3">
      <div className="d-flex flex-wrap gap-2">
        {actions.map((a, i) => {
          const c = ACTION_COLORS[i % ACTION_COLORS.length];
          return (
            <Link key={a.id} to={a.url} className="text-decoration-none">
              <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold"
                style={{
                  backgroundColor: c + '15', color: c,
                  border: `1px solid ${c}35`, fontSize: '0.83rem',
                  transition: 'all 0.15s',
                }}>
                <i className={`fa ${a.icon}`} style={{ fontSize: '0.8rem' }} />
                {a.title}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </div>
);

// ─── Gráfico de Ventas ────────────────────────────────────────────────────────
const SalesChartCard = ({ salesData, todayData }) => {
  const [tab, setTab] = useState('hoy');
  const weekData = salesData?.length > 0 ? salesData : SALES_DATA;
  const dayData  = todayData?.length  > 0 ? todayData  : TODAY_SALES_DATA;

  const WeekChart = () => {
    const maxV  = Math.max(...weekData.map(d => d.ventas));
    const maxP  = Math.max(...weekData.map(d => d.pedidos));
    const total = weekData.reduce((s, d) => s + d.ventas, 0);
    const prom  = Math.round(total / weekData.length);
    const best  = weekData.reduce((b, d) => d.ventas > b.ventas ? d : b, weekData[0]);
    return (
      <>
        <svg viewBox="0 0 400 170" style={{ width: '100%', height: 170 }}>
          <defs>
            <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d6efd" /><stop offset="100%" stopColor="#0d6efd" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {weekData.map((d, i) => {
            const h  = Math.max((d.ventas / maxV) * 110, 2);
            const x  = i * 50 + 25;
            const py = 140 - (d.pedidos / maxP) * 110;
            return (
              <g key={i}>
                <rect x={x} y={140 - h} width={20} height={h} fill="url(#gW)" rx="3" />
                <text x={x + 10} y={140 - h - 5} textAnchor="middle" fill="#6c757d" fontSize="9">
                  ${(d.ventas / 1000).toFixed(1)}k
                </text>
                <text x={x + 10} y={160} textAnchor="middle" fill="#6c757d" fontSize="11">{d.dia}</text>
                <circle cx={x + 10} cy={py} r="3.5" fill="#17a2b8" />
              </g>
            );
          })}
          <polyline
            points={weekData.map((d, i) => `${i * 50 + 35},${140 - (d.pedidos / maxP) * 110}`).join(' ')}
            fill="none" stroke="#17a2b8" strokeWidth="1.8" />
        </svg>
        <div className="d-flex gap-3 pt-2 border-top mt-1">
          {[
            { label: 'Total semana', value: `$${total.toLocaleString()}`, color: '#0d6efd' },
            { label: 'Promedio diario', value: `$${prom.toLocaleString()}`, color: '#17a2b8' },
            { label: 'Mejor día', value: best.dia, color: '#198754' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center flex-fill">
              <div className="text-muted" style={{ fontSize: '0.71rem' }}>{label}</div>
              <div className="fw-bold small" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const TodayChart = () => {
    const past    = dayData.filter(d => !d.futura);
    const maxV    = Math.max(...past.map(d => d.ventas), 1);
    const total   = past.reduce((s, d) => s + d.ventas, 0);
    const totalTx = past.reduce((s, d) => s + d.transacciones, 0);
    const pico    = past.reduce((b, d) => d.ventas > b.ventas ? d : b, past[0] || {});
    return (
      <>
        <svg viewBox="0 0 400 170" style={{ width: '100%', height: 170 }}>
          <defs>
            <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#198754" /><stop offset="100%" stopColor="#198754" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="gPico" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffc107" /><stop offset="100%" stopColor="#fd7e14" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {dayData.map((d, i) => {
            const h    = d.futura || d.ventas === 0 ? 0 : (d.ventas / maxV) * 110;
            const bx   = i * 38 + 18;
            const isPico = !d.futura && pico && d.ventas === pico.ventas && d.ventas > 0;
            return (
              <g key={i}>
                {d.futura
                  ? <rect x={bx} y={128} width={18} height={12} fill="none" stroke="#dee2e6" strokeWidth="1" strokeDasharray="3,2" rx="3" />
                  : h > 0
                    ? <rect x={bx} y={140 - h} width={18} height={h} fill={isPico ? 'url(#gPico)' : 'url(#gH)'} rx="3" />
                    : <rect x={bx} y={137} width={18} height={3} fill="#e9ecef" rx="2" />
                }
                {h > 0 && (
                  <text x={bx + 9} y={140 - h - 4} textAnchor="middle" fill="#6c757d" fontSize="9">${d.ventas}</text>
                )}
                <text x={bx + 9} y={160} textAnchor="middle" fill="#6c757d" fontSize="10">{d.hora}</text>
              </g>
            );
          })}
        </svg>
        <div className="d-flex gap-3 pt-2 border-top mt-1">
          {[
            { label: 'Total del día', value: `$${total.toLocaleString()}`, color: '#198754' },
            { label: 'Transacciones', value: totalTx, color: '#0d6efd' },
            { label: 'Hora pico', value: pico?.hora ?? '—', color: '#fd7e14' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center flex-fill">
              <div className="text-muted" style={{ fontSize: '0.71rem' }}>{label}</div>
              <div className="fw-bold small" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="card border shadow-sm h-100">
      <div className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ backgroundColor: tab === 'hoy' ? '#198754' : '#0d6efd', borderRadius: '0.375rem 0.375rem 0 0' }}>
        <span className="fw-semibold text-white small">
          <i className={`fa ${tab === 'hoy' ? 'fa-chart-bar' : 'fa-chart-line'} me-2`} />
          {tab === 'hoy' ? 'Ventas de Hoy' : 'Ventas Esta Semana'}
        </span>
        <div className="btn-group btn-group-sm">
          <button className={`btn btn-sm ${tab === 'hoy' ? 'btn-light' : 'btn-outline-light'}`}
            style={{ fontSize: '0.75rem' }} onClick={() => setTab('hoy')}>Hoy</button>
          <button className={`btn btn-sm ${tab === 'semana' ? 'btn-light' : 'btn-outline-light'}`}
            style={{ fontSize: '0.75rem' }} onClick={() => setTab('semana')}>Semana</button>
        </div>
      </div>
      <div className="card-body p-3">
        {tab === 'hoy' ? <TodayChart /> : <WeekChart />}
      </div>
    </div>
  );
};

// ─── Estado del Turno / Caja ──────────────────────────────────────────────────
const CajaCard = ({ info }) => {
  const abierta = info?.cajaEstado === 'Abierta';
  return (
    <div className="card border shadow-sm h-100">
      <CardHead icon="fa-cash-register" title="Estado del Turno" color="#0a8fa8"
        right={
          <span className="badge rounded-pill"
            style={{ backgroundColor: abierta ? '#d1e7dd' : '#f8d7da', color: abierta ? '#198754' : '#842029', fontSize: '0.71rem' }}>
            <i className={`fa ${abierta ? 'fa-lock-open' : 'fa-lock'} me-1`} />
            {info?.cajaEstado ?? '—'}
          </span>
        }
      />
      <div className="card-body p-3 d-flex flex-column gap-3">
        <div className="rounded-3 p-3 text-center"
          style={{ backgroundColor: abierta ? '#f0fdf4' : '#fff5f5', border: `1px solid ${abierta ? '#bbf7d0' : '#fecdd3'}` }}>
          <div className="text-muted small">Recaudado en el turno</div>
          <div className="fw-bold" style={{ fontSize: '1.9rem', color: abierta ? '#198754' : '#6c757d', lineHeight: 1.1 }}>
            {info?.totalTurno ?? '—'}
          </div>
          <div className="text-muted" style={{ fontSize: '0.71rem' }}>
            {info?.ventasTurno ?? 0} ventas · Apertura {info?.horaApertura ?? '—'}
          </div>
        </div>

        <div className="d-flex flex-column gap-2">
          {[
            { icon: 'fa-user-circle', label: 'Vendedor',    value: info?.vendedorActivo,              color: '#0d6efd' },
            { icon: 'fa-users',       label: 'Empleados',   value: `${info?.empleadosActivos ?? 0} activos`, color: '#0a8fa8' },
            { icon: 'fa-clock',       label: 'Horario',     value: info?.horario,                     color: '#6c757d' },
            { icon: 'fa-sync',        label: 'Tienda Nube', value: info?.ultimaSincronizacion,        color: '#198754' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="d-flex align-items-center gap-2">
              <i className={`fa ${icon} fa-fw`} style={{ color, fontSize: '0.85rem' }} />
              <div>
                <div className="text-muted" style={{ fontSize: '0.68rem', lineHeight: 1 }}>{label}</div>
                <div className="small fw-medium">{value ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <Link to="/cajas"
            className={`btn btn-sm w-100 ${abierta ? 'btn-outline-danger' : 'btn-outline-success'}`}>
            <i className={`fa ${abierta ? 'fa-sign-out-alt' : 'fa-sign-in-alt'} me-2`} />
            {abierta ? 'Cerrar Caja' : 'Abrir Caja'}
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Alertas ──────────────────────────────────────────────────────────────────
const ALERT_STYLE = {
  warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
  info:    { bg: '#cff4fc', border: '#0dcaf0', color: '#055160' },
  danger:  { bg: '#f8d7da', border: '#dc3545', color: '#842029' },
};

const AlertasCard = ({ alerts }) => (
  <div className="card border shadow-sm h-100">
    <CardHead icon="fa-bell" title="Alertas" color="#dc3545"
      right={
        alerts.length > 0 && (
          <span className="badge rounded-pill"
            style={{ backgroundColor: '#fff', color: '#dc3545', fontSize: '0.7rem' }}>
            {alerts.length}
          </span>
        )
      }
    />
    <div className="card-body p-3 d-flex flex-column gap-2">
      {alerts.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="fa fa-check-circle fa-2x d-block mb-2 text-success opacity-50" />
          <small>Sin alertas activas</small>
        </div>
      ) : alerts.map(a => {
        const s = ALERT_STYLE[a.type] || ALERT_STYLE.info;
        return (
          <div key={a.id} className="rounded p-2"
            style={{ backgroundColor: s.bg, borderLeft: `3px solid ${s.border}` }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <i className={`fa ${a.icon} fa-fw`} style={{ color: s.color, fontSize: '0.8rem' }} />
              <span className="fw-semibold small" style={{ color: s.color }}>{a.title}</span>
            </div>
            <div className="small text-muted ms-4 mb-1">{a.message}</div>
            {a.actionUrl && (
              <Link to={a.actionUrl}
                className="small fw-semibold text-decoration-none ms-4"
                style={{ color: s.color }}>
                {a.action} →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Top Productos ────────────────────────────────────────────────────────────
const TopProductosCard = ({ products }) => (
  <div className="card border shadow-sm h-100">
    <CardHead icon="fa-fire" title="Top Productos del Día" color="#6f42c1" />
    <div className="card-body p-0">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr className="table-light border-bottom">
            <th className="ps-3 text-muted fw-semibold small">#</th>
            <th className="text-muted fw-semibold small">Producto</th>
            <th className="text-muted fw-semibold small text-center">Uds.</th>
            <th className="text-muted fw-semibold small text-end pe-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id}>
              <td className="ps-3">
                <span className="fw-bold text-muted" style={{ fontSize: '0.78rem' }}>{i + 1}</span>
              </td>
              <td>
                <div className="small fw-semibold">{p.name}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{p.variant}</div>
              </td>
              <td className="text-center">
                <span className="badge rounded-pill"
                  style={{ backgroundColor: '#e8d5ff', color: '#6f42c1', fontSize: '0.72rem' }}>
                  {p.sales}
                </span>
              </td>
              <td className="text-end pe-3">
                <div className="d-flex align-items-center justify-content-end gap-1">
                  <span className="small fw-bold text-success">{p.revenue}</span>
                  <i className={`fa fa-arrow-${p.trend}`}
                    style={{ fontSize: '0.6rem', color: p.trend === 'up' ? '#198754' : '#dc3545' }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Actividad Reciente ───────────────────────────────────────────────────────
const ACT_COLORS = {
  venta:      { bg: '#d1e7dd', color: '#198754' },
  pedido:     { bg: '#cff4fc', color: '#0a8fa8' },
  stock:      { bg: '#fff3cd', color: '#856404' },
  cliente:    { bg: '#cfe2ff', color: '#0d6efd' },
  devolucion: { bg: '#f8d7da', color: '#842029' },
};

const ActividadCard = ({ activities }) => (
  <div className="card border shadow-sm h-100">
    <CardHead icon="fa-clock-rotate-left" title="Actividad Reciente" color="#343a40" />
    <div className="card-body p-3 d-flex flex-column gap-3">
      {activities.map(a => {
        const c = ACT_COLORS[a.type] || { bg: '#e9ecef', color: '#6c757d' };
        return (
          <div key={a.id} className="d-flex align-items-start gap-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 30, height: 30, backgroundColor: c.bg, color: c.color, fontSize: '0.68rem', marginTop: 2 }}>
              <i className={`fa ${a.icon}`} />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="small fw-semibold text-truncate">{a.title}</div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.71rem' }}>{a.description}</div>
            </div>
            <div className="text-muted flex-shrink-0" style={{ fontSize: '0.68rem', marginTop: 2 }}>{a.time}</div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Dashboard Principal ──────────────────────────────────────────────────────
const Dashboard = () => {
  const {
    stats, salesData, todaySalesData, recentActivities,
    alerts, topProducts, businessInfo, isLoading, refreshStats,
  } = usePanelStats();

  useEffect(() => { refreshStats(); }, [refreshStats]);

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 fw-bold">
            <i className="fa fa-gauge me-2 text-primary" />Panel de Control
          </h1>
          <p className="text-muted small mb-0 mt-1" style={{ textTransform: 'capitalize' }}>{today}</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={refreshStats} disabled={isLoading}>
          <i className={`fa ${isLoading ? 'fa-spinner fa-spin' : 'fa-rotate'} me-1`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Fila 1: Estadísticas */}
      <div className="row g-3 mb-4">
        {stats.map((stat, i) => (
          <div key={stat.id} className="col-6 col-lg-3">
            <StatCard stat={stat} idx={i} />
          </div>
        ))}
      </div>

      {/* Fila 2: Acciones rápidas */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <QuickActionsCard actions={QUICK_ACTIONS} />
        </div>
      </div>

      {/* Fila 3: Gráfico + Caja */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <SalesChartCard salesData={salesData} todayData={todaySalesData} />
        </div>
        <div className="col-lg-4">
          <CajaCard info={businessInfo} />
        </div>
      </div>

      {/* Fila 4: Top productos + Alertas + Actividad */}
      <div className="row g-3">
        <div className="col-lg-5">
          <TopProductosCard products={topProducts} />
        </div>
        <div className="col-lg-3">
          <AlertasCard alerts={alerts} />
        </div>
        <div className="col-lg-4">
          <ActividadCard activities={recentActivities} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
