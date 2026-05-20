import React, { useState } from 'react';
import { useDevoluciones, MOTIVOS_DEVUELTAS, MOTIVOS_FALLAS, TIPOS_REEMBOLSO } from '../hooks/useDevoluciones';

const TIPO_CONFIG = {
  devueltas: { color: '#198754', bg: '#d1e7dd', label: 'Devueltas',  icon: 'fa-rotate-left' },
  fallas:    { color: '#dc3545', bg: '#f8d7da', label: 'Fallas',     icon: 'fa-triangle-exclamation' },
};

const REEMBOLSO_CONFIG = {
  'Dinero devuelto':    { bg: '#d1e7dd', color: '#198754' },
  'Crédito tienda':     { bg: '#cfe2ff', color: '#0d6efd' },
  'Cambio de producto': { bg: '#fff3cd', color: '#664d03' },
};

const STAT_CONFIG = [
  { key: 'devueltas',    label: 'Devoluciones',    icon: 'fa-rotate-left',            color: '#198754', bg: '#d1e7dd' },
  { key: 'fallas',       label: 'Fallas',           icon: 'fa-triangle-exclamation',   color: '#dc3545', bg: '#f8d7da' },
  { key: 'stockRecup',   label: 'Stock recuperado', icon: 'fa-arrow-up',               color: '#0d6efd', bg: '#cfe2ff' },
  { key: 'stockPerdido', label: 'Stock perdido',    icon: 'fa-arrow-down',             color: '#fd7e14', bg: '#ffe5d0' },
];

const ITEMS_PER_PAGE = 8;

