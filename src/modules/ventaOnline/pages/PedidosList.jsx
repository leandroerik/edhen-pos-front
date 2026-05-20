import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { listarPedidos, cambiarEstadoPedido } from '../services/pedidosOnlineService';
import { imprimirTicket } from '../../../shared/components/TPV/TPVUtils';
import TrazabilidadModal from '../components/TrazabilidadModal';
import PedidoDetalleModal from '../components/PedidoDetalleModal';
import EtiquetaTransporteModal from '../components/EtiquetaTransporteModal';

const ESTADOS = {
  recibido:   { label: 'Recibido',   color: '#0a8fa8', bg: '#cff4fc', icon: 'fa-inbox' },
  preparado:  { label: 'Preparado',  color: '#e07b2e', bg: '#ffe5d0', icon: 'fa-box-open' },
  enviado:    { label: 'Enviado',    color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-truck' },
  finalizado: { label: 'Finalizado', color: '#198754', bg: '#d1e7dd', icon: 'fa-check-double' },
};

const FLOW = ['recibido', 'preparado', 'enviado', 'finalizado'];

function useDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return { open, setOpen, wrapRef };
}

function EstadoDropdown({ pedido, onCambiar }) {
  const { open, setOpen, wrapRef } = useDropdown();
  const cfg = ESTADOS[pedido.estado] || { color: '#6c757d', bg: '#e9ecef', label: pedido.estado || '—', icon: 'fa-circle' };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-sm d-inline-flex align-items-center gap-1 fw-semibold"
        style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
        onClick={() => setOpen((o) => !o)}>
        <i className={`fa ${cfg.icon}`} style={{ fontSize: '0.65rem' }} />
        {cfg.label}
        <i className="fa fa-chevron-down" style={{ fontSize: '0.55rem', opacity: 0.6 }} />
      </button>
      {open && (
        <div className="bg-white border rounded shadow"
          style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200, minWidth: 160 }}>
          {FLOW.map((key) => {
            const s = ESTADOS[key];
            const active = pedido.estado === key;
            return (
              <button key={key}
                className="dropdown-item py-2 d-flex align-items-center gap-2"
                style={active ? { backgroundColor: s.bg } : {}}
                onClick={() => { onCambiar(pedido.id, key); setOpen(false); }}>
                <i className={`fa ${s.icon}`} style={{ color: s.color, width: 16 }} />
                <span>{s.label}</span>
                {active && <i className="fa fa-check ms-auto text-muted" style={{ fontSize: '0.65rem' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RowActions({ pedido, onVerDetalle, onEtiqueta, onTrazabilidad, onImprimir }) {
  const { open, setOpen, wrapRef } = useDropdown();

  return (
    <div className="d-flex align-items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
      <button className="btn btn-sm btn-outline-primary" onClick={() => onVerDetalle(pedido)} title="Ver detalle">
        <i className="fa fa-eye" />
      </button>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen((o) => !o)}>
          <i className="fa fa-ellipsis-v" />
        </button>
        {open && (
          <div className="bg-white border rounded shadow"
            style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200, minWidth: 175 }}>
            <button className="dropdown-item py-2" onClick={() => { onImprimir(pedido); setOpen(false); }}>
              <i className="fa fa-print me-2 text-primary" />Imprimir ticket
            </button>
            <button className="dropdown-item py-2" onClick={() => { onEtiqueta(pedido); setOpen(false); }}>
              <i className="fa fa-truck me-2 text-success" />Etiqueta envío
            </button>
            <button className="dropdown-item py-2" onClick={() => { onTrazabilidad(pedido); setOpen(false); }}>
              <i className="fa fa-timeline me-2 text-info" />Trazabilidad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const PedidosList = () => {
  const [pedidos, setPedidos]                   = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [filtroEstado, setFiltroEstado]         = useState('');
  const [showTrazabilidad, setShowTrazabilidad] = useState(false);
  const [showDetalle, setShowDetalle]           = useState(false);
  const [showEtiqueta, setShowEtiqueta]         = useState(false);
  const [pedidoSel, setPedidoSel]               = useState(null);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarPedidos();
      setPedidos(res.data || []);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPedidos(); }, [loadPedidos]);

  const pedidosFiltrados = pedidos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const okSearch = !searchTerm ||
      p.numeroPedido?.toLowerCase().includes(term) ||
      p.cliente?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term);
    const okEstado = !filtroEstado || p.estado === filtroEstado;
    return okSearch && okEstado;
  });

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await cambiarEstadoPedido(pedidoId, nuevoEstado);
      setPedidos((prev) =>
        prev.map((p) => {
          if (p.id !== pedidoId) return p;
          const evento = {
            id: (p.trazabilidad?.length || 0) + 1,
            estado: nuevoEstado,
            fecha: new Date().toISOString(),
            usuario: 'Usuario Actual',
            notas: `Estado cambiado a ${ESTADOS[nuevoEstado]?.label || nuevoEstado}`,
          };
          return { ...p, estado: nuevoEstado, trazabilidad: [...(p.trazabilidad || []), evento] };
        })
      );
      toast.success(`Estado → ${ESTADOS[nuevoEstado]?.label || nuevoEstado}`);
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const handleImprimirTicket = (pedido) => imprimirTicket(pedido);

  const handleImprimirEtiqueta = (pedido) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Etiqueta ${pedido.numeroPedido}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;padding:20px;font-size:13px}
    .border-box{border:3px solid #000;padding:16px;width:320px}
    .label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#777;margin-bottom:2px}
    .val{font-size:14px;font-weight:700;margin-bottom:10px}
    .pedido{text-align:center;font-size:20px;font-weight:900;border-top:2px solid #000;padding-top:10px;margin-top:6px;letter-spacing:2px}
    @media print{html,body{height:auto!important;min-height:0!important}}</style></head>
    <body><div class="border-box">
    <div class="label">Destinatario</div>
    <div class="val">${pedido.envio?.nombre || pedido.cliente}</div>
    <div class="label">Dirección</div>
    <div class="val">${pedido.envio?.direccion || '—'}</div>
    <div class="label">Ciudad / CP</div>
    <div class="val">${pedido.envio?.ciudad || '—'} ${pedido.envio?.codigoPostal || ''}</div>
    <div class="label">Teléfono</div>
    <div class="val">${pedido.envio?.telefono || pedido.telefono || '—'}</div>
    <div class="pedido">${pedido.numeroPedido}</div>
    </div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
    </body></html>`;
    const w = window.open('', '_blank', 'width=420,height=380,menubar=no,toolbar=no,location=no');
    w.document.write(html);
    w.document.close();
  };

  const handleCopiarEtiqueta = (etiqueta) => {
    navigator.clipboard.writeText(etiqueta)
      .then(() => toast.success('Etiqueta copiada'))
      .catch(() => toast.error('Error al copiar'));
  };

  const stats = Object.fromEntries(
    Object.keys(ESTADOS).map((k) => [k, pedidos.filter((p) => p.estado === k).length])
  );

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 fw-bold">
            <i className="fa fa-truck me-2 text-primary" />Gestor de Pedidos
          </h1>
          <p className="text-muted small mb-0 mt-1">Gestión y seguimiento de pedidos online</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={loadPedidos} disabled={loading}>
          <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-rotate'} me-1`} />
          Actualizar
        </button>
      </div>

      {/* Stats — clicables para filtrar */}
      <div className="row g-3 mb-4">
        {Object.entries(ESTADOS).map(([key, { label, icon, color, bg }]) => (
          <div key={key} className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }}
              onClick={() => setFiltroEstado(filtroEstado === key ? '' : key)}>
              <div className="card-body d-flex align-items-center gap-3 p-3"
                style={filtroEstado === key ? { backgroundColor: bg, borderRadius: '0.375rem' } : {}}>
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
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
              <span className="input-group-text bg-white"><i className="fa fa-search text-muted" /></span>
              <input type="text" className="form-control" placeholder="Pedido, cliente, email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                  <i className="fa fa-xmark" />
                </button>
              )}
            </div>
            <button className={`btn btn-sm ${!filtroEstado ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setFiltroEstado('')}>Todos</button>
            {Object.entries(ESTADOS).map(([key, s]) => (
              <button key={key} className="btn btn-sm"
                style={filtroEstado === key
                  ? { backgroundColor: s.color, color: '#fff', borderColor: s.color }
                  : { backgroundColor: s.bg,    color: s.color, borderColor: 'transparent' }}
                onClick={() => setFiltroEstado(filtroEstado === key ? '' : key)}>
                <i className={`fa ${s.icon} me-1`} />{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="mb-2">
        <span className="text-muted small">
          <span className="fw-semibold text-dark">{pedidosFiltrados.length}</span> pedidos
          {filtroEstado && (
            <span className="badge rounded-pill ms-2"
              style={{ backgroundColor: ESTADOS[filtroEstado]?.bg, color: ESTADOS[filtroEstado]?.color }}>
              {ESTADOS[filtroEstado]?.label}
            </span>
          )}
        </span>
      </div>

      {/* Tabla */}
      <div className="card border shadow-sm">
        <div>
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="table-light border-bottom">
                <th className="ps-3 text-muted fw-semibold small" style={{ width: '12%' }}>Pedido</th>
                <th className="text-muted fw-semibold small" style={{ width: '10%' }}>Fecha</th>
                <th className="text-muted fw-semibold small" style={{ width: '22%' }}>Cliente</th>
                <th className="text-muted fw-semibold small" style={{ width: '20%' }}>Envío</th>
                <th className="text-muted fw-semibold small text-end" style={{ width: '10%' }}>Total</th>
                <th className="text-muted fw-semibold small" style={{ width: '14%' }}>Estado</th>
                <th className="text-muted fw-semibold small pe-3" style={{ width: 1, whiteSpace: 'nowrap' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j}><div className="placeholder-glow"><span className="placeholder col-8 rounded" /></div></td>
                    ))}
                  </tr>
                ))
              ) : pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="fa fa-truck fa-2x d-block mb-2 opacity-25" />
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                <>
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id ?? pedido.numeroPedido}>
                      <td className="ps-3">
                        <span className="badge bg-light text-secondary border fw-semibold" style={{ fontSize: '0.78rem' }}>
                          {pedido.numeroPedido}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold small">
                          {new Date(pedido.fecha).toLocaleDateString('es-AR')}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                            style={{ width: 30, height: 30, fontSize: '0.72rem', backgroundColor: '#e9ecef', color: '#495057' }}>
                            {pedido.cliente?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="small fw-semibold">{pedido.cliente}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{pedido.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">{pedido.envio?.direccion || '—'}</div>
                        {pedido.envio?.ciudad && (
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>{pedido.envio.ciudad}</div>
                        )}
                      </td>
                      <td className="text-end fw-bold text-success">${pedido.total?.toFixed(2) ?? '0.00'}</td>
                      <td>
                        <EstadoDropdown pedido={pedido} onCambiar={handleCambiarEstado} />
                      </td>
                      <td className="pe-3" style={{ whiteSpace: 'nowrap' }}>
                        <RowActions
                          pedido={pedido}
                          onVerDetalle={(p) => { setPedidoSel(p); setShowDetalle(true); }}
                          onEtiqueta={(p) => { setPedidoSel(p); setShowEtiqueta(true); }}
                          onTrazabilidad={(p) => { setPedidoSel(p); setShowTrazabilidad(true); }}
                          onImprimir={handleImprimirTicket}
                        />
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, 8 - pedidosFiltrados.length) }).map((_, i) => (
                    <tr key={`blank-${i}`} style={{ height: 52 }}>
                      {Array.from({ length: 7 }).map((__, j) => <td key={j} />)}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TrazabilidadModal
        show={showTrazabilidad}
        onClose={() => setShowTrazabilidad(false)}
        pedido={pedidoSel}
      />
      <PedidoDetalleModal
        show={showDetalle}
        onClose={() => setShowDetalle(false)}
        pedido={pedidoSel}
        onImprimir={handleImprimirTicket}
        onCambiarEstado={handleCambiarEstado}
      />
      <EtiquetaTransporteModal
        show={showEtiqueta}
        onClose={() => setShowEtiqueta(false)}
        pedido={pedidoSel}
        onImprimir={handleImprimirEtiqueta}
        onCopiar={handleCopiarEtiqueta}
      />
    </div>
  );
};

export default PedidosList;
