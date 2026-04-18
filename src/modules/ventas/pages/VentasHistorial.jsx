import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { ventaService } from '../../../services/api';
import SalesTable from '../components/SalesTable';
import styles from './VentasHistorial.module.css';

const SALES_KEY = 'ventasGuardadas';

const loadVentas = () => {
  try {
    return JSON.parse(localStorage.getItem(SALES_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

const saveVentas = (ventas) => {
  localStorage.setItem(SALES_KEY, JSON.stringify(ventas));
};

const parseFecha = (fecha) => {
  if (!fecha) return null;
  const [dia, mes, anio] = fecha.split('/').map(Number);
  return new Date(anio, mes - 1, dia);
};

/**
 * Página de Historial de Ventas
 * Listado de todas las ventas realizadas (locales y de API)
 * @component
 */
const VentasHistorial = () => {
  const [ventas, setVentas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterFormaPago, setFilterFormaPago] = useState('');
  const [filterMontoMin, setFilterMontoMin] = useState('');
  const [filterMontoMax, setFilterMontoMax] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVentasData();
  }, []);

  const loadVentasData = async () => {
    setLoading(true);
    try {
      const ventasLocales = loadVentas().map((venta) => ({ ...venta, source: 'local' }));
      const res = await ventaService.listar();
      const ventasApi = (res.data || []).map((venta) => ({ ...venta, source: 'api' }));
      const ventasCombinadas = [...ventasApi, ...ventasLocales];
      setVentas(ventasCombinadas);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      const ventasLocales = loadVentas().map((venta) => ({ ...venta, source: 'local' }));
      setVentas(ventasLocales);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenta = async (id) => {
    const confirmacion = window.confirm(`¿Eliminar venta #${id}?`);
    if (!confirmacion) return;

    try {
      const ventaEliminada = ventas.find((ventaItem) => ventaItem.id === id);
      if (ventaEliminada?.source === 'api') {
        await ventaService.eliminar(id);
      }

      const nuevasVentas = ventas.filter((ventaItem) => ventaItem.id !== id);
      setVentas(nuevasVentas);
      saveVentas(nuevasVentas.filter((ventaItem) => ventaItem.source === 'local'));
      toast.success('Venta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      toast.error('Error al eliminar la venta');
    }
  };

  const handlePrintVenta = (venta) => {
    const contenido = `
      RECIBO DE VENTA
      ===============================
      ID: ${venta.id}
      Fecha: ${venta.fecha} ${venta.hora || ''}
      Cliente: ${venta.cliente}
      Forma de Pago: ${venta.formaPago}
      Estado: ${venta.estado}
      ===============================
      PRODUCTOS:
      ${venta.items?.map(item => `${item.nombre} x${item.cantidad} - $${((item.precioVenta || 0) * item.cantidad).toFixed(2)}`).join('\n')}
      ===============================
      Subtotal: $${venta.subtotal?.toFixed(2) ?? 0}
      Descuento: -$${venta.descuento?.toFixed(2) ?? 0}
      TOTAL: $${venta.total?.toFixed(2) ?? 0}
      ===============================
    `;
    const ventana = window.open('', '_blank');
    ventana.document.write(`<pre>${contenido}</pre>`);
    ventana.document.close();
    ventana.print();
  };

  const handleDuplicateVenta = (venta) => {
    const nuevaVenta = { ...venta, id: Date.now() };
    setVentas(prev => [...prev, nuevaVenta]);
    saveVentas([...ventas, nuevaVenta].filter(v => v.source === 'local'));
    toast.success('Venta duplicada. Puedes editarla en el TPV.');
  };

  const handleDevolucion = (venta) => {
    const confirmacion = window.confirm(`¿Registrar devolución para venta #${venta.id}?`);
    if (!confirmacion) return;
    
    const ventaDevuelta = { ...venta, id: Date.now(), estado: 'Devuelta' };
    setVentas(prev => [...prev, ventaDevuelta]);
    toast.success('Devolución registrada correctamente.');
  };

  const ventasFiltradas = useMemo(
    () => ventas
      .filter((venta) => {
        const searchTerm = busqueda.toLowerCase();
        const matchSearch =
          busqueda === '' ||
          venta.id.toString().includes(busqueda) ||
          (venta.cliente && venta.cliente.toLowerCase().includes(searchTerm)) ||
          (venta.formaPago && venta.formaPago.toLowerCase().includes(searchTerm));

        const matchEstado = filterEstado === '' || venta.estado === filterEstado;
        const matchFormaPago = filterFormaPago === '' || venta.formaPago === filterFormaPago;
        const matchMontoMin = filterMontoMin === '' || (venta.total || 0) >= parseFloat(filterMontoMin);
        const matchMontoMax = filterMontoMax === '' || (venta.total || 0) <= parseFloat(filterMontoMax);

        const fechaVenta = parseFecha(venta.fecha);
        const matchStartDate = startDate === '' || (fechaVenta && fechaVenta >= new Date(startDate));
        const matchEndDate = endDate === '' || (fechaVenta && fechaVenta <= new Date(endDate));

        return matchSearch && matchEstado && matchFormaPago && matchMontoMin && matchMontoMax && matchStartDate && matchEndDate;
      })
      .sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-'))),
    [ventas, busqueda, filterEstado, filterFormaPago, filterMontoMin, filterMontoMax, startDate, endDate]
  );

  const totalPages = Math.max(1, Math.ceil(ventasFiltradas.length / itemsPerPage));
  const currentVentas = ventasFiltradas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className={`container-fluid ${styles.container}`}>
      <div className={`d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-2 ${styles.header}`}>
        <h1 className="h3 mb-0">
          <i className="fa fa-shopping-cart me-2"></i>Historial de Ventas
        </h1>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={loadVentasData}
          disabled={loading}
        >
          <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
          Actualizar
        </button>
      </div>

      {/* Resumen de Estadísticas */}
      {ventasFiltradas.length > 0 && (
        <div className="row g-2 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 bg-light">
              <div className="card-body p-3">
                <small className="text-muted d-block mb-1">
                  <i className="fa fa-receipt me-1"></i>Total Ventas
                </small>
                <h5 className="mb-0 text-success">${ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0).toFixed(2)}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 bg-light">
              <div className="card-body p-3">
                <small className="text-muted d-block mb-1">
                  <i className="fa fa-hashtag me-1"></i>Transacciones
                </small>
                <h5 className="mb-0 text-info">{ventasFiltradas.length}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 bg-light">
              <div className="card-body p-3">
                <small className="text-muted d-block mb-1">
                  <i className="fa fa-chart-line me-1"></i>Ticket Promedio
                </small>
                <h5 className="mb-0 text-primary">${(ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0) / ventasFiltradas.length).toFixed(2)}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 bg-light">
              <div className="card-body p-3">
                <small className="text-muted d-block mb-1">
                  <i className="fa fa-tag me-1"></i>Total Descuentos
                </small>
                <h5 className="mb-0 text-danger">-${ventasFiltradas.reduce((sum, v) => sum + (v.descuento || 0), 0).toFixed(2)}</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por ID, cliente o pago..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="Completada">Completada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Devuelta">Devuelta</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterFormaPago}
            onChange={(e) => {
              setFilterFormaPago(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los pagos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Monto mín..."
            value={filterMontoMin}
            onChange={(e) => {
              setFilterMontoMin(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Monto máx..."
            value={filterMontoMax}
            onChange={(e) => {
              setFilterMontoMax(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-1">
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Botones de filtro rápido por fecha */}
      <div className="row g-2 mb-3">
        <div className="col-12">
          <div className="btn-group btn-group-sm" role="group">
            <button
              className={`btn ${startDate === '' && endDate === '' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
            >
              Todas
            </button>
            <button
              className={`btn ${startDate === new Date().toISOString().split('T')[0] && endDate === new Date().toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                setCurrentPage(1);
              }}
            >
              Hoy
            </button>
            <button
              className={`btn btn-outline-primary`}
              onClick={() => {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - dayOfWeek);
                setStartDate(startOfWeek.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
                setCurrentPage(1);
              }}
            >
              Esta semana
            </button>
            <button
              className={`btn btn-outline-primary`}
              onClick={() => {
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setStartDate(startOfMonth.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
                setCurrentPage(1);
              }}
            >
              Este mes
            </button>
          </div>
          <span className="badge bg-secondary ms-2">{ventasFiltradas.length} ventas</span>
        </div>
      </div>

      <SalesTable
        ventas={currentVentas}
        loading={loading}
        onDelete={handleDeleteVenta}
        onView={(venta) => setSelectedVenta(venta)}
        onPrint={handlePrintVenta}
        onDuplicate={handleDuplicateVenta}
        onReturn={handleDevolucion}
      />

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm me-2"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <i className="fa fa-chevron-left"></i> Anterior
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Siguiente <i className="fa fa-chevron-right"></i>
          </button>
        </div>
        <div className="text-muted">Página {currentPage} de {totalPages}</div>
      </div>

      {selectedVenta && (
        <div 
          className="modal show d-block" 
          tabIndex="-1"
          onClick={() => setSelectedVenta(null)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', pointerEvents: 'auto' }}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  <i className="fa fa-receipt me-2 text-primary"></i>
                  Detalle de venta #{selectedVenta.id}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedVenta(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p className="mb-1 text-muted small">Cliente</p>
                    <h6 className="mb-0">{selectedVenta.cliente}</h6>
                  </div>
                  <div className="col-md-3">
                    <p className="mb-1 text-muted small">Estado</p>
                    <span className={`badge bg-${selectedVenta.estado === 'Completada' ? 'success' : selectedVenta.estado === 'Devuelta' ? 'danger' : 'warning'} fs-6`}>
                      {selectedVenta.estado}
                    </span>
                  </div>
                  <div className="col-md-3">
                    <p className="mb-1 text-muted small">Forma de Pago</p>
                    <span className="badge bg-info fs-6">{selectedVenta.formaPago}</span>
                  </div>
                </div>

                <div className="row mb-3 pb-3 border-bottom small">
                  <div className="col-6">
                    <span className="text-muted">Fecha:</span> {selectedVenta.fecha}
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted">Items:</span> {selectedVenta.items?.length || 0}
                  </div>
                </div>

                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVenta.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.nombre}</td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-end">${item.precioVenta?.toFixed(2) ?? '0.00'}</td>
                          <td className="text-end fw-bold">${((item.precioVenta || 0) * item.cantidad).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-top pt-3 mb-3">
                  <div className="row">
                    <div className="col-6 text-muted small">Subtotal:</div>
                    <div className="col-6 text-end">${selectedVenta.subtotal?.toFixed(2) ?? '0.00'}</div>
                  </div>
                  {selectedVenta.descuento > 0 && (
                    <div className="row">
                      <div className="col-6 text-muted small">Descuento:</div>
                      <div className="col-6 text-end text-danger">-${selectedVenta.descuento?.toFixed(2) ?? '0.00'}</div>
                    </div>
                  )}
                  <div className="row mt-2 pt-2 border-top">
                    <div className="col-6 fw-bold">Total:</div>
                    <div className="col-6 text-end fw-bold text-success">${selectedVenta.total?.toFixed(2) ?? '0.00'}</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => {
                    handlePrintVenta(selectedVenta);
                    setSelectedVenta(null);
                  }}
                >
                  <i className="fa fa-print me-2"></i>Imprimir Recibo
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setSelectedVenta(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasHistorial;
