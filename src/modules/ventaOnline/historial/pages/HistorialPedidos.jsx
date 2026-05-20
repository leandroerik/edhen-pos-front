import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { listarPedidos } from '../../services/pedidosOnlineService';
import { imprimirTicket } from '../../../../shared/components/TPV/TPVUtils';

const ESTADOS = {
  enviado:    { label: 'Enviado',    color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-truck' },
  finalizado: { label: 'Finalizado', color: '#198754', bg: '#d1e7dd', icon: 'fa-check-double' },
};

const STAT_CONFIG = [
  { key: 'enviados',    label: 'Enviados',    icon: 'fa-truck',        color: '#0d6efd', bg: '#cfe2ff' },
  { key: 'finalizados', label: 'Finalizados', icon: 'fa-check-double', color: '#198754', bg: '#d1e7dd' },
  { key: 'recaudado',   label: 'Recaudado',   icon: 'fa-dollar-sign',  color: '#6f42c1', bg: '#e8d5ff' },
  { key: 'total',       label: 'Total',       icon: 'fa-receipt',      color: '#fd7e14', bg: '#ffe5d0' },
];

const HistorialPedidos = () => {
  const [pedidos, setPedidos]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarPedidos({ estado: ['enviado', 'finalizado'] });
      const todos = (res.data || []).filter(
        (p) => p.estado === 'enviado' || p.estado === 'finalizado'
      );
      setPedidos(todos);
    } catch {
      toast.error('Error al cargar historial de pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPedidos(); }, [loadPedidos]);

  const pedidosFiltrados = useMemo(() => pedidos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const okSearch = !searchTerm ||
      p.numeroPedido?.toLowerCase().includes(term) ||
      p.cliente?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term);
    const okEstado = !filtroEstado || p.estado === filtroEstado;
    const fecha = p.fecha ? new Date(p.fecha) : null;
    const okStart = !startDate || (fecha && fecha >= new Date(startDate));
    const okEnd   = !endDate   || (fecha && fecha <= new Date(endDate + 'T23:59:59'));
    return okSearch && okEstado && okStart && okEnd;
  }), [pedidos, searchTerm, filtroEstado, startDate, endDate]);

  const hayFiltros = searchTerm || filtroEstado || startDate || endDate;
  const limpiarFiltros = () => { setSearchTerm(''); setFiltroEstado(''); setStartDate(''); setEndDate(''); };

  const stats = {
    enviados:    pedidos.filter((p) => p.estado === 'enviado').length,
    finalizados: pedidos.filter((p) => p.estado === 'finalizado').length,
    recaudado:   `$${pedidos.filter((p) => p.estado === 'finalizado').reduce((s, p) => s + (p.total || 0), 0).toFixed(2)}`,
    total:       pedidos.length,
  };

  const handleExportar = () => {
    const rows = [
      ['Pedido', 'Fecha', 'Cliente', 'Email', 'Ciudad', 'Total', 'Estado'],
      ...pedidosFiltrados.map((p) => [
        p.numeroPedido,
        new Date(p.fecha).toLocaleDateString('es-AR'),
        p.cliente,
        p.email || '',
        p.envio?.ciudad || '',
        p.total?.toFixed(2) || '0.00',
        p.estado,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-pedidos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV descargado');
  };

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 fw-bold">
            <i className="fa fa-clock-rotate-left me-2 text-primary" />Historial de Pedidos
          </h1>
          <p className="text-muted small mb-0 mt-1">Pedidos enviados y finalizados</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleExportar} disabled={pedidosFiltrados.length === 0}>
            <i className="fa fa-download me-1" />CSV
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={loadPedidos} disabled={loading}>
            <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-rotate'} me-1`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {STAT_CONFIG.map(({ key, label, icon, color, bg }) => (
          <div key={key} className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, backgroundColor: bg, color }}>
                  <i className={`fa ${icon}`} />
                </div>
                <div>
                  <div className="text-muted small mb-0">{label}</div>
                  <div className="fw-bold fs-5" style={{ color }}>{stats[key]}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card border shadow-sm mb-3">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><i className="fa fa-search text-muted" /></span>
                <input type="text" className="form-control" placeholder="Pedido, cliente, email..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="enviado">Enviados</option>
                <option value="finalizado">Finalizados</option>
              </select>
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control form-control-sm" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} placeholder="Desde" />
            </div>
            <div className="col-md-2">
              <input type="date" className="form-control form-control-sm" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} placeholder="Hasta" />
            </div>
            <div className="col-md-auto">
              {hayFiltros && (
                <button className="btn btn-sm btn-outline-danger" onClick={limpiarFiltros} title="Limpiar filtros">
                  <i className="fa fa-xmark" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="mb-2">
        <span className="text-muted small">
          <span className="fw-semibold text-dark">{pedidosFiltrados.length}</span> pedidos
          {hayFiltros && <span className="badge bg-warning text-dark ms-2 rounded-pill">Filtros activos</span>}
        </span>
      </div>

      {/* Tabla */}
      <div className="card border shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="table-light border-bottom">
                <th className="ps-3 text-muted fw-semibold small" style={{ width: '11%' }}>Pedido</th>
                <th className="text-muted fw-semibold small" style={{ width: '10%' }}>Fecha</th>
                <th className="text-muted fw-semibold small" style={{ width: '23%' }}>Cliente</th>
                <th className="text-muted fw-semibold small" style={{ width: '18%' }}>Ciudad</th>
                <th className="text-muted fw-semibold small text-end" style={{ width: '10%' }}>Total</th>
                <th className="text-muted fw-semibold small" style={{ width: '14%' }}>Estado</th>
                <th className="text-muted fw-semibold small" style={{ width: '14%' }}>Forma de pago</th>
                <th className="text-muted fw-semibold small pe-3 text-end" style={{ width: '6%' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j}><div className="placeholder-glow"><span className="placeholder col-8 rounded" /></div></td>
                    ))}
                  </tr>
                ))
              ) : pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="fa fa-clock-rotate-left fa-2x d-block mb-2 opacity-25" />
                    No hay pedidos en el historial
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => {
                  const cfg = ESTADOS[pedido.estado] || { color: '#6c757d', bg: '#e9ecef', icon: 'fa-circle', label: pedido.estado };
                  return (
                    <tr key={pedido.id || pedido.numeroPedido}>
                      <td className="ps-3">
                        <span className="badge bg-light text-secondary border fw-semibold" style={{ fontSize: '0.78rem' }}>
                          {pedido.numeroPedido}
                        </span>
                      </td>
                      <td className="fw-semibold small">
                        {new Date(pedido.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                            style={{ width: 30, height: 30, fontSize: '0.72rem', backgroundColor: '#e9ecef', color: '#495057' }}>
                            {(pedido.envio?.nombre || pedido.cliente)?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="small fw-semibold">{pedido.envio?.nombre || pedido.cliente}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{pedido.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small">{pedido.envio?.ciudad || '—'}</td>
                      <td className="text-end fw-bold text-success">${(pedido.total || 0).toFixed(2)}</td>
                      <td>
                        <span className="badge rounded-pill d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 600 }}>
                          <i className={`fa ${cfg.icon}`} style={{ fontSize: '0.65rem' }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="small text-muted">{pedido.formaPago || '—'}</td>
                      <td className="pe-3 text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Imprimir ticket"
                          onClick={() => imprimirTicket(pedido)}>
                          <i className="fa fa-print" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorialPedidos;
