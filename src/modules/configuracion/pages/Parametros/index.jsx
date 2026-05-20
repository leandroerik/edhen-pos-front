import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'edhenParametros';

const DEFAULTS = {
  // Stock
  stockCritico:       5,
  ventaSinStock:      false,
  // Ventas
  descuentoMaximo:    30,
  pagoDefault:        'efectivo',
  pedirMotivoDesc:    false,
  // Caja
  montoInicialCaja:   5000,
  diferenciaCajaMax:  500,
  // Ticket
  ticketLogo:         true,
  ticketPie:          '¡Gracias por tu compra! Podés cambiar tu prenda dentro de los 30 días.',
  ticketCodigoBarras: false,
  // Catálogo
  ordenTalles:        'XS,S,M,L,XL,XXL',
  moneda:             'ARS',
  preciosConIva:      true,
};

const SectionHeader = ({ icon, title, color = 'text-primary' }) => (
  <div className={`d-flex align-items-center gap-2 mb-3 pb-2 border-bottom`}>
    <i className={`fa ${icon} ${color}`}></i>
    <h6 className="mb-0 fw-bold">{title}</h6>
  </div>
);

const ParametrosConfig = () => {
  const [params, setParams] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setParams({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch { /* mantiene defaults */ }
  }, []);

  const set = (key, value) => setParams(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    setSaving(false);
    toast.success('Parámetros guardados correctamente');
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar todos los parámetros a sus valores por defecto?')) {
      setParams(DEFAULTS);
      toast('Parámetros restaurados');
    }
  };

  return (
    <div className="container-fluid p-3">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="mb-1 fw-bold">
            <i className="fa fa-sliders me-2 text-secondary"></i>
            Parámetros del Negocio
          </h5>
          <small className="text-muted">Valores y comportamientos por defecto del sistema</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
            <i className="fa fa-rotate-left me-1"></i>Restaurar
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</>
              : <><i className="fa fa-floppy-disk me-1"></i>Guardar Cambios</>}
          </button>
        </div>
      </div>

      <div className="row g-3">

        {/* Columna izquierda */}
        <div className="col-lg-6">

          {/* Stock */}
          <div className="card mb-3">
            <div className="card-body">
              <SectionHeader icon="fa-cubes" title="Stock" color="text-primary" />

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Umbral de stock crítico
                  <span className="ms-2 badge bg-primary-subtle text-primary border border-primary-subtle">
                    {params.stockCritico} unidades
                  </span>
                </label>
                <input
                  type="range" className="form-range" min={1} max={20} step={1}
                  value={params.stockCritico}
                  onChange={e => set('stockCritico', Number(e.target.value))}
                />
                <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', color: '#adb5bd' }}>
                  <span>1</span><span>Alerta cuando stock ≤ N</span><span>20</span>
                </div>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input" type="checkbox" id="ventaSinStock"
                  checked={params.ventaSinStock}
                  onChange={e => set('ventaSinStock', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="ventaSinStock">
                  Permitir venta sin stock
                  <small className="text-muted ms-2">(para pedidos especiales)</small>
                </label>
              </div>
            </div>
          </div>

          {/* Ventas */}
          <div className="card mb-3">
            <div className="card-body">
              <SectionHeader icon="fa-shopping-cart" title="Ventas" color="text-success" />

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Descuento máximo permitido
                  <span className="ms-2 badge bg-success-subtle text-success border border-success-subtle">
                    {params.descuentoMaximo}%
                  </span>
                </label>
                <input
                  type="range" className="form-range" min={0} max={80} step={5}
                  value={params.descuentoMaximo}
                  onChange={e => set('descuentoMaximo', Number(e.target.value))}
                />
                <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', color: '#adb5bd' }}>
                  <span>0%</span><span>Sin descuento al 80%</span><span>80%</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Método de pago por defecto</label>
                <select
                  className="form-select form-select-sm"
                  value={params.pagoDefault}
                  onChange={e => set('pagoDefault', e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Tarjeta de Débito</option>
                  <option value="credito">Tarjeta de Crédito</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="qr">QR / Mercado Pago</option>
                </select>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input" type="checkbox" id="pedirMotivoDesc"
                  checked={params.pedirMotivoDesc}
                  onChange={e => set('pedirMotivoDesc', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="pedirMotivoDesc">
                  Requerir motivo al aplicar descuento
                </label>
              </div>
            </div>
          </div>

          {/* Caja */}
          <div className="card">
            <div className="card-body">
              <SectionHeader icon="fa-cash-register" title="Caja" color="text-warning" />

              <div className="mb-3">
                <label className="form-label fw-semibold">Monto inicial de caja por defecto</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">$</span>
                  <input
                    type="number" className="form-control" min={0} step={100}
                    value={params.montoInicialCaja}
                    onChange={e => set('montoInicialCaja', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold">
                  Notificar si diferencia en arqueo supera
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text">$</span>
                  <input
                    type="number" className="form-control" min={0} step={100}
                    value={params.diferenciaCajaMax}
                    onChange={e => set('diferenciaCajaMax', Number(e.target.value))}
                  />
                </div>
                <div className="form-text">Muestra alerta si el arqueo tiene diferencia mayor a este monto.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-lg-6">

          {/* Ticket / Comprobante */}
          <div className="card mb-3">
            <div className="card-body">
              <SectionHeader icon="fa-receipt" title="Comprobante / Ticket" color="text-info" />

              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input" type="checkbox" id="ticketLogo"
                  checked={params.ticketLogo}
                  onChange={e => set('ticketLogo', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="ticketLogo">
                  Incluir logo en el ticket
                </label>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input" type="checkbox" id="ticketCodigoBarras"
                  checked={params.ticketCodigoBarras}
                  onChange={e => set('ticketCodigoBarras', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="ticketCodigoBarras">
                  Incluir código de barras en el ticket
                </label>
              </div>

              <div>
                <label className="form-label fw-semibold">Pie de ticket</label>
                <textarea
                  className="form-control form-control-sm" rows={3}
                  placeholder="Texto que aparece al final del comprobante..."
                  value={params.ticketPie}
                  onChange={e => set('ticketPie', e.target.value)}
                  maxLength={200}
                />
                <div className="form-text text-end">{params.ticketPie.length}/200</div>
              </div>
            </div>
          </div>

          {/* Catálogo */}
          <div className="card mb-3">
            <div className="card-body">
              <SectionHeader icon="fa-tshirt" title="Catálogo" color="text-purple" />

              <div className="mb-3">
                <label className="form-label fw-semibold">Orden de talles predeterminado</label>
                <input
                  type="text" className="form-control form-control-sm"
                  value={params.ordenTalles}
                  onChange={e => set('ordenTalles', e.target.value)}
                  placeholder="XS,S,M,L,XL,XXL"
                />
                <div className="form-text">
                  Separá los talles con coma. Ejemplo: <code>XS,S,M,L,XL,XXL,XXXL</code>
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Moneda</label>
                <select
                  className="form-select form-select-sm"
                  value={params.moneda}
                  onChange={e => set('moneda', e.target.value)}
                >
                  <option value="ARS">ARS — Peso argentino ($)</option>
                  <option value="USD">USD — Dólar estadounidense (U$D)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="card">
            <div className="card-body">
              <SectionHeader icon="fa-tag" title="Precios" color="text-danger" />

              <div className="form-check form-switch">
                <input
                  className="form-check-input" type="checkbox" id="preciosConIva"
                  checked={params.preciosConIva}
                  onChange={e => set('preciosConIva', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="preciosConIva">
                  Los precios ya incluyen IVA
                </label>
              </div>
              <div className="form-text mt-1">
                Si está activado, el precio mostrado al cliente es el precio final. Si está desactivado,
                el IVA se suma al precio de venta según la categoría del producto.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer guardar */}
      <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
        <button className="btn btn-outline-secondary" onClick={handleReset}>
          <i className="fa fa-rotate-left me-2"></i>Restaurar Defaults
        </button>
        <button className="btn btn-primary px-4" onClick={handleSave} disabled={saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
            : <><i className="fa fa-floppy-disk me-2"></i>Guardar Parámetros</>}
        </button>
      </div>
    </div>
  );
};

export default ParametrosConfig;
