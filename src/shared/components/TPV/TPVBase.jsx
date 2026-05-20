import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { mockProductoService, mockClienteService } from '../../../services/mocks';
import { categoriaService } from '../../../services/api';
import TPVProductCard from './TPVProductCard';
import TPVCart from './TPVCart';
import TPVClientPicker from './TPVClientPicker';
import TPVPaymentModal from './TPVPaymentModal';
import TPVVariantModal from './TPVVariantModal';
import TPVOnlineOrderSidebar from './TPVOnlineOrderSidebar';
import TPVOnlineShippingForm from '../../../modules/ventaOnline/components/TPVOnline/TPVOnlineShippingForm';
import { loadVentas, saveVentas, buildVenta, generarReciboPDF, imprimirDocumentoVenta, imprimirTicket } from './TPVUtils';
import { cajasService } from '../../../modules/cajas/services/cajasService';
import './TPV.css';

const CLIENTE_MINORISTA = { id: 0, nombre: 'Cliente Minorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Minorista' };
const CLIENTE_MAYORISTA = { id: -1, nombre: 'Cliente Mayorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Mayorista' };
const SERVICIOS_TRANSPORTISTA = ['Andreani', 'Correo Argentino', 'OCA', 'Expreso'];

function validarVenta({ carrito, formaPago, montoPagado, total }) {
  if (carrito.length === 0) return 'Agregue productos al carrito';
  if (formaPago === 'efectivo' && montoPagado < total)
    return `Monto insuficiente. Falta: $${(total - montoPagado).toFixed(2)}`;
  return null;
}

function buildClienteEnvioFromCliente(cliente) {
  return {
    nombre: cliente.nombre_envio || cliente.nombre || '',
    apellido: cliente.apellido_envio || '',
    dni: cliente.dni || '',
    email: cliente.email || '',
    telefono: cliente.telefono || '',
    direccion: cliente.direccion || '',
    ciudad: cliente.localidad || cliente.ciudad || '',
    provincia: cliente.provincia || '',
    codigoPostal: cliente.codigoPostal || '',
  };
}

function buildDatosEnvioFromCliente(cliente) {
  const transportista = cliente.transportista || '';
  return {
    servicio: SERVICIOS_TRANSPORTISTA.includes(transportista) ? transportista : 'Otro',
    transportista,
    montoMinimo: cliente.montoMinimo || '',
    atributos: {
      nombre: cliente.nombre_envio || cliente.nombre || '',
      destinatario: cliente.nombre_envio || cliente.nombre || '',
      apellido: cliente.apellido_envio || '',
      dni: cliente.dni || '',
      direccion: cliente.direccion || '',
      codigoPostal: cliente.codigoPostal || '',
      localidad: cliente.localidad || cliente.ciudad || '',
      provincia: cliente.provincia || '',
    },
  };
}

