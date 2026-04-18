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
import { loadVentas, saveVentas, buildVenta, generarReciboPDF } from './TPVUtils';
import './TPV.module.css';

const CLIENTE_MINORISTA = { id: 0, nombre: 'Cliente Minorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Minorista' };
const CLIENTE_MAYORISTA = { id: -1, nombre: 'Cliente Mayorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Mayorista' };

const TPVBase = ({
  pageTitle = 'TPV - Terminal de Punto de Venta',
  pageDescription = 'Interfaz de ventas clara, rápida y moderna. Usa el escáner o busca productos abajo.',
  historyLink = '/sales',
  isOnline = false,
  onProcessSale = null
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
  const [descuento, setDescuento] = useState(0);
  const [tipoDescuento, setTipoDescuento] = useState('porcentaje');
  const [formaPago, setFormaPago] = useState('efectivo');
  const [montoPagado, setMontoPagado] = useState(0);
  const [showModalPago, setShowModalPago] = useState(false);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [ventasGuardadas, setVentasGuardadas] = useState([]);
  const [selectedProductoVariante, setSelectedProductoVariante] = useState(null);
  const [selectedVariante, setSelectedVariante] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
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
          .map(([_, value]) => value)
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
    const primeraDisponible = producto.variantes.find((v) => (v.stock || 0) > 0) || producto.variantes[0];
    setSelectedVariante(primeraDisponible);
    setCantidadSeleccionada(1);
  }, []);

  const handleAddProduct = useCallback((producto) => {
    if (producto.tieneVariantes) {
      abrirSeleccionDeVariante(producto);
      return;
    }
    agregarAlCarrito(producto);
  }, [agregarAlCarrito, abrirSeleccionDeVariante]);

  const handleConfirmVariantAdd = useCallback(() => {
    if (!selectedProductoVariante || !selectedVariante) return;
    agregarAlCarrito(selectedProductoVariante, selectedVariante, cantidadSeleccionada);
    setSelectedProductoVariante(null);
    setSelectedVariante(null);
    setCantidadSeleccionada(1);
  }, [agregarAlCarrito, cantidadSeleccionada, selectedProductoVariante, selectedVariante]);

  const handleCancelVariantSelection = useCallback(() => {
    setSelectedProductoVariante(null);
    setSelectedVariante(null);
    setCantidadSeleccionada(1);
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
    if (carrito.length === 0) {
      toast.error('Agregue productos al carrito');
      return;
    }

    if (formaPago === 'efectivo' && montoPagado < total) {
      toast.error(`Monto insuficiente. Falta: $${(total - montoPagado).toFixed(2)}`);
      return;
    }

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

    if (isOnline && onProcessSale) {
      onProcessSale({
        numeroVenta,
        cliente: clienteSeleccionado,
        clienteEnvio,
        carrito,
        subtotal,
        descuentoCalculado,
        total,
        formaPago,
        cambio
      });
    } else {
      toast.success('¡Venta procesada correctamente!');
      await generarReciboPDF({
        numeroVenta,
        cliente: clienteSeleccionado,
        carrito,
        subtotal,
        descuentoCalculado,
        total,
        formaPago,
        cambio
      });
    }

    setCarrito([]);
    setClienteSeleccionado(CLIENTE_MINORISTA);
    setDescuento(0);
    setMontoPagado(0);
    setShowModalPago(false);
  }, [carrito, clienteSeleccionado, clienteEnvio, subtotal, descuentoCalculado, total, formaPago, cambio, ventasGuardadas, productos, montoPagado, isOnline, onProcessSale]);

  return (
    <div className="container-fluid py-4 tpv-page bg-light">
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">
            <i className="fa fa-cash-register me-2"></i>{pageTitle}
            <span className="badge bg-success ms-2" style={{ fontSize: '0.6em' }}>
              <i className="fa fa-barcode me-1"></i>Escáner Activo
            </span>
          </h1>
          <p className="text-muted mb-0">{pageDescription}</p>
        </div>
        {historyLink && <a href={historyLink} className="btn btn-info">
          <i className="fa fa-history me-2"></i>Historial
        </a>}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Catálogo de Productos</h5>
              <span className="badge bg-light text-primary">{productosFiltrados.length} productos</span>
            </div>
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar por nombre, SKU, modelo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <select className="form-select form-select-sm" value={filtroStock} onChange={(e) => setFiltroStock(e.target.value)}>
                    <option value="todos">Todo stock</option>
                    <option value="bajo">Bajo (&lt;= 5)</option>
                    <option value="medio">Medio (5-10)</option>
                    <option value="alto">Alto (&gt; 10)</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select className="form-select form-select-sm" value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)}>
                    <option value="nombre">Nombre ↑</option>
                    <option value="stock">Stock menor</option>
                    <option value="precio">Precio menor</option>
                  </select>
                </div>
              </div>

              <div className="nav nav-tabs-sm mb-3 bg-light p-2 rounded">
                {categorias.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    className={`nav-link nav-link-sm ${categoriaSeleccionada === categoria ? 'active bg-primary text-white' : ''}`}
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

        <div className="col-lg-4">
          {isOnline ? (
            <TPVOnlineOrderSidebar
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
              clienteEnvio={clienteEnvio}
              setClienteEnvio={setClienteEnvio}
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

      {(
        <>
          <TPVClientPicker
            show={showModalCliente}
            clientes={clientesFiltrados}
            busquedaCliente={busquedaCliente}
            defaultClientes={[CLIENTE_MINORISTA, CLIENTE_MAYORISTA]}
            onBusquedaClienteChange={setBusquedaCliente}
            onSelectCliente={(cliente) => {
              setClienteSeleccionado(cliente);
              setShowModalCliente(false);
            }}
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
      )}

      <TPVVariantModal
        show={!!selectedProductoVariante}
        producto={selectedProductoVariante}
        varianteSeleccionada={selectedVariante}
        cantidadSeleccionada={cantidadSeleccionada}
        onVarianteChange={setSelectedVariante}
        onCantidadChange={setCantidadSeleccionada}
        onCancel={handleCancelVariantSelection}
        onConfirm={handleConfirmVariantAdd}
      />

      {(showModalCliente || showModalPago || selectedProductoVariante) && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default TPVBase;
