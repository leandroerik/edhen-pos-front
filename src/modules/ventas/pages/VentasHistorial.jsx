import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ventaService } from '../../../services/api';
import SalesTable from '../components/SalesTable';
import DetalleVentaModal from './DetalleVentaModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

/* ─── Receipt helpers (compartidos entre Print y PDF) ───────────────────────── */

const RECEIPT_STYLES = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Courier New',Courier,monospace; font-size:13px; color:#111; background:#fff; }
  .ticket { width:100%; padding:24px 20px; }
  .store-name { text-align:center; font-size:22px; font-weight:900; letter-spacing:3px; margin-bottom:2px; }
  .store-sub  { text-align:center; font-size:10px; color:#777; letter-spacing:1px; margin-bottom:14px; }
  .receipt-title { text-align:center; font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#555; margin:10px 0 4px; }
  .receipt-id    { text-align:center; font-size:18px; font-weight:800; margin-bottom:12px; }
  .div-solid { border:none; border-top:2px solid #111; margin:10px 0; }
  .div-dash  { border:none; border-top:1px dashed #bbb; margin:10px 0; }
  .info-row  { display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; }
  .lbl { color:#777; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  thead th { font-size:10px; text-transform:uppercase; color:#777; letter-spacing:0.5px; padding:4px 2px 7px; border-bottom:1px solid #333; }
  .td-prod   { padding:6px 2px; border-bottom:1px dashed #ddd; line-height:1.35; }
  .td-center { padding:6px 2px; border-bottom:1px dashed #ddd; text-align:center; }
  .td-right  { padding:6px 2px; border-bottom:1px dashed #ddd; text-align:right; }
  .td-bold   { font-weight:700; }
  small { font-size:10px; color:#999; }
  .totals td { padding:4px 2px; font-size:12px; }
  .total-row td { font-size:16px; font-weight:900; padding-top:8px; border-top:2px solid #111; }
  .footer { text-align:center; font-size:10px; color:#999; margin-top:14px; line-height:1.8; letter-spacing:0.3px; }
  .footer strong { color:#555; font-size:11px; }
`;

const buildReceiptInner = (venta) => {
  const itemsRows = (venta.items || []).map((item) => `
    <tr>
      <td class="td-prod">${item.nombre}${item.variantLabel ? `<br><small>${item.variantLabel}</small>` : ''}</td>
      <td class="td-center">${item.cantidad}</td>
      <td class="td-right">$${(item.precioVenta || 0).toFixed(2)}</td>
      <td class="td-right td-bold">$${((item.precioVenta || 0) * item.cantidad).toFixed(2)}</td>
    </tr>`).join('');

  const descuentoRow = venta.descuento > 0 ? `
    <tr>
      <td colspan="3" class="td-right lbl">Descuento</td>
      <td class="td-right" style="color:#c00">-$${venta.descuento.toFixed(2)}</td>
    </tr>` : '';

  return `
    <div class="store-name">EDHEN</div>
    <div class="store-sub">INDUMENTARIA</div>
    <hr class="div-solid">
    <div class="receipt-title">Comprobante de Venta</div>
    <div class="receipt-id">N° ${String(venta.id).padStart(6, '0')}</div>
    <div class="info-row"><span class="lbl">Fecha</span><span>${venta.fecha}${venta.hora ? ' ' + venta.hora : ''}</span></div>
    <div class="info-row"><span class="lbl">Cliente</span><span>${venta.cliente || 'Consumidor Final'}</span></div>
    <div class="info-row"><span class="lbl">Forma de pago</span><span>${venta.formaPago}</span></div>
    <div class="info-row"><span class="lbl">Estado</span><span>${venta.estado}</span></div>
    <hr class="div-dash">
    <table>
      <thead><tr>
        <th style="text-align:left">Producto</th>
        <th style="text-align:center">Cant</th>
        <th style="text-align:right">P.U.</th>
        <th style="text-align:right">Total</th>
      </tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <hr class="div-dash">
    <table class="totals"><tbody>
      <tr>
        <td colspan="3" class="td-right lbl">Subtotal</td>
        <td class="td-right">$${(venta.subtotal ?? venta.total ?? 0).toFixed(2)}</td>
      </tr>
      ${descuentoRow}
      <tr class="total-row">
        <td colspan="3" class="td-right">TOTAL</td>
        <td class="td-right">$${(venta.total ?? 0).toFixed(2)}</td>
      </tr>
    </tbody></table>
    <hr class="div-solid">
    <div class="footer">
      <strong>¡Gracias por tu compra!</strong><br>
      Conservá este comprobante<br>
      edhenindumentaria@gmail.com
    </div>`;
};

const SALES_KEY = 'ventasGuardadas';

const loadVentasLocal = () => {
  try { return JSON.parse(localStorage.getItem(SALES_KEY) || '[]'); }
  catch { return []; }
};

const saveVentasLocal = (ventas) => localStorage.setItem(SALES_KEY, JSON.stringify(ventas));

const parseFecha = (fecha) => {
  if (!fecha) return null;
  if (fecha.includes('/')) {
    const [d, m, y] = fecha.split('/').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(fecha);
};

const toLocalDate = (isoStr) => {
  if (!isoStr) return null;
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const today = () => new Date().toISOString().split('T')[0];

const STAT_CONFIG = [
  { key: 'recaudado',    label: 'Recaudado',      icon: 'fa-dollar-sign',  color: '#198754', bg: '#d1e7dd' },
  { key: 'transacciones',label: 'Transacciones',  icon: 'fa-receipt',      color: '#0d6efd', bg: '#cfe2ff' },
  { key: 'ticket',       label: 'Ticket promedio', icon: 'fa-chart-line',   color: '#6f42c1', bg: '#e8d5ff' },
  { key: 'descuentos',   label: 'Descuentos',      icon: 'fa-tag',          color: '#fd7e14', bg: '#ffe5d0' },
];

const VentasHistorial = () => {
  const [ventas, setVentas]                   = useState([]);
  const [busqueda, setBusqueda]               = useState('');
  const [filterEstado, setFilterEstado]       = useState('');
  const [filterFormaPago, setFilterFormaPago] = useState('');
  const [filterMontoMin, setFilterMontoMin]   = useState('');
  const [filterMontoMax, setFilterMontoMax]   = useState('');
  const [startDate, setStartDate]             = useState('');
  const [endDate, setEndDate]                 = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [itemsPerPage, setItemsPerPage]       = useState(10);
  const [selectedVenta, setSelectedVenta]     = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [loading, setLoading]                 = useState(false);

  const loadVentasData = useCallback(async () => {
    setLoading(true);
    try {
      const locales = loadVentasLocal().map((v) => ({ ...v, source: 'local' }));
      const res     = await ventaService.listar();
      const api     = (res.data || []).map((v) => ({ ...v, source: 'api' }));
      setVentas([...api, ...locales]);
    } catch {
      setVentas(loadVentasLocal().map((v) => ({ ...v, source: 'local' })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVentasData(); }, [loadVentasData]);

  const handleDeleteVenta = async () => {
    if (!confirmEliminar) return;
    const { id, source } = confirmEliminar;
    try {
      if (source === 'api') await ventaService.eliminar(id);
      const nuevas = ventas.filter((v) => v.id !== id);
      setVentas(nuevas);
      saveVentasLocal(nuevas.filter((v) => v.source === 'local'));
      toast.success('Venta eliminada');
    } catch {
      toast.error('Error al eliminar la venta');
    } finally {
      setConfirmEliminar(null);
    }
  };

  const handlePrintVenta = (venta) => {
    const itemsRows = (venta.items || []).map((item) => `
      <tr>
        <td class="td-prod">${item.nombre}${item.variantLabel ? `<br><small>${item.variantLabel}</small>` : ''}</td>
        <td class="td-center">${item.cantidad}</td>
        <td class="td-right">$${(item.precioVenta || 0).toFixed(2)}</td>
        <td class="td-right td-bold">$${((item.precioVenta || 0) * item.cantidad).toFixed(2)}</td>
      </tr>`).join('');

    const descuentoRow = venta.descuento > 0 ? `
      <tr>
        <td colspan="3" class="td-right lbl">Descuento</td>
        <td class="td-right" style="color:#c00">-$${venta.descuento.toFixed(2)}</td>
      </tr>` : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Recibo #${venta.id}</title>
  <style>
    /* ── Reset ── */
    * { margin:0; padding:0; box-sizing:border-box; }

    /* ── Oculta URL/fecha que agrega el browser ── */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    /* ── Pantalla: preview con fondo gris y ticket centrado ── */
    html {
      background: #e8e8e8;
      min-height: 100%;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #111;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 32px 16px;
      min-height: 100vh;
    }
    .ticket {
      background: #fff;
      width: 340px;
      padding: 28px 24px 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      border-radius: 4px;
    }

    /* ── Impresión: sin fondo gris, centrado en A4 ── */
    @media print {
      html { background: #fff; height: auto !important; min-height: 0 !important; }
      body {
        height: auto !important;
        min-height: 0 !important;
        padding: 15mm 0;
        display: block;
      }
      .ticket {
        width: 90mm;
        margin: 0 auto;
        box-shadow: none;
        border-radius: 0;
        padding: 0 8mm;
      }
    }

    /* ── Encabezado ── */
    .store-name { text-align:center; font-size:22px; font-weight:900; letter-spacing:3px; margin-bottom:2px; }
    .store-sub  { text-align:center; font-size:10px; color:#777; letter-spacing:1px; margin-bottom:14px; }
    .receipt-title {
      text-align:center; font-size:10px; font-weight:700;
      letter-spacing:3px; text-transform:uppercase; color:#555; margin:10px 0 4px;
    }
    .receipt-id { text-align:center; font-size:18px; font-weight:800; margin-bottom:12px; }

    /* ── Divisores ── */
    .div-solid { border:none; border-top:2px solid #111; margin:10px 0; }
    .div-dash  { border:none; border-top:1px dashed #bbb; margin:10px 0; }

    /* ── Filas de info ── */
    .info-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; }
    .lbl { color:#777; }

    /* ── Tabla de productos ── */
    table { width:100%; border-collapse:collapse; font-size:12px; }
    thead th {
      font-size:10px; text-transform:uppercase; color:#777; letter-spacing:0.5px;
      padding:4px 2px 7px; border-bottom:1px solid #333;
    }
    .td-prod   { padding:6px 2px; border-bottom:1px dashed #ddd; line-height:1.35; }
    .td-center { padding:6px 2px; border-bottom:1px dashed #ddd; text-align:center; }
    .td-right  { padding:6px 2px; border-bottom:1px dashed #ddd; text-align:right; }
    .td-bold   { font-weight:700; }
    small { font-size:10px; color:#999; }

    /* ── Totales ── */
    .totals td { padding:4px 2px; font-size:12px; }
    .total-row td { font-size:16px; font-weight:900; padding-top:8px; border-top:2px solid #111; }

    /* ── Footer ── */
    .footer {
      text-align:center; font-size:10px; color:#999;
      margin-top:14px; line-height:1.8; letter-spacing:0.3px;
    }
    .footer strong { color:#555; font-size:11px; }
  </style>
</head>
<body>
<div class="ticket">

  <div class="store-name">EDHEN</div>
  <div class="store-sub">INDUMENTARIA</div>

  <hr class="div-solid">

  <div class="receipt-title">Comprobante de Venta</div>
  <div class="receipt-id">N° ${String(venta.id).padStart(6, '0')}</div>

  <div class="info-row"><span class="lbl">Fecha</span><span>${venta.fecha}${venta.hora ? ' ' + venta.hora : ''}</span></div>
  <div class="info-row"><span class="lbl">Cliente</span><span>${venta.cliente || 'Consumidor Final'}</span></div>
  <div class="info-row"><span class="lbl">Forma de pago</span><span>${venta.formaPago}</span></div>
  <div class="info-row"><span class="lbl">Estado</span><span>${venta.estado}</span></div>

  <hr class="div-dash">

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Producto</th>
        <th style="text-align:center">Cant</th>
        <th style="text-align:right">P.U.</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <hr class="div-dash">

  <table class="totals">
    <tbody>
      <tr>
        <td colspan="3" class="td-right lbl">Subtotal</td>
        <td class="td-right">$${(venta.subtotal ?? venta.total ?? 0).toFixed(2)}</td>
      </tr>
      ${descuentoRow}
      <tr class="total-row">
        <td colspan="3" class="td-right">TOTAL</td>
        <td class="td-right">$${(venta.total ?? 0).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <hr class="div-solid">

  <div class="footer">
    <strong>¡Gracias por tu compra!</strong><br>
    Conservá este comprobante<br>
    edhenindumentaria@gmail.com
  </div>

</div>
<script>
  window.onload = () => {
    window.print();
    window.onafterprint = () => window.close();
  };
<\/script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=500,height=700,menubar=no,toolbar=no,location=no');
    w.document.write(html);
    w.document.close();
  };

  const handleDownloadPDF = async (venta) => {
    const toastId = toast.loading('Generando PDF...');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF }       = await import('jspdf');

      const style = document.createElement('style');
      style.textContent = RECEIPT_STYLES;
      document.head.appendChild(style);

      const container = document.createElement('div');
      container.className = 'ticket';
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:302px;background:#fff;padding:20px 16px 20px;';
      container.innerHTML = buildReceiptInner(venta);
      document.body.appendChild(container);

      try {
        const canvas   = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData  = canvas.toDataURL('image/png');
        const ticketW  = 80;
        const ticketH  = (canvas.height / canvas.width) * ticketW;

        const pdf = new jsPDF({ unit: 'mm', format: [ticketW, ticketH], orientation: 'portrait' });
        pdf.addImage(imgData, 'PNG', 0, 0, ticketW, ticketH);
        pdf.save(`recibo-${String(venta.id).padStart(6, '0')}.pdf`);
        toast.success('PDF descargado', { id: toastId });
      } finally {
        document.body.removeChild(container);
        document.head.removeChild(style);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el PDF', { id: toastId });
    }
  };

  const handleDuplicateVenta = (venta) => {
    const nueva = { ...venta, id: Date.now() };
    const nuevas = [...ventas, nueva];
    setVentas(nuevas);
    saveVentasLocal(nuevas.filter((v) => v.source === 'local'));
    toast.success('Venta duplicada');
  };

  const handleDevolucion = (venta) => {
    const devuelta = { ...venta, id: Date.now(), estado: 'Devuelta' };
    setVentas((prev) => [...prev, devuelta]);
    toast.success('Devolución registrada');
  };

  const limpiarFiltros = () => {
    setBusqueda(''); setFilterEstado(''); setFilterFormaPago('');
    setFilterMontoMin(''); setFilterMontoMax('');
    setStartDate(''); setEndDate('');
    setCurrentPage(1);
  };

  const hayFiltros = busqueda || filterEstado || filterFormaPago || filterMontoMin || filterMontoMax || startDate || endDate;

  const ventasFiltradas = useMemo(() =>
    ventas
      .filter((v) => {
        const term = busqueda.toLowerCase();
        const ok_search = !busqueda ||
          String(v.id).includes(busqueda) ||
          v.cliente?.toLowerCase().includes(term) ||
          v.formaPago?.toLowerCase().includes(term);
        const ok_estado    = !filterEstado    || v.estado    === filterEstado;
        const ok_pago      = !filterFormaPago || v.formaPago === filterFormaPago;
        const ok_min       = !filterMontoMin  || (v.total || 0) >= parseFloat(filterMontoMin);
        const ok_max       = !filterMontoMax  || (v.total || 0) <= parseFloat(filterMontoMax);
        const fechaV       = parseFecha(v.fecha);
        const ok_start     = !startDate || (fechaV && fechaV >= toLocalDate(startDate));
        const ok_end       = !endDate   || (fechaV && fechaV <= toLocalDate(endDate));
        return ok_search && ok_estado && ok_pago && ok_min && ok_max && ok_start && ok_end;
      })
      .sort((a, b) => (parseFecha(b.fecha) || 0) - (parseFecha(a.fecha) || 0)),
    [ventas, busqueda, filterEstado, filterFormaPago, filterMontoMin, filterMontoMax, startDate, endDate]
  );

  const totalPages    = Math.max(1, Math.ceil(ventasFiltradas.length / itemsPerPage));
  const currentVentas = ventasFiltradas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total     = ventasFiltradas.reduce((s, v) => s + (v.total || 0), 0);
    const descuento = ventasFiltradas.reduce((s, v) => s + (v.descuento || 0), 0);
    return {
      recaudado:     `$${total.toFixed(2)}`,
      transacciones: ventasFiltradas.length,
      ticket:        ventasFiltradas.length ? `$${(total / ventasFiltradas.length).toFixed(2)}` : '$0.00',
      descuentos:    `-$${descuento.toFixed(2)}`,
    };
  }, [ventasFiltradas]);

  const todayStr = today();

  const setRango = (start, end) => { setStartDate(start); setEndDate(end); setCurrentPage(1); };

  const isRangoActive = (start, end) => startDate === start && endDate === end;

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 fw-bold">
            <i className="fa fa-clock-rotate-left me-2 text-primary" />Historial de Ventas
          </h1>
          <p className="text-muted mb-0 small mt-1">Registro completo de todas las transacciones</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={loadVentasData} disabled={loading}>
          <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-rotate'} me-1`} />
          Actualizar
        </button>
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
                  <div className="fw-bold fs-6" style={{ color }}>{stats[key]}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card border shadow-sm mb-3">
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">Buscar</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><i className="fa fa-search text-muted" /></span>
                <input type="text" className="form-control" placeholder="ID, cliente, pago..."
                  value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">Estado</label>
              <select className="form-select form-select-sm" value={filterEstado}
                onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}>
                <option value="">Todos</option>
                <option value="Completada">Completada</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Devuelta">Devuelta</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">Forma de pago</label>
              <select className="form-select form-select-sm" value={filterFormaPago}
                onChange={(e) => { setFilterFormaPago(e.target.value); setCurrentPage(1); }}>
                <option value="">Todas</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">Monto</label>
              <div className="d-flex gap-1">
                <input type="number" className="form-control form-control-sm" placeholder="Mín"
                  value={filterMontoMin} onChange={(e) => { setFilterMontoMin(e.target.value); setCurrentPage(1); }} />
                <input type="number" className="form-control form-control-sm" placeholder="Máx"
                  value={filterMontoMax} onChange={(e) => { setFilterMontoMax(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted mb-1">Período</label>
              <div className="btn-group btn-group-sm w-100" role="group">
                <button className={`btn ${!startDate && !endDate ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setRango('', '')}>Todas</button>
                <button className={`btn ${isRangoActive(todayStr, todayStr) ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setRango(todayStr, todayStr)}>Hoy</button>
                <button className={`btn ${!isRangoActive('', '') && !isRangoActive(todayStr, todayStr) && startDate ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => {
                    const d = new Date();
                    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                    setRango(start, todayStr);
                  }}>Mes</button>
              </div>
            </div>
            <div className="col-md-1 d-flex align-items-end">
              {hayFiltros && (
                <button className="btn btn-sm btn-outline-danger w-100" onClick={limpiarFiltros} title="Limpiar filtros">
                  <i className="fa fa-xmark" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted small">
          <span className="fw-semibold text-dark">{ventasFiltradas.length}</span> ventas encontradas
          {hayFiltros && <span className="badge bg-warning text-dark ms-2 rounded-pill">Filtros activos</span>}
        </span>
        <div className="d-flex align-items-center gap-2">
          <label className="text-muted small mb-0">Mostrar</label>
          <select className="form-select form-select-sm" style={{ width: 70 }} value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <SalesTable
        ventas={currentVentas}
        loading={loading}
        onDelete={(id) => { const v = ventas.find((x) => x.id === id); if (v) setConfirmEliminar(v); }}
        onView={setSelectedVenta}
        onPrint={handlePrintVenta}
        onDuplicate={handleDuplicateVenta}
        onReturn={handleDevolucion}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            {' '}· Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, ventasFiltradas.length)} de {ventasFiltradas.length}
          </span>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}>
              <i className="fa fa-angles-left" />
            </button>
            <button className="btn btn-sm btn-outline-secondary" disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}>
              <i className="fa fa-chevron-left" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
              return (
                <button key={page} className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              );
            })}
            <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}>
              <i className="fa fa-chevron-right" />
            </button>
            <button className="btn btn-sm btn-outline-secondary" disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}>
              <i className="fa fa-angles-right" />
            </button>
          </div>
        </div>
      )}

      {selectedVenta && (
        <DetalleVentaModal
          venta={selectedVenta}
          onClose={() => setSelectedVenta(null)}
          onPrint={handlePrintVenta}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
      {confirmEliminar && (
        <ConfirmDeleteModal
          nombre={`venta #${confirmEliminar.id}`}
          entidad="venta"
          onConfirm={handleDeleteVenta}
          onCancel={() => setConfirmEliminar(null)}
        />
      )}
    </div>
  );
};

export default VentasHistorial;
