import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './SalesChart.module.css';

const SalesChart = ({ salesData = [], todayData = [] }) => {
  const [activeTab, setActiveTab] = useState('hoy');

  const defaultWeekData = [
    { dia: 'Lun', ventas: 1200, pedidos: 8 },
    { dia: 'Mar', ventas: 1900, pedidos: 12 },
    { dia: 'Mié', ventas: 800,  pedidos: 6 },
    { dia: 'Jue', ventas: 2400, pedidos: 15 },
    { dia: 'Vie', ventas: 1800, pedidos: 11 },
    { dia: 'Sáb', ventas: 3200, pedidos: 18 },
    { dia: 'Dom', ventas: 1500, pedidos: 9 },
  ];

  const defaultTodayData = [
    { hora: '9h',  ventas: 0,   transacciones: 0, futura: false },
    { hora: '10h', ventas: 320, transacciones: 2, futura: false },
    { hora: '11h', ventas: 580, transacciones: 4, futura: false },
    { hora: '12h', ventas: 210, transacciones: 1, futura: false },
    { hora: '13h', ventas: 450, transacciones: 3, futura: false },
    { hora: '14h', ventas: 120, transacciones: 1, futura: false },
    { hora: '15h', ventas: 680, transacciones: 4, futura: false },
    { hora: '16h', ventas: 390, transacciones: 2, futura: false },
    { hora: '17h', ventas: 0,   transacciones: 0, futura: true },
    { hora: '18h', ventas: 0,   transacciones: 0, futura: true },
  ];

  const weekData  = salesData.length > 0  ? salesData  : defaultWeekData;
  const dayData   = todayData.length > 0  ? todayData  : defaultTodayData;

  // ── GRÁFICO SEMANAL ──────────────────────────────────────────────────────────
  const renderWeeklyChart = () => {
    const maxVentas  = Math.max(...weekData.map(d => d.ventas));
    const maxPedidos = Math.max(...weekData.map(d => d.pedidos));
    const totalSemana = weekData.reduce((s, d) => s + d.ventas, 0);
    const promedio    = Math.round(totalSemana / weekData.length);

    return (
      <>
        <div className={styles.chartWrapper}>
          <svg className={styles.chart} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="gridWeek" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="barGradientWeek" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d6efd" />
                <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridWeek)" />

            {weekData.map((item, i) => {
              const barH = (item.ventas / maxVentas) * 120;
              const x = i * 50 + 30;
              const y = 160 - barH;
              return (
                <g key={i}>
                  <rect x={x} y={y} width="16" height={barH}
                    fill="url(#barGradientWeek)" className={styles.bar} rx="3" />
                  <text x={x + 8} y={y - 5} textAnchor="middle"
                    className={styles.barLabel} fontSize="10">
                    ${item.ventas}
                  </text>
                </g>
              );
            })}

            {/* Línea de pedidos */}
            <polyline
              points={weekData.map((item, i) => {
                const py = 160 - (item.pedidos / maxPedidos) * 120;
                const px = i * 50 + 38;
                return `${px},${py}`;
              }).join(' ')}
              fill="none" stroke="#17a2b8" strokeWidth="2" className={styles.line}
            />
            {weekData.map((item, i) => {
              const py = 160 - (item.pedidos / maxPedidos) * 120;
              const px = i * 50 + 38;
              return (
                <g key={`p-${i}`}>
                  <circle cx={px} cy={py} r="4" fill="#17a2b8" className={styles.point} />
                  <text x={px} y={py - 8} textAnchor="middle"
                    className={styles.pointLabel} fontSize="9">{item.pedidos}</text>
                </g>
              );
            })}

            {weekData.map((item, i) => (
              <text key={`l-${i}`} x={i * 50 + 38} y="180"
                textAnchor="middle" className={styles.axisLabel} fontSize="11">
                {item.dia}
              </text>
            ))}
          </svg>
        </div>

        <div className="row mt-3 text-center">
          <div className="col-4">
            <div className={styles.summaryBox}>
              <small className="text-muted d-block">Total semana</small>
              <strong className="text-primary">${totalSemana.toLocaleString()}</strong>
            </div>
          </div>
          <div className="col-4">
            <div className={styles.summaryBox}>
              <small className="text-muted d-block">Promedio diario</small>
              <strong className="text-info">${promedio.toLocaleString()}</strong>
            </div>
          </div>
          <div className="col-4">
            <div className={styles.summaryBox}>
              <small className="text-muted d-block">Mejor día</small>
              <strong className="text-success">
                {weekData.reduce((best, d) => d.ventas > best.ventas ? d : best, weekData[0]).dia}
              </strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── GRÁFICO DE HOY (por hora) ────────────────────────────────────────────────
  const renderTodayChart = () => {
    const pastData   = dayData.filter(d => !d.futura);
    const maxVentas  = Math.max(...pastData.map(d => d.ventas), 1);
    const totalHoy   = pastData.reduce((s, d) => s + d.ventas, 0);
    const totalTx    = pastData.reduce((s, d) => s + d.transacciones, 0);
    const horaPico   = pastData.reduce((best, d) => d.ventas > best.ventas ? d : best, pastData[0]);

    // SVG: 10 franjas × 40px = 400px, con 10px de margen a cada lado
    const SLOT_W  = 38;
    const BAR_W   = 18;
    const MARGIN  = 10;
    const MAX_H   = 120;
    const BASE_Y  = 160;

    return (
      <>
        <div className={styles.chartWrapper}>
          <svg className={styles.chart} viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="barGradientHoy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#198754" />
                <stop offset="100%" stopColor="#198754" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="barGradientPico" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffc107" />
                <stop offset="100%" stopColor="#fd7e14" stopOpacity="0.8" />
              </linearGradient>
              <pattern id="gridHoy" width="38" height="20" patternUnits="userSpaceOnUse">
                <path d="M 38 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridHoy)" />

            {dayData.map((item, i) => {
              const barH  = item.futura || item.ventas === 0
                ? 0
                : (item.ventas / maxVentas) * MAX_H;
              const x     = i * SLOT_W + MARGIN;
              const barX  = x + (SLOT_W - BAR_W) / 2;
              const y     = BASE_Y - barH;
              const isPico = !item.futura && item.ventas === horaPico?.ventas && item.ventas > 0;

              return (
                <g key={i}>
                  {item.futura ? (
                    // Hora futura: outline punteado gris
                    <rect
                      x={barX} y={BASE_Y - 20} width={BAR_W} height={20}
                      fill="none" stroke="#dee2e6" strokeWidth="1"
                      strokeDasharray="3,2" rx="3"
                    />
                  ) : barH > 0 ? (
                    <rect
                      x={barX} y={y} width={BAR_W} height={barH}
                      fill={isPico ? 'url(#barGradientPico)' : 'url(#barGradientHoy)'}
                      className={styles.bar} rx="3"
                    />
                  ) : (
                    // Hora pasada sin ventas (apertura, etc.)
                    <rect
                      x={barX} y={BASE_Y - 4} width={BAR_W} height={4}
                      fill="#e9ecef" rx="2"
                    />
                  )}

                  {/* Etiqueta de valor */}
                  {barH > 0 && (
                    <text x={barX + BAR_W / 2} y={y - 4}
                      textAnchor="middle" className={styles.barLabel} fontSize="9">
                      ${item.ventas}
                    </text>
                  )}

                  {/* Etiqueta hora */}
                  <text x={x + SLOT_W / 2} y="180"
                    textAnchor="middle" className={styles.axisLabel} fontSize="10">
                    {item.hora}
                  </text>

                  {/* Indicador hora pico */}
                  {isPico && (
                    <text x={barX + BAR_W / 2} y={y - 14}
                      textAnchor="middle" fontSize="9" fill="#fd7e14" fontWeight="bold">
                      ★
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="row mt-3 text-center">
          <div className="col-4">
            <div className={styles.summaryBox}>
              <small className="text-muted d-block">Total del día</small>
              <strong className="text-success">${totalHoy.toLocaleString()}</strong>
            </div>
          </div>
          <div className="col-4">
            <div className={styles.summaryBox}>
              <small className="text-muted d-block">Transacciones</small>
              <strong className="text-primary">{totalTx}</strong>
            </div>
          </div>
          <div className="col-4">
            <div className={styles.summaryBox}>
              <small className="text-muted d-block">Hora pico</small>
              <strong className="text-warning">{horaPico?.hora ?? '—'}</strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">
          <i className={`fa ${activeTab === 'hoy' ? 'fa-chart-bar text-success' : 'fa-chart-line text-info'} me-2`}></i>
          {activeTab === 'hoy' ? 'Ventas de Hoy' : 'Ventas Esta Semana'}
        </h6>
        <div className="d-flex align-items-center gap-3">
          {activeTab === 'semana' && (
            <div className="d-flex gap-3">
              <div className="d-flex align-items-center">
                <div className="rounded me-1" style={{ width: 10, height: 10, background: '#0d6efd' }}></div>
                <small className="text-muted">Ventas ($)</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-1" style={{ width: 10, height: 10, background: '#17a2b8' }}></div>
                <small className="text-muted">Pedidos</small>
              </div>
            </div>
          )}
          {activeTab === 'hoy' && (
            <div className="d-flex gap-2">
              <div className="d-flex align-items-center">
                <div className="rounded me-1" style={{ width: 10, height: 10, background: '#198754' }}></div>
                <small className="text-muted">Completada</small>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-1" style={{ width: 10, height: 10, border: '1px dashed #adb5bd' }}></div>
                <small className="text-muted">Pendiente</small>
              </div>
            </div>
          )}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${activeTab === 'hoy' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('hoy')}
            >
              Hoy
            </button>
            <button
              className={`btn ${activeTab === 'semana' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('semana')}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className={`card-body ${styles.chartContainer}`}>
        {activeTab === 'hoy' ? renderTodayChart() : renderWeeklyChart()}
      </div>
    </div>
  );
};

SalesChart.propTypes = {
  salesData: PropTypes.arrayOf(PropTypes.shape({
    dia: PropTypes.string.isRequired,
    ventas: PropTypes.number.isRequired,
    pedidos: PropTypes.number.isRequired,
  })),
  todayData: PropTypes.arrayOf(PropTypes.shape({
    hora: PropTypes.string.isRequired,
    ventas: PropTypes.number.isRequired,
    transacciones: PropTypes.number.isRequired,
    futura: PropTypes.bool,
  })),
};

export default SalesChart;
