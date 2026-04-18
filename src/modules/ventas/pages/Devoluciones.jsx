import React from 'react';
import { useDevoluciones, MOTIVOS_DEVUELTAS, MOTIVOS_FALLAS, TIPOS_REEMBOLSO } from '../hooks/useDevoluciones';

const Devoluciones = () => {
  const {
    productos,
    loading,
    tab,
    selectedVentaNumero,
    selectedVentaItemId,
    selectedProductoId,
    selectedVarianteId,
    cantidad,
    motivo,
    descripcion,
    reembolso,
    ventasRecientes,
    selectedVenta,
    itemsDeVenta,
    productoSeleccionado,
    varianteSeleccionada,
    registrosFiltrados,
    esDevolucion,
    stockDisponible,
    motivesList,
    filterMotivo,
    filterBusqueda,
    setTab,
    setSelectedVentaNumero,
    setSelectedVentaItemId,
    setSelectedProductoId,
    setSelectedVarianteId,
    setCantidad,
    setMotivo,
    setDescripcion,
    setReembolso,
    setFilterMotivo,
    setFilterBusqueda,
    handleAplicarDevolucion,
    limpiarHistorial
  } = useDevoluciones();

  const stockAnterior = productoSeleccionado
    ? productoSeleccionado.tieneVariantes
      ? varianteSeleccionada?.stock || 0
      : productoSeleccionado.stock || 0
    : 0;

  return (
    <div className="container-fluid">
      {/* Cabecera */}
      <div className="mb-4">
        <h1 className="h3 mb-2">
          <i className="fa fa-exchange-alt me-2"></i>Devoluciones y Fallas
        </h1>
        <p className="text-muted small mb-0">Registra devueltas de clientes (agrega stock) o fallas de productos (resta stock). Para tienda de ropa.</p>
      </div>

      {/* Pestañas */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === 'devueltas' ? 'active' : ''}`}
            onClick={() => setTab('devueltas')}
            type="button"
            role="tab"
          >
            <i className="fa fa-arrow-left me-2 text-success"></i>Devueltas de Clientes (+Stock)
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${tab === 'fallas' ? 'active' : ''}`}
            onClick={() => setTab('fallas')}
            type="button"
            role="tab"
          >
            <i className="fa fa-exclamation-triangle me-2 text-danger"></i>Fallas de Productos (-Stock)
          </button>
        </li>
      </ul>

      <div className="row g-3">
        {/* FORMULARIO */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                {esDevolucion ? '📦 Registrar Devolución' : '⚠️ Registrar Falla'}
              </h5>
              <form onSubmit={handleAplicarDevolucion}>
                {/* Venta (opcional) */}
                <div className="mb-3">
                  <label className="form-label small">Venta vinculada (opcional)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar código de venta..."
                    value={selectedVentaNumero}
                    onChange={(e) => setSelectedVentaNumero(e.target.value)}
                    list="ventas-list"
                  />
                  <datalist id="ventas-list">
                    {ventasRecientes.map((venta) => (
                      <option key={venta.id} value={venta.numeroVenta}>
                        #{venta.numeroVenta} - {venta.cliente}
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Producto (desde venta o manual) */}
                {selectedVenta && itemsDeVenta.length > 0 ? (
                  <div className="mb-3">
                    <label className="form-label small">Producto de la venta</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedVentaItemId}
                      onChange={(e) => setSelectedVentaItemId(e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {itemsDeVenta.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} (vendidas: {item.cantidad})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label small">Producto</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedProductoId}
                      onChange={(e) => setSelectedProductoId(e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Variante (si aplica) */}
                {productoSeleccionado?.tieneVariantes && (
                  <div className="mb-3">
                    <label className="form-label small">Talla/Variante</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedVarianteId}
                      onChange={(e) => setSelectedVarianteId(e.target.value)}
                    >
                      {productoSeleccionado.variantes.map((variante) => (
                        <option key={variante.id} value={variante.id}>
                          {variante.id} (stock: {variante.stock || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Cantidad */}
                <div className="mb-3">
                  <label className="form-label small">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                  />
                </div>

                {/* Motivo */}
                <div className="mb-3">
                  <label className="form-label small">Motivo</label>
                  <select
                    className="form-select form-select-sm"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  >
                    {motivesList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div className="mb-3">
                  <label className="form-label small">Descripción detallada (requerida por cliente)</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="Ej: Costura rota en la manga derecha..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  ></textarea>
                </div>

                {/* Reembolso (solo si es devolución) */}
                {esDevolucion && (
                  <div className="mb-3">
                    <label className="form-label small">Tipo de reembolso</label>
                    <select
                      className="form-select form-select-sm"
                      value={reembolso}
                      onChange={(e) => setReembolso(e.target.value)}
                    >
                      {TIPOS_REEMBOLSO.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Stock info */}
                {productoSeleccionado && (
                  <div className="alert alert-info small mb-3">
                    <strong>Stock actual:</strong> {stockAnterior} unid. 
                    <br />
                    <strong>Stock después:</strong> {esDevolucion ? stockAnterior + cantidad : Math.max(0, stockAnterior - cantidad)} unid.
                  </div>
                )}

                <button type="submit" className={`btn btn-sm w-100 ${esDevolucion ? 'btn-success' : 'btn-danger'}`}>
                  <i className={`fa ${esDevolucion ? 'fa-check' : 'fa-times'} me-2`}></i>
                  {esDevolucion ? 'Registrar Devolución' : 'Registrar Falla'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Historial ({registrosFiltrados.length})</h5>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={limpiarHistorial}
                  disabled={registrosFiltrados.length === 0}
                >
                  <i className="fa fa-trash me-1"></i>Limpiar
                </button>
              </div>

              {/* Filtros */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar producto/cliente..."
                    value={filterBusqueda}
                    onChange={(e) => setFilterBusqueda(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <select
                    className="form-select form-select-sm"
                    value={filterMotivo}
                    onChange={(e) => setFilterMotivo(e.target.value)}
                  >
                    <option value="">Todos los motivos</option>
                    {(esDevolucion ? MOTIVOS_DEVUELTAS : MOTIVOS_FALLAS).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Historial */}
              {registrosFiltrados.length === 0 ? (
                <p className="text-muted text-center py-4">No hay registros para este filtro.</p>
              ) : (
                <div className="list-group list-group-flush">
                  {registrosFiltrados.slice(0, 10).map((item) => (
                    <div key={item.id} className="list-group-item px-0 py-3 border-bottom">
                      <div className="row g-2 small">
                        <div className="col-8">
                          <strong className="d-block text-dark">{item.producto}</strong>
                          <span className="text-muted">{item.variante} · x{item.cantidad}</span>
                          <div className="text-muted small mt-1">{item.motivo}</div>
                          {item.descripcion && (
                            <div className="text-muted small fst-italic mt-1">💬 {item.descripcion}</div>
                          )}
                        </div>
                        <div className="col-4 text-end">
                          <div className="small text-muted">{item.cliente}</div>
                          <div className={`small fw-bold ${item.tipo === 'devueltas' ? 'text-success' : 'text-danger'}`}>
                            {item.tipo === 'devueltas' ? '↑' : '↓'} {item.stockAnterior} → {item.stockPosterior}
                          </div>
                          {item.reembolso !== '-' && (
                            <div className="small badge bg-info">{item.reembolso}</div>
                          )}
                          <div className="text-muted small mt-1">{item.fecha}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Devoluciones;