const TPVBase = ({
  pageTitle = 'TPV - Terminal de Punto de Venta',
  pageDescription = 'Interfaz de ventas clara, rápida y moderna. Usa el escáner o busca productos abajo.',
  historyLink = '/sales',
  isOnline = false,
  onProcessSale = null,
  onUpdateShipping = null,
  datosEnvio: externalDatosEnvio,
  setDatosEnvio: externalSetDatosEnvio
}) => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(CLIENTE_MINORISTA);
  const [clienteEnvio, setClienteEnvio] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  });
  const [datosEnvio, setDatosEnvio] = useState(externalDatosEnvio || {
    servicio: '',
    transportista: '',
    montoMinimo: '',
    transportistaAtributos: [],
    atributos: {}
  });
  const [showShippingDetailsForm, setShowShippingDetailsForm] = useState(false);
  const [pedidoGenerado, setPedidoGenerado] = useState(null);
  const [editandoEnvio, setEditandoEnvio] = useState(false);
  const [descuento, setDescuento] = useState(0);
  const [tipoDescuento, setTipoDescuento] = useState('porcentaje');
  const [formaPago, setFormaPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState(0);
  const [showModalPago, setShowModalPago] = useState(false);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [ventasGuardadas, setVentasGuardadas] = useState([]);
  const [selectedProductoVariante, setSelectedProductoVariante] = useState(null);
  const [variantCantidades, setVariantCantidades] = useState({});
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const barcodeScannerRef = useRef(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [categoriasDisponibles, setCategoriasDisponibles] = useState(['Todas']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const debounceTimeoutRef = useRef(null);
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [ordenamiento, setOrdenamiento] = useState('nombre');
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    mockProductoService.listar()
      .then(res => {
        setProductos(res.data.filter((producto) => producto.activo));
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        toast.error('Error al cargar productos');
      });

    mockClienteService.listar()
      .then(res => {
        setClientes(res.data || []);
      })
      .catch(err => {
        console.error('Error al cargar clientes:', err);
      });

    categoriaService.listar()
      .then(res => {
        const categoriasActivas = (res.data || [])
          .filter((categoria) => categoria.activo)
          .map((categoria) => categoria.nombre)
          .filter(Boolean);
        setCategoriasDisponibles(['Todas', ...new Set(categoriasActivas)]);
      })
      .catch(err => {
        console.error('Error al cargar categorías:', err);
      });

    setVentasGuardadas(loadVentas());
    
    if (barcodeScannerRef.current) {
      barcodeScannerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(debounceTimeoutRef.current);
  }, [busqueda]);

  useEffect(() => {
    if (externalDatosEnvio) {
      setDatosEnvio(externalDatosEnvio);
    }
  }, [externalDatosEnvio]);


  const categorias = useMemo(() => {
    const fallback = ['Todas', ...new Set(productos.map((p) => p.categoria))].filter(Boolean);
    return categoriasDisponibles.length > 1 ? categoriasDisponibles : fallback;
  }, [categoriasDisponibles, productos]);

  const productosFiltrados = useMemo(() => {
    const categoriasActivas = categorias.filter((cat) => cat !== 'Todas');
    let filtrados = productos
      .filter((producto) => {
        if (categoriasActivas.length > 0 && !categoriasActivas.includes(producto.categoria)) {
          return false;
        }

        const matchCategoria = categoriaSeleccionada === 'Todas'
          || (categoriaSeleccionada === 'Ofertas' && producto.oferta)
          || producto.categoria === categoriaSeleccionada;

        const searchText = busquedaDebounced.toLowerCase();
        const matchBusqueda = producto.nombre.toLowerCase().includes(searchText) ||
          producto.sku.toLowerCase().includes(searchText) ||
          producto.descripcion.toLowerCase().includes(searchText) ||
          producto.modelo.toLowerCase().includes(searchText) ||
          producto.codigoBarras.toLowerCase().includes(searchText);
        
        let matchStock = true;
        if (filtroStock === 'bajo') {
          matchStock = producto.stock <= 5;
        } else if (filtroStock === 'medio') {
          matchStock = producto.stock > 5 && producto.stock <= 10;
        } else if (filtroStock === 'alto') {
          matchStock = producto.stock > 10;
        }
        
        return matchCategoria && matchBusqueda && matchStock;
      });

    filtrados.sort((a, b) => {
      if (ordenamiento === 'nombre') {
        return a.nombre.localeCompare(b.nombre);
      } else if (ordenamiento === 'stock') {
        return a.stock - b.stock;
      } else if (ordenamiento === 'precio') {
        return a.precioVenta - b.precioVenta;
      }
      return 0;
    });

    return filtrados;
  }, [productos, categoriaSeleccionada, busquedaDebounced, filtroStock, ordenamiento, categorias]);

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const productosActuales = useMemo(
    () => productosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [productosFiltrados, currentPage]
  );

  const clientesFiltrados = useMemo(
    () => clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase())
    ),
    [clientes, busquedaCliente]
  );

  const subtotal = useMemo(
    () => carrito.reduce((sum, item) => sum + item.precioVenta * item.cantidad, 0),
    [carrito]
  );

  const descuentoCalculado = useMemo(() => {
    if (tipoDescuento === 'porcentaje') {
      return (subtotal * descuento) / 100;
    }
    return descuento;
  }, [subtotal, descuento, tipoDescuento]);

  const total = useMemo(() => Math.max(0, subtotal - descuentoCalculado), [subtotal, descuentoCalculado]);
  const cambio = useMemo(() => Math.max(0, montoPagado - total), [montoPagado, total]);

  const agregarAlCarrito = useCallback((producto, variante = null, cantidad = 1) => {
    setCarrito((prevCarrito) => {
      const itemId = variante ? `${producto.id}|${variante.id}` : `${producto.id}`;
      const stockDisponible = variante ? (variante.stock || 0) : (producto.stock || 0);
      const existente = prevCarrito.find((item) => item.id === itemId);

      if (existente) {
        return prevCarrito.map((item) =>
          item.id === itemId
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, stockDisponible) }
            : item
        );
      }

      return [...prevCarrito, {
        id: itemId,
        productoId: producto.id,
        varianteId: variante?.id,
        variantLabel: variante ? Object.entries(variante)
          .filter(([key]) => key !== 'id' && key !== 'stock')
          .map(([, value]) => value)
          .join(' / ') : '',
        nombre: producto.nombre,
        sku: variante ? `${producto.sku}-${variante.id}` : producto.sku,
        precioOriginal: producto.precioVenta,
        precioVenta: producto.oferta ? (producto.precioOferta ?? producto.precioVenta) : producto.precioVenta,
        oferta: !!producto.oferta,
        cantidad,
        stock: stockDisponible,
        icono: producto.icono
      }];
    });
    toast.success(`${producto.nombre}${variante ? ` (${variante.id})` : ''} agregado al carrito`);
  }, []);

  const abrirSeleccionDeVariante = useCallback((producto) => {
    if (!producto.variantes || producto.variantes.length === 0) return;
    setSelectedProductoVariante(producto);
    const inicial = {};
    producto.variantes.forEach((v) => { inicial[v.id] = 0; });
    setVariantCantidades(inicial);
  }, []);

  const handleAddProduct = useCallback((producto) => {
    if (producto.tieneVariantes) {
      abrirSeleccionDeVariante(producto);
      return;
    }
    agregarAlCarrito(producto);
  }, [agregarAlCarrito, abrirSeleccionDeVariante]);

  const handleVariantCantidadChange = useCallback((varianteId, delta) => {
    setVariantCantidades((prev) => {
      const variante = selectedProductoVariante?.variantes.find((v) => v.id === varianteId);
      const maxStock = variante?.stock || 0;
      const next = Math.max(0, Math.min((prev[varianteId] || 0) + delta, maxStock));
      return { ...prev, [varianteId]: next };
    });
  }, [selectedProductoVariante]);

  const handleConfirmVariantAdd = useCallback(() => {
    if (!selectedProductoVariante) return;
    const variantesConCantidad = selectedProductoVariante.variantes.filter(
      (v) => (variantCantidades[v.id] || 0) > 0
    );
    if (variantesConCantidad.length === 0) return;
    variantesConCantidad.forEach((variante) => {
      agregarAlCarrito(selectedProductoVariante, variante, variantCantidades[variante.id]);
    });
    setSelectedProductoVariante(null);
    setVariantCantidades({});
  }, [agregarAlCarrito, selectedProductoVariante, variantCantidades]);

  const handleCancelVariantSelection = useCallback(() => {
    setSelectedProductoVariante(null);
    setVariantCantidades({});
  }, []);

  const procesarCodigoBarras = useCallback(async (codigo) => {
    const codigoLimpio = codigo.trim();
    if (!codigoLimpio) return;

    try {
      const res = await mockProductoService.buscarPorCodigo(codigoLimpio);
      const productoBuscado = res.data;

      if (productoBuscado.tieneVariantes) {
        abrirSeleccionDeVariante(productoBuscado);
      } else {
        agregarAlCarrito(productoBuscado);
      }

      setCodigoEscaneado('');
    } catch (error) {
      toast.error(`Producto no encontrado: ${codigoLimpio}`);
      setCodigoEscaneado('');
    }
  }, [agregarAlCarrito, abrirSeleccionDeVariante]);

  const handleBarcodeInput = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      procesarCodigoBarras(codigoEscaneado);
    }
  }, [codigoEscaneado, procesarCodigoBarras]);

  const actualizarPrecioItem = useCallback((id, nuevoPrecio) => {
    setCarrito((prevCarrito) => prevCarrito.map((item) =>
      item.id === id
        ? { ...item, precioVenta: Math.max(0, nuevoPrecio) }
        : item
    ));
  }, []);

  const actualizarCantidad = useCallback((id, nuevaCantidad) => {
    setCarrito((prevCarrito) => {
      if (nuevaCantidad <= 0) {
        return prevCarrito.filter((item) => item.id !== id);
      }
      return prevCarrito.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.min(nuevaCantidad, item.stock) }
          : item
      );
    });
  }, []);

  const eliminarDelCarrito = useCallback((id) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
    const producto = carrito.find((item) => item.id === id);
    if (producto) {
      toast.success(`${producto.nombre} removido del carrito`);
    }
  }, [carrito]);

  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
    toast.info('Carrito vaciado');
  }, []);


  const procesarVenta = useCallback(async () => {
    const errorValidacion = validarVenta({ carrito, formaPago, montoPagado, total });
    if (errorValidacion) { toast.error(errorValidacion); return; }

    const numeroVenta = Math.floor(Math.random() * 100000) + 1;
    const nuevaVenta = buildVenta({
      numeroVenta,
      clienteNombre: clienteSeleccionado?.nombre,
      carrito,
      subtotal,
      descuentoCalculado,
      total,
      formaPago,
      cambio
    });

    const nuevasVentas = [...ventasGuardadas, nuevaVenta];
    setVentasGuardadas(nuevasVentas);
    saveVentas(nuevasVentas);

    if (formaPago === 'efectivo') {
      const cajaActualRes = await cajasService.obtenerCajaActual();
      const cajaActual = cajaActualRes.data;

      if (cajaActual) {
        try {
          await cajasService.registrarMovimiento(
            cajaActual.id,
            'entrada',
            total,
            `Venta #${numeroVenta} - ${clienteSeleccionado?.nombre || 'Cliente'}`,
            'Usuario Actual'
          );
          toast.success('Ingreso en caja registrado automáticamente');
        } catch (error) {
          console.error('Error registrando venta en caja:', error);
          toast.error('La venta se procesó, pero no se pudo registrar en caja');
        }
      } else {
        toast.error('Venta en efectivo procesada, pero no hay caja abierta para registrar el ingreso');
      }
    }

    const productosActualizados = productos.map((producto) => {
      const itemsDelProducto = carrito.filter((item) => item.productoId === producto.id);
      if (itemsDelProducto.length === 0) return producto;

      const actualizado = { ...producto };
      if (producto.tieneVariantes) {
        actualizado.variantes = producto.variantes.map((variante) => {
          const item = itemsDelProducto.find((carritoItem) => carritoItem.varianteId === variante.id);
          if (!item) return variante;
          return { ...variante, stock: Math.max(0, (variante.stock || 0) - item.cantidad) };
        });
        actualizado.stock = actualizado.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
      } else {
        const totalCantidad = itemsDelProducto.reduce((sum, item) => sum + item.cantidad, 0);
        actualizado.stock = Math.max(0, (producto.stock || 0) - totalCantidad);
      }
      return actualizado;
    });

    setProductos(productosActualizados);

    const printData = {
      numeroVenta,
      cliente: clienteSeleccionado,
      clienteEnvio,
      carrito: [...carrito],
      subtotal,
      descuentoCalculado,
      total,
      formaPago,
      cambio,
      datosEnvio: { ...datosEnvio },
    };

    if (isOnline && onProcessSale) {
      const pedidoCreado = await onProcessSale({
        numeroVenta,
        cliente: clienteSeleccionado,
        clienteEnvio,
        carrito,
        subtotal,
        descuentoCalculado,
        total,
        formaPago,
        cambio,
        datosEnvio,
      });
      setPedidoGenerado({
        pedidoId:      pedidoCreado?.id,
        numeroPedido:  String(numeroVenta).padStart(6, '0'),
        clienteNombre: clienteSeleccionado?.nombre || 'Cliente',
        total,
        formaPago,
        datosEnvio:    { ...datosEnvio },
        printData,
      });
    } else {
      const imprimir = window.confirm('¿Desea imprimir la factura y datos de envío?');
      if (imprimir) imprimirDocumentoVenta(printData);
      toast.success('¡Venta procesada correctamente!');
    }

    setCarrito([]);
    setClienteSeleccionado(CLIENTE_MINORISTA);
    setDescuento(0);
    setMontoPagado(0);
    setShowModalPago(false);
  }, [carrito, clienteSeleccionado, clienteEnvio, subtotal, descuentoCalculado, total, formaPago, cambio, ventasGuardadas, productos, montoPagado, isOnline, onProcessSale, datosEnvio]);


  const handleSelectGenericClient = useCallback(() => {
    const clienteGenerico = {
      id: 'generic',
      nombre: 'Cliente Genérico',
      email: '',
      telefono: '',
      tipo: 'Genérico'
    };
    setClienteSeleccionado(clienteGenerico);
    setShowModalCliente(false);
    if (isOnline) setShowShippingDetailsForm(true);
  }, [isOnline]);

  const handleSelectRegisteredClient = useCallback((cliente) => {
    setClienteSeleccionado(cliente);
    setShowModalCliente(false);

    const clienteEnvioData = buildClienteEnvioFromCliente(cliente);
    setClienteEnvio(clienteEnvioData);

    if (cliente.direccion || cliente.localidad || cliente.provincia || cliente.codigoPostal) {
      setDatosEnvio((prev) => ({
        ...prev,
        ...buildDatosEnvioFromCliente(cliente)
      }));
    }

    if (isOnline && !cliente.direccion && !cliente.localidad && !cliente.provincia) {
      setShowShippingDetailsForm(true);
    }
  }, [isOnline]);

  return (
    <div className="container-fluid p-0 tpv-page">
      <input
        ref={barcodeScannerRef}
        type="text"
        value={codigoEscaneado}
        onChange={(e) => setCodigoEscaneado(e.target.value)}
        onKeyDown={handleBarcodeInput}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0
        }}
        placeholder="Lector de código de barras"
        aria-label="Lector de código de barras"
      />

      <div className="tpv-page-header">
        {/* Izquierda: marca compacta */}
        <div className="d-flex align-items-center gap-2">
          <i className="fa fa-cash-register fs-5 text-primary" />
          <span className="tpv-header-brand">TPV</span>
          <span className="tpv-header-mode">{isOnline ? 'Online' : 'Tienda Física'}</span>
        </div>

        {/* Centro / derecha: estado del sistema */}
        <div className="d-flex align-items-center gap-3">

          {/* Escáner */}
          <div className="tpv-status-chip" title="Escáner de código de barras activo">
            <span className="tpv-status-dot tpv-status-ok" />
            <i className="fa fa-barcode" />
            <span className="tpv-status-label">Escáner</span>
          </div>

          {/* Impresora */}
          <div className="tpv-status-chip" title="Impresora de tickets">
            <span className="tpv-status-dot tpv-status-ok" />
            <i className="fa fa-print" />
            <span className="tpv-status-label">Impresora</span>
          </div>

          {/* Divisor */}
          <span className="tpv-header-divider" />

          {/* Reloj */}
          <div className="tpv-clock">
            <span className="tpv-clock-time">
              {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="tpv-clock-date">
              {horaActual.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Divisor */}
          <span className="tpv-header-divider" />

          {/* Historial */}
          {historyLink && (
            <a href={historyLink} className="btn tpv-historial-btn btn-sm">
              <i className="fa fa-history me-1" />Historial
            </a>
          )}
        </div>
      </div>

      <div className="row g-0 tpv-main-content">
        <div className="col-lg-8 tpv-catalog-col">
          <div className="card border-0 rounded-0 h-100">
            <div className="d-flex justify-content-between align-items-center px-3 py-2"
              style={{ backgroundColor: '#0d6efd', color: '#fff' }}>
              <h5 className="mb-0 fw-semibold" style={{ color: '#fff' }}>
                <i className="fa fa-box-open me-2" style={{ opacity: 0.8 }} />Catálogo
              </h5>
              <span className="badge rounded-pill"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.78rem' }}>
                {productosFiltrados.length} productos
              </span>
            </div>
            <div className="card-body p-3">
              <div className="row g-2 mb-2">
                <div className="col">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar por nombre, SKU, modelo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <select className="form-select form-select-sm" value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)}>
                    <option value="todos">Todo stock</option>
                    <option value="bajo">Bajo (≤5)</option>
                    <option value="medio">Medio (5-10)</option>
                    <option value="alto">Alto (&gt;10)</option>
                  </select>
                </div>
                <div className="col-auto">
                  <select className="form-select form-select-sm" value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)}>
                    <option value="nombre">Nombre ↑</option>
                    <option value="stock">Stock menor</option>
                    <option value="precio">Precio menor</option>
                  </select>
                </div>
              </div>

              <div className="nav nav-tabs-sm mb-3 tpv-tabs-container p-2">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    className={`nav-link nav-link-sm ${categoriaSeleccionada === categoria ? 'active' : ''}`}
                    onClick={() => {
                      setCategoriaSeleccionada(categoria);
                      setCurrentPage(1);
                    }}
                  >
                    {categoria}
                  </button>
                ))}
              </div>

              <div className="row g-3 product-grid">
                {productosActuales.map((producto) => (
                  <TPVProductCard key={producto.id} producto={producto} onAdd={handleAddProduct} />
                ))}
              </div>

              {productosActuales.length === 0 && (
                <div className="text-center py-5">
                  <i className="fa fa-search fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No se encontraron productos con los filtros seleccionados</p>
                </div>
              )}

              {totalPages > 1 && (
                <nav aria-label="Paginación" className="mt-4">
                  <ul className="pagination pagination-sm justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                        Anterior
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button type="button" className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button type="button" className="page-link" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 tpv-cart-col">
          {isOnline ? (
            <TPVOnlineOrderSidebar
              carrito={carrito}
              clienteSeleccionado={clienteSeleccionado}
              onOpenClientModal={() => setShowModalCliente(true)}
              onQtyChange={actualizarCantidad}
              onRemove={eliminarDelCarrito}
              descuento={descuento}
              tipoDescuento={tipoDescuento}
              onDescuentoChange={setDescuento}
              onTipoDescuentoChange={setTipoDescuento}
              subtotal={subtotal}
              descuentoCalculado={descuentoCalculado}
              total={total}
              onOpenShippingForm={() => setShowShippingDetailsForm(true)}
              onOpenPaymentModal={() => setShowModalPago(true)}
              onClearCart={vaciarCarrito}
              datosEnvio={datosEnvio}
            />
          ) : (
            <TPVCart
              carrito={carrito}
              clienteSeleccionado={clienteSeleccionado}
              onOpenClientModal={() => setShowModalCliente(true)}
              onQtyChange={actualizarCantidad}
              onPriceChange={actualizarPrecioItem}
              onRemove={eliminarDelCarrito}
              descuento={descuento}
              tipoDescuento={tipoDescuento}
              onDescuentoChange={setDescuento}
              onTipoDescuentoChange={setTipoDescuento}
              subtotal={subtotal}
              descuentoCalculado={descuentoCalculado}
              total={total}
              onOpenPaymentModal={() => setShowModalPago(true)}
              onClearCart={vaciarCarrito}
            />
          )}
        </div>
      </div>

      <>
        <TPVClientPicker
            show={showModalCliente}
            clientes={clientesFiltrados}
            busquedaCliente={busquedaCliente}
            defaultClientes={[CLIENTE_MINORISTA, CLIENTE_MAYORISTA]}
            onBusquedaClienteChange={setBusquedaCliente}
            onSelectCliente={handleSelectRegisteredClient}
            onSelectGenericClient={handleSelectGenericClient}
            onClose={() => setShowModalCliente(false)}
          />

          <TPVPaymentModal
            show={showModalPago}
            formaPago={formaPago}
            onFormaPagoChange={setFormaPago}
            montoPagado={montoPagado}
            onMontoPagadoChange={setMontoPagado}
            total={total}
            cambio={cambio}
            onClose={() => setShowModalPago(false)}
            onConfirm={procesarVenta}
          />
      </>

      <TPVVariantModal
        show={!!selectedProductoVariante}
        producto={selectedProductoVariante}
        variantCantidades={variantCantidades}
        onCantidadChange={handleVariantCantidadChange}
        onCancel={handleCancelVariantSelection}
        onConfirm={handleConfirmVariantAdd}
      />

      {isOnline && (
        <TPVOnlineShippingForm
          show={showShippingDetailsForm}
          datosEnvio={datosEnvio}
          setDatosEnvio={setDatosEnvio}
          clientes={clientes}
          onConfirm={(newDatosEnvio) => {
            setShowShippingDetailsForm(false);
            if (editandoEnvio) {
              if (pedidoGenerado?.pedidoId && onUpdateShipping) {
                onUpdateShipping(pedidoGenerado.pedidoId, newDatosEnvio);
              }
              setPedidoGenerado((prev) => prev ? { ...prev, datosEnvio: newDatosEnvio } : null);
              setEditandoEnvio(false);
            }
          }}
          onCancel={() => {
            setShowShippingDetailsForm(false);
            setEditandoEnvio(false);
          }}
        />
      )}

      {/* Modal: Pedido generado */}
      {pedidoGenerado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
            <div className="modal-content">
              <div className="d-flex align-items-center gap-3 p-3"
                style={{ backgroundColor: '#198754', color: '#fff', borderRadius: '0.375rem 0.375rem 0 0' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <i className="fa fa-check-circle" />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>Pedido generado</h5>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>#{pedidoGenerado.numeroPedido}</div>
                </div>
              </div>
              <div className="modal-body py-3">
                <dl className="row small mb-0">
                  <dt className="col-5 text-muted">Cliente</dt>
                  <dd className="col-7 fw-semibold">{pedidoGenerado.clienteNombre}</dd>
                  <dt className="col-5 text-muted">Total</dt>
                  <dd className="col-7 fw-bold text-success">${pedidoGenerado.total.toFixed(2)}</dd>
                  <dt className="col-5 text-muted">Forma de pago</dt>
                  <dd className="col-7 text-capitalize">{pedidoGenerado.formaPago}</dd>
                  {pedidoGenerado.datosEnvio?._transporteNombre && (
                    <>
                      <dt className="col-5 text-muted">Transportista</dt>
                      <dd className="col-7">{pedidoGenerado.datosEnvio._transporteNombre}</dd>
                    </>
                  )}
                  {pedidoGenerado.datosEnvio?._transporteServicio && (
                    <>
                      <dt className="col-5 text-muted">Servicio</dt>
                      <dd className="col-7">{pedidoGenerado.datosEnvio._transporteServicio}</dd>
                    </>
                  )}
                </dl>
              </div>
              <div className="modal-footer border-top gap-2 flex-wrap">
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setEditandoEnvio(true);
                    setShowShippingDetailsForm(true);
                  }}>
                  <i className="fa fa-pen me-1" />Editar envío
                </button>
                <button className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    const d = pedidoGenerado.printData;
                    imprimirTicket({
                      numeroPedido:  `PED-${String(d.numeroVenta).padStart(6, '0')}`,
                      fecha:         new Date().toISOString(),
                      cliente:       d.cliente?.nombre || 'Cliente',
                      telefono:      d.clienteEnvio?.telefono || d.cliente?.telefono,
                      envio:         d.clienteEnvio,
                      detallesEnvio: d.datosEnvio,
                      formaPago:     d.formaPago,
                      total:         d.total,
                      items:         d.carrito.map((i) => ({
                        nombre:   i.nombre + (i.variantLabel ? ` (${i.variantLabel})` : ''),
                        cantidad: i.cantidad,
                        precio:   i.precioVenta,
                      })),
                    });
                  }}>
                  <i className="fa fa-print me-1" />Imprimir ticket
                </button>
                <button className="btn btn-sm btn-success ms-auto"
                  onClick={() => { setPedidoGenerado(null); setEditandoEnvio(false); }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showModalCliente || showModalPago || selectedProductoVariante || showShippingDetailsForm || pedidoGenerado) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default TPVBase;
