import React, { useState } from 'react';
import { useCajas } from '../hooks/useCajas';
import { AbrirCajaModal, MovimientoModal, CerrarCajaModal } from '../components';
import styles from './CajasPage.module.css';

const CajasPage = () => {
  const {
    cajaActual,
    cajaAyer,
    todasLasCajas,
    resumenCaja,
    loading,
    cajaAbierta,
    abrirCaja,
    registrarMovimiento,
    cerrarCaja,
  } = useCajas();

  const [activeTab, setActiveTab] = useState('actual');
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada');
  const [showCerrarModal, setShowCerrarModal] = useState(false);

  const handleAbrirMovimiento = (tipo) => {
    setTipoMovimiento(tipo);
    setShowMovimientoModal(true);
  };

  const handleAbrirCaja = async (monto) => {
    const ok = await abrirCaja(monto);
    if (ok) setShowAbrirModal(false);
  };

  const handleMovimiento = async (tipo, monto, descripcion) => {
    const ok = await registrarMovimiento(tipo, monto, descripcion);
    if (ok) setShowMovimientoModal(false);
  };

  const handleCerrarCaja = async (monto) => {
    const ok = await cerrarCaja(monto);
    if (ok) setShowCerrarModal(false);
  };

  const horaApertura = cajaActual?.horaApertura
    ? new Date(cajaActual.horaApertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="container-fluid p-4">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="row mb-4 pb-3 border-bottom align-items-center">
        <div className="col">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 48, height: 48,
                backgroundColor: cajaAbierta ? '#d1e7dd' : '#f8d7da',
              }}
            >
              <i className={`fa ${cajaAbierta ? 'fa-lock-open text-success' : 'fa-lock text-danger'} fa-lg`} />
            </div>
            <div>
              <h2 className="h3 mb-0 fw-bold">Gestión de Cajas</h2>
              <div className="d-flex align-items-center gap-2 mt-1">
                <span className={`badge rounded-pill ${cajaAbierta ? 'bg-success' : 'bg-danger'}`}>
                  {cajaAbierta ? 'Abierta' : 'Cerrada'}
                </span>
                {cajaAbierta && horaApertura && (
                  <small className="text-muted">
                    <i className="fa fa-clock me-1" />Desde las {horaApertura}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto d-flex gap-2">
          {cajaAbierta ? (
            <>
              <button className="btn btn-sm btn-outline-success" onClick={() => handleAbrirMovimiento('entrada')} disabled={loading}>
                <i className="fa fa-plus me-1" />Entrada
              </button>
              <button className="btn btn-sm btn-outline-warning" onClick={() => handleAbrirMovimiento('salida')} disabled={loading}>
                <i className="fa fa-minus me-1" />Salida
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => setShowCerrarModal(true)} disabled={loading}>
                <i className="fa fa-lock me-1" />Cerrar Caja
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={() => setShowAbrirModal(true)} disabled={loading}>
              <i className="fa fa-unlock me-1" />Abrir Caja
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div className="mb-4">
        <ul className={`nav nav-tabs ${styles.tabs}`}>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'actual' ? styles.tabActive : styles.tabLink}`}
              onClick={() => setActiveTab('actual')}
            >
              <i className="fa fa-unlock me-2" />Caja Actual
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'historial' ? styles.tabActive : styles.tabLink}`}
              onClick={() => setActiveTab('historial')}
            >
              <i className="fa fa-history me-2" />Historial
              {todasLasCajas.length > 0 && (
                <span className="badge bg-secondary ms-2 rounded-pill">{todasLasCajas.length}</span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────────── */}
      {activeTab === 'actual' && (
        cajaAbierta
          ? <CajaAbiertaView resumenCaja={resumenCaja} cajaActual={cajaActual} styles={styles} />
          : <CajaCerradaView cajaAyer={cajaAyer} onAbrir={() => setShowAbrirModal(true)} />
      )}

      {activeTab === 'historial' && (
        <HistorialView todasLasCajas={todasLasCajas} styles={styles} />
      )}

      {/* ── MODALES ─────────────────────────────────────────────────── */}
      <AbrirCajaModal
        show={showAbrirModal}
        onClose={() => setShowAbrirModal(false)}
        onConfirm={handleAbrirCaja}
        loading={loading}
      />
      <MovimientoModal
        show={showMovimientoModal}
        tipoInicial={tipoMovimiento}
        onClose={() => setShowMovimientoModal(false)}
        onConfirm={handleMovimiento}
        loading={loading}
      />
      <CerrarCajaModal
        show={showCerrarModal}
        onClose={() => setShowCerrarModal(false)}
        onConfirm={handleCerrarCaja}
        loading={loading}
        montoSistema={resumenCaja?.montoCalculado || 0}
      />
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Sub-views
// ────────────────────────────────────────────────────────────────────────────

const STATS_CFG = [
  { key: 'montoInicial',   label: 'Monto Inicial', icon: 'fa-sign-in-alt',  accent: '#198754', bg: '#d1e7dd' },
  { key: 'totalEntradas',  label: 'Entradas',       icon: 'fa-arrow-up',    accent: '#0dcaf0', bg: '#cff4fc' },
  { key: 'totalSalidas',   label: 'Salidas',        icon: 'fa-arrow-down',  accent: '#fd7e14', bg: '#ffe5d0' },
  { key: 'montoCalculado', label: 'Monto Actual',   icon: 'fa-wallet',      accent: '#0d6efd', bg: '#cfe2ff', destacado: true },
];

const CajaAbiertaView = ({ resumenCaja, cajaActual, styles }) => (
  <>
    {/* Stats */}
    {resumenCaja && (
      <div className="row g-3 mb-4">
        {STATS_CFG.map(({ key, label, icon, accent, bg, destacado }) => (
          <div key={key} className="col-6 col-md-3">
            <div className={`card border-0 h-100 ${styles.statCard}`}
              style={{ borderLeft: `4px solid ${accent}` }}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className={styles.statLabel}>{label}</small>
                    <div className={`fw-bold mt-1 ${destacado ? 'fs-4' : 'fs-5'}`}
                      style={{ color: destacado ? accent : 'inherit' }}>
                      ${(resumenCaja[key] || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-2 p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ backgroundColor: bg }}>
                    <i className={`fa ${icon}`} style={{ color: accent }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Operaciones */}
    <div className="card">
      <div className="card-header d-flex align-items-center justify-content-between py-3">
        <h6 className="mb-0 fw-bold">
          <i className="fa fa-list-alt me-2 text-muted" />
          Operaciones del turno
        </h6>
        <small className="text-muted">
          {cajaActual?.operaciones?.length || 0} movimientos
        </small>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className={`table-light ${styles.tableHead}`}>
            <tr>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th className="text-end">Monto</th>
            </tr>
          </thead>
          <tbody>
            {cajaActual?.operaciones?.length > 0 ? (
              cajaActual.operaciones.map((op, idx) => (
                <tr key={idx}>
                  <td>
                    <small className="text-muted">
                      {new Date(op.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </td>
                  <td>
                    <OperacionBadge tipo={op.tipo} />
                  </td>
                  <td>
                    <span className="small">{op.descripcion}</span>
                  </td>
                  <td className="text-end">
                    <span className={`fw-semibold ${op.tipo === 'salida' ? 'text-danger' : op.tipo === 'apertura' ? 'text-muted' : 'text-success'}`}>
                      {op.tipo === 'salida' ? '−' : op.tipo === 'entrada' ? '+' : ''}
                      ${op.monto?.toFixed(2) ?? '—'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">
                  <i className="fa fa-inbox me-2 opacity-50" />
                  Sin operaciones aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

const CajaCerradaView = ({ cajaAyer, onAbrir }) => (
  <div className="row">
    {/* Empty state */}
    <div className="col-12 mb-4">
      <div className="card border-0 text-center py-5">
        <div className="card-body">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
            style={{ width: 80, height: 80, backgroundColor: '#fff3cd' }}>
            <i className="fa fa-cash-register fa-2x text-warning" />
          </div>
          <h4 className="fw-bold mb-2">No hay caja abierta hoy</h4>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 360 }}>
            Abrí la caja para comenzar a registrar las operaciones del día.
          </p>
          <button className="btn btn-primary px-4" onClick={onAbrir}>
            <i className="fa fa-unlock me-2" />Abrir Caja del Día
          </button>
        </div>
      </div>
    </div>

    {/* Resumen de ayer */}
    {cajaAyer ? (
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between py-3">
            <h6 className="mb-0 fw-bold">
              <i className="fa fa-calendar-day me-2 text-muted" />
              Resumen del turno anterior
            </h6>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">
                {new Date(cajaAyer.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </small>
              <span className="badge bg-secondary rounded-pill">{cajaAyer.estado}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {[
                { label: 'Monto Inicial',   valor: cajaAyer.montoInicial,  esMoneda: true },
                { label: 'Monto Final',     valor: cajaAyer.montoActual,   esMoneda: true },
                { label: 'Operaciones',     valor: cajaAyer.operaciones?.length || 0 },
                ...(cajaAyer.resumenCierre ? [{
                  label: 'Diferencia',
                  valor: cajaAyer.resumenCierre.diferencia,
                  esMoneda: true,
                  esDiferencia: true,
                }] : []),
              ].map(({ label, valor, esMoneda, esDiferencia }) => {
                const color = esDiferencia
                  ? valor === 0 ? 'text-success' : valor > 0 ? 'text-primary' : 'text-danger'
                  : '';
                return (
                  <div key={label} className="col-6 col-md-3">
                    <div className="border rounded-3 p-3">
                      <small className="text-muted d-block mb-1">{label}</small>
                      <div className={`fs-5 fw-bold ${color}`}>
                        {esMoneda
                          ? `${esDiferencia && valor > 0 ? '+' : ''}$${Math.abs(valor).toFixed(2)}`
                          : valor}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="col-12">
        <div className="alert alert-light border d-flex align-items-center gap-2">
          <i className="fa fa-calendar-minus text-muted" />
          <span className="text-muted small">No hay resumen disponible del turno anterior.</span>
        </div>
      </div>
    )}
  </div>
);

const HistorialView = ({ todasLasCajas, styles }) => (
  <div className="card">
    <div className="card-header d-flex align-items-center justify-content-between py-3">
      <h6 className="mb-0 fw-bold">
        <i className="fa fa-history me-2 text-muted" />
        Historial de Cajas
      </h6>
      <small className="text-muted">{todasLasCajas.length} registros</small>
    </div>
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className={`table-light ${styles.tableHead}`}>
          <tr>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Apertura</th>
            <th>Monto Inicial</th>
            <th>Monto Final</th>
            <th className="text-center">Operaciones</th>
            <th className="text-end">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {todasLasCajas.length > 0 ? (
            [...todasLasCajas].reverse().map((caja) => {
              const dif = caja.resumenCierre?.diferencia;
              return (
                <tr key={caja.id}>
                  <td>
                    <span className="fw-medium">
                      {new Date(caja.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${caja.estado === 'abierta' ? 'bg-success' : 'bg-secondary'}`}>
                      {caja.estado}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">
                      {caja.horaApertura
                        ? new Date(caja.horaApertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </small>
                  </td>
                  <td>${caja.montoInicial.toFixed(2)}</td>
                  <td>${caja.montoActual.toFixed(2)}</td>
                  <td className="text-center">
                    <span className="badge bg-info text-dark rounded-pill">
                      {caja.operaciones?.length || 0}
                    </span>
                  </td>
                  <td className="text-end fw-semibold">
                    {dif !== undefined && dif !== null ? (
                      <span className={dif === 0 ? 'text-success' : dif > 0 ? 'text-primary' : 'text-danger'}>
                        {dif > 0 ? '+' : ''}${dif.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-muted">
                <i className="fa fa-inbox me-2 opacity-50" />
                No hay cajas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const OperacionBadge = ({ tipo }) => {
  const cfg = {
    apertura: { label: 'Apertura', cls: 'bg-primary' },
    entrada:  { label: 'Entrada',  cls: 'bg-success' },
    salida:   { label: 'Salida',   cls: 'bg-warning text-dark' },
    cierre:   { label: 'Cierre',   cls: 'bg-danger' },
  };
  const { label, cls } = cfg[tipo] ?? { label: tipo, cls: 'bg-secondary' };
  return <span className={`badge rounded-pill ${cls}`}>{label}</span>;
};

export default CajasPage;