const Devoluciones = () => {
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);
  const [histPage, setHistPage]             = useState(1);

  const {
    productos, loading, tab,
    selectedVentaNumero, selectedVentaItemId, selectedProductoId, selectedVarianteId,
    cantidad, motivo, descripcion, reembolso,
    registro, ventasRecientes, selectedVenta, itemsDeVenta,
    productoSeleccionado, varianteSeleccionada, registrosFiltrados,
    esDevolucion, motivesList, filterMotivo, filterBusqueda,
    setTab, setSelectedVentaNumero, setSelectedVentaItemId,
    setSelectedProductoId, setSelectedVarianteId,
    setCantidad, setMotivo, setDescripcion, setReembolso,
    setFilterMotivo, setFilterBusqueda,
    handleAplicarDevolucion, limpiarHistorial, deleteRegistroById,
  } = useDevoluciones();

  const stockAnterior = productoSeleccionado
    ? productoSeleccionado.tieneVariantes ? varianteSeleccionada?.stock || 0 : productoSeleccionado.stock || 0
    : 0;
  const stockDespues = esDevolucion
    ? stockAnterior + cantidad
    : Math.max(0, stockAnterior - cantidad);

  const stats = {
    devueltas:    registro.filter((r) => r.tipo === 'devueltas').length,
    fallas:       registro.filter((r) => r.tipo === 'fallas').length,
    stockRecup:   registro.filter((r) => r.tipo === 'devueltas').reduce((s, r) => s + r.cantidad, 0),
    stockPerdido: registro.filter((r) => r.tipo === 'fallas').reduce((s, r) => s + r.cantidad, 0),
  };

  const totalHistPages = Math.max(1, Math.ceil(registrosFiltrados.length / ITEMS_PER_PAGE));
  const histPageItems  = registrosFiltrados.slice((histPage - 1) * ITEMS_PER_PAGE, histPage * ITEMS_PER_PAGE);
  const tCfg           = TIPO_CONFIG[tab];

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 mb-0 fw-bold">
          <i className="fa fa-rotate-left me-2 text-primary" />Devoluciones y Fallas
        </h1>
        <p className="text-muted small mb-0 mt-1">
          Registrá devueltas de clientes (agrega stock) o fallas de productos (resta stock)
        </p>
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

      {/* Tab buttons */}
      <div className="d-flex gap-2 mb-4">
        {['devueltas', 'fallas'].map((t) => {
          const cfg    = TIPO_CONFIG[t];
          const active = tab === t;
          return (
            <button key={t} type="button"
              className="btn d-flex align-items-center gap-2 fw-semibold"
              style={active
                ? { backgroundColor: cfg.color, borderColor: cfg.color, color: '#fff' }
                : { backgroundColor: '#f8f9fa', borderColor: '#dee2e6', color: '#495057' }}
              onClick={() => setTab(t)}>
              <i className={`fa ${cfg.icon}`} />
              {t === 'devueltas' ? 'Devueltas de Clientes' : 'Fallas de Productos'}
              <span className="badge rounded-pill ms-1"
                style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#dee2e6', color: active ? '#fff' : '#6c757d' }}>
                {stats[t]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="row g-3">

        {/* ── FORMULARIO ── */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm overflow-hidden">

            <div className="d-flex align-items-center gap-2 px-3 py-2"
              style={{ backgroundColor: tCfg.color, color: '#fff' }}>
              <i className={`fa ${tCfg.icon}`} />
              <span className="fw-semibold">{esDevolucion ? 'Registrar Devolución' : 'Registrar Falla'}</span>
            </div>

            <div className="card-body">
              <form onSubmit={handleAplicarDevolucion}>

                {/* Venta vinculada */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">
                    Venta vinculada <span className="fw-normal">(opcional)</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white"><i className="fa fa-search text-muted" /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar código de venta..."
                      value={selectedVentaNumero}
                      onChange={(e) => setSelectedVentaNumero(e.target.value)}
                      list="ventas-list"
                    />
                  </div>
                  <datalist id="ventas-list">
                    {ventasRecientes.map((v) => (
                      <option key={v.id} value={v.numeroVenta}>#{v.numeroVenta} - {v.cliente}</option>
                    ))}
                  </datalist>
                  {selectedVenta && (
                    <div className="mt-1 small text-success">
                      <i className="fa fa-check-circle me-1" />
                      Venta #{selectedVenta.numeroVenta} · {selectedVenta.cliente}
                    </div>
                  )}
                </div>

                {/* Producto */}
                {selectedVenta && itemsDeVenta.length > 0 ? (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Producto de la venta</label>
                    <select className="form-select form-select-sm" value={selectedVentaItemId}
                      onChange={(e) => setSelectedVentaItemId(e.target.value)}>
                      <option value="">Seleccionar producto</option>
                      {itemsDeVenta.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} (vendidas: {item.cantidad})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Producto</label>
                    <select className="form-select form-select-sm" value={selectedProductoId}
                      onChange={(e) => setSelectedProductoId(e.target.value)}>
                      <option value="">Seleccionar producto</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Variante */}
                {productoSeleccionado?.tieneVariantes && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Talla / Variante</label>
                    <select className="form-select form-select-sm" value={selectedVarianteId}
                      onChange={(e) => setSelectedVarianteId(e.target.value)}>
                      {productoSeleccionado.variantes.map((v) => (
                        <option key={v.id} value={v.id}>{v.id} (stock: {v.stock || 0})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cantidad + Motivo */}
                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <label className="form-label small fw-semibold text-muted">Cantidad</label>
                    <input type="number" min="1" className="form-control form-control-sm"
                      value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
                  </div>
                  <div className="col-8">
                    <label className="form-label small fw-semibold text-muted">Motivo</label>
                    <select className="form-select form-select-sm" value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}>
                      {motivesList.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Descripción</label>
                  <textarea className="form-control form-control-sm" rows="2"
                    placeholder={esDevolucion
                      ? 'Ej: El cliente quiere cambiarlo de talla...'
                      : 'Ej: Costura rota en la manga derecha...'}
                    value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                </div>

                {/* Reembolso */}
                {esDevolucion && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Tipo de reembolso</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {TIPOS_REEMBOLSO.map((tipo) => {
                        const cfg    = REEMBOLSO_CONFIG[tipo] || {};
                        const active = reembolso === tipo;
                        return (
                          <button key={tipo} type="button" className="btn btn-sm"
                            style={active
                              ? { backgroundColor: cfg.color, color: '#fff', borderColor: cfg.color }
                              : { backgroundColor: cfg.bg,    color: cfg.color, borderColor: 'transparent' }}
                            onClick={() => setReembolso(tipo)}>
                            {tipo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock preview */}
                {productoSeleccionado && (
                  <div className="rounded p-2 mb-3 d-flex align-items-center gap-3"
                    style={{ backgroundColor: tCfg.bg }}>
                    <i className="fa fa-box fa-lg" style={{ color: tCfg.color }} />
                    <div className="small">
                      <span className="text-muted">Stock actual: </span>
                      <strong>{stockAnterior}</strong>
                      <i className="fa fa-arrow-right mx-2 text-muted" style={{ fontSize: '0.6rem' }} />
                      <strong style={{ color: tCfg.color }}>{stockDespues}</strong>
                      <span className="text-muted ms-1">
                        ({esDevolucion ? '+' : '-'}{cantidad})
                      </span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn w-100 fw-semibold"
                  style={{ backgroundColor: tCfg.color, color: '#fff' }}>
                  <i className={`fa ${tCfg.icon} me-2`} />
                  {esDevolucion ? 'Registrar Devolución' : 'Registrar Falla'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── HISTORIAL ── */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">

            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
              <span className="fw-semibold">
                Historial
                <span className="badge rounded-pill text-bg-secondary ms-2" style={{ fontSize: '0.75rem' }}>
                  {registrosFiltrados.length}
                </span>
              </span>
              <button className="btn btn-sm btn-outline-danger"
                onClick={() => setConfirmLimpiar(true)}
                disabled={registrosFiltrados.length === 0}>
                <i className="fa fa-trash me-1" />Limpiar todo
              </button>
            </div>

            {/* Filtros */}
            <div className="px-3 py-2 border-bottom bg-light">
              <div className="row g-2">
                <div className="col-7">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white"><i className="fa fa-search text-muted" /></span>
                    <input type="text" className="form-control" placeholder="Producto o cliente..."
                      value={filterBusqueda}
                      onChange={(e) => { setFilterBusqueda(e.target.value); setHistPage(1); }} />
                  </div>
                </div>
                <div className="col-5">
                  <select className="form-select form-select-sm" value={filterMotivo}
                    onChange={(e) => { setFilterMotivo(e.target.value); setHistPage(1); }}>
                    <option value="">Todos los motivos</option>
                    {motivesList.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla */}
            {histPageItems.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className={`fa ${tCfg.icon} fa-2x d-block mb-2 opacity-25`} />
                No hay registros
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Producto</th>
                      <th className="text-center" style={{ width: 60 }}>Cant.</th>
                      <th style={{ width: 145 }}>Motivo</th>
                      <th style={{ width: 90 }}>Stock</th>
                      {esDevolucion && <th style={{ width: 115 }}>Reembolso</th>}
                      <th className="text-end" style={{ width: 90 }}>Fecha</th>
                      <th style={{ width: 40 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {histPageItems.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-3">
                          <div className="fw-semibold text-dark">{item.producto}</div>
                          {item.variante !== 'N/A' && (
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{item.variante}</div>
                          )}
                          {item.cliente !== 'Sin vincular' && (
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              <i className="fa fa-user me-1" />{item.cliente}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="badge rounded-pill fw-bold"
                            style={{ backgroundColor: tCfg.bg, color: tCfg.color }}>
                            {item.tipo === 'devueltas' ? '+' : '-'}{item.cantidad}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill bg-light text-secondary border small">
                            {item.motivo}
                          </span>
                          {item.descripcion && (
                            <div className="text-muted fst-italic mt-1" style={{ fontSize: '0.7rem' }}>
                              {item.descripcion.length > 38 ? item.descripcion.slice(0, 38) + '…' : item.descripcion}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="text-muted">{item.stockAnterior}</span>
                          <i className="fa fa-arrow-right mx-1 text-muted" style={{ fontSize: '0.6rem' }} />
                          <span className="fw-semibold" style={{ color: tCfg.color }}>{item.stockPosterior}</span>
                        </td>
                        {esDevolucion && (
                          <td>
                            {item.reembolso !== '-' ? (
                              <span className="badge rounded-pill small"
                                style={{
                                  backgroundColor: (REEMBOLSO_CONFIG[item.reembolso] || {}).bg || '#e9ecef',
                                  color: (REEMBOLSO_CONFIG[item.reembolso] || {}).color || '#6c757d',
                                }}>
                                {item.reembolso}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        )}
                        <td className="text-end text-muted pe-1" style={{ fontSize: '0.7rem' }}>
                          {item.fecha}
                        </td>
                        <td className="pe-3">
                          <button className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => deleteRegistroById(item.id)} title="Eliminar">
                            <i className="fa fa-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {totalHistPages > 1 && (
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
                <span className="text-muted small">
                  Página <strong>{histPage}</strong> de <strong>{totalHistPages}</strong>
                </span>
                <div className="d-flex gap-1">
                  <button className="btn btn-sm btn-outline-secondary" disabled={histPage <= 1}
                    onClick={() => setHistPage((p) => p - 1)}>
                    <i className="fa fa-chevron-left" />
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" disabled={histPage >= totalHistPages}
                    onClick={() => setHistPage((p) => p + 1)}>
                    <i className="fa fa-chevron-right" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal confirmar limpiar */}
      {confirmLimpiar && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setConfirmLimpiar(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  <i className="fa fa-triangle-exclamation me-2" />Limpiar historial
                </h5>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-0">
                  ¿Eliminar todos los registros de <strong>
                    {tab === 'devueltas' ? 'devoluciones' : 'fallas'}
                  </strong>? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setConfirmLimpiar(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={() => { limpiarHistorial(); setConfirmLimpiar(false); }}>
                  <i className="fa fa-trash me-2" />Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devoluciones;
