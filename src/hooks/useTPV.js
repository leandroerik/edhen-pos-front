import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { mockProductoService, mockClienteService } from '../services/mocks';
import { categoriaService } from '../services/api';
import { loadVentas, saveVentas, buildVenta, generarReciboPDF } from '../components/TPV/TPVUtils';

export const CLIENTE_MINORISTA = { id: 0, nombre: 'Cliente Minorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Minorista' };
export const CLIENTE_MAYORISTA = { id: -1, nombre: 'Cliente Mayorista', email: '', telefono: '', ciudad: 'Local', tipo: 'Mayorista' };

export const useTPV = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(CLIENTE_MINORISTA);
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
  const [searchParams] = useSearchParams();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(() => searchParams.get('categoria') || 'Todas');
  const [categoriasDisponibles, setCategoriasDisponibles] = useState(['Todas']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const debounceTimeoutRef = useRef(null);
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [ordenamiento, setOrdenamiento] = useState('nombre');

  useEffect(() => {
    // Cargar productos desde API mockeada
    mockProductoService.listar()
      .then(res => {
        setProductos(res.data || []);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        toast.error('No se pudieron cargar los productos');
      });

    // Cargar clientes
    mockClienteService.listar()
      .then(res => {
        setClientes(res.data || []);
      })
      .catch(err => {
        console.error('Error al cargar clientes:', err);
        toast.error('No se pudieron cargar los clientes');
      });

    // Cargar categorías
    categoriaService.listar()
      .then(res => {
        const categoriasActivas = (res.data || [])
          .filter(cat => cat.activo !== false)
          .map(cat => cat.nombre);
        setCategoriasDisponibles(['Todas', ...new Set(categoriasActivas)]);
      })
      .catch(err => {
        console.error('Error al cargar categorías:', err);
      });

    setVentasGuardadas(loadVentas());

    // Enfoque automático en input de escáner
    if (barcodeScannerRef.current) {
      barcodeScannerRef.current.focus();
    }
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 300);
  }, [busqueda]);

  // Actualizar categoría desde URL
  useEffect(() => {
    const categoriaQuery = searchParams.get('categoria');
    if (categoriaQuery && categoriasDisponibles.includes(categoriaQuery)) {
      setCategoriaSeleccionada(categoriaQuery);
    }
  }, [searchParams, categoriasDisponibles]);

  const categorias = useMemo(() => {
    return categoriasDisponibles.length > 1 ? categoriasDisponibles : ['Todas'];
  }, [categoriasDisponibles, productos]);

  const productosFiltrados = useMemo(() => {
    const categoriasActivas = categorias.filter((cat) => cat !== 'Todas');
    let filtrados = productos
      .filter((producto) => {
        if (categoriasActivas.length > 0 && !categoriasActivas.includes(producto.categoria)) {
          return false;
        }

        let matchCategoria = categoriaSeleccionada === 'Todas'
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

    // Ordenar
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
      cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busquedaCliente.toLowerCase())
    ),
    [clientes, busquedaCliente]
  );

  const subtotal = useMemo(
    () => carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0),
    [carrito]
  );

  const descuentoCalculado = useMemo(() => {
    if (tipoDescuento === 'porcentaje') {
      return (subtotal * descuento) / 100;
    }
    return Math.min(descuento, subtotal);
  }, [subtotal, descuento, tipoDescuento]);

  const total = subtotal - descuentoCalculado;
  const cambio = formaPago === 'efectivo' ? Math.max(0, montoPagado - total) : 0;

  const agregarAlCarrito = useCallback((producto, variante = null, cantidad = 1) => {
    setCarrito(prev => {
      const existente = prev.find(item =>
        item.id === producto.id && item.variante?.id === variante?.id
      );
      if (existente) {
        return prev.map(item =>
          item.id === producto.id && item.variante?.id === variante?.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, {
        ...producto,
        variante,
        cantidad,
        precioVenta: producto.oferta && producto.precioOferta ? producto.precioOferta : producto.precioVenta
      }];
    });
    toast.success(`${producto.nombre} agregado al carrito`);
  }, []);

  const removerDelCarrito = useCallback((index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarCantidadCarrito = useCallback((index, cantidad) => {
    if (cantidad <= 0) {
      removerDelCarrito(index);
      return;
    }
    setCarrito(prev => prev.map((item, i) =>
      i === index ? { ...item, cantidad } : item
    ));
  }, [removerDelCarrito]);

  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
  }, []);

  const handleConfirmarPago = useCallback(async (event) => {
    event.preventDefault();
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    if (montoPagado < total && formaPago === 'efectivo') {
      toast.error('El monto pagado es insuficiente');
      return;
    }

    const nuevaVenta = buildVenta(
      carrito,
      clienteSeleccionado,
      subtotal,
      descuentoCalculado,
      total,
      formaPago,
      montoPagado,
      cambio
    );

    try {
      // Actualizar stock
      for (const item of carrito) {
        const productoActualizado = { ...item };
        if (item.variante) {
          productoActualizado.variantes = item.variantes.map(v =>
            v.id === item.variante.id
              ? { ...v, stock: Math.max(0, (v.stock || 0) - item.cantidad) }
              : v
          );
          productoActualizado.stock = productoActualizado.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else {
          productoActualizado.stock = Math.max(0, (item.stock || 0) - item.cantidad);
        }
        await mockProductoService.actualizar(item.id, productoActualizado);
      }

      // Actualizar productos en estado
      setProductos(prev => prev.map(prod => {
        const itemCarrito = carrito.find(item => item.id === prod.id);
        if (itemCarrito) {
          const actualizado = { ...prod };
          if (itemCarrito.variante) {
            actualizado.variantes = prod.variantes.map(v =>
              v.id === itemCarrito.variante.id
                ? { ...v, stock: Math.max(0, (v.stock || 0) - itemCarrito.cantidad) }
                : v
            );
            actualizado.stock = actualizado.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            actualizado.stock = Math.max(0, (prod.stock || 0) - itemCarrito.cantidad);
          }
          return actualizado;
        }
        return prod;
      }));

      // Guardar venta
      const nuevasVentas = [nuevaVenta, ...ventasGuardadas];
      setVentasGuardadas(nuevasVentas);
      saveVentas(nuevasVentas);

      // Generar recibo
      generarReciboPDF(nuevaVenta);

      // Limpiar estado
      setCarrito([]);
      setClienteSeleccionado(CLIENTE_MINORISTA);
      setDescuento(0);
      setMontoPagado(0);
      setShowModalPago(false);

      toast.success('Venta realizada exitosamente');
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      toast.error('Error al procesar la venta');
    }
  }, [carrito, clienteSeleccionado, subtotal, descuentoCalculado, total, formaPago, cambio, ventasGuardadas, productos, montoPagado]);

  const handleBarcodeScan = useCallback(async (codigo) => {
    if (!codigo.trim()) return;

    try {
      const res = await mockProductoService.buscarPorCodigo(codigo.trim());
      if (res.data && res.data.length > 0) {
        const producto = res.data[0];
        agregarAlCarrito(producto);
        setCodigoEscaneado('');
      } else {
        toast.error('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar producto:', error);
      toast.error('Error al buscar producto');
    }
  }, [agregarAlCarrito]);

  return {
    // Estado
    productos,
    clientes,
    carrito,
    busqueda,
    clienteSeleccionado,
    descuento,
    tipoDescuento,
    formaPago,
    montoPagado,
    showModalPago,
    showModalCliente,
    busquedaCliente,
    ventasGuardadas,
    selectedProductoVariante,
    selectedVariante,
    cantidadSeleccionada,
    codigoEscaneado,
    barcodeScannerRef,
    categoriaSeleccionada,
    categoriasDisponibles,
    currentPage,
    busquedaDebounced,
    filtroStock,
    ordenamiento,
    // Computados
    categorias,
    productosFiltrados,
    totalPages,
    productosActuales,
    clientesFiltrados,
    subtotal,
    descuentoCalculado,
    total,
    cambio,
    // Acciones
    setBusqueda,
    setClienteSeleccionado,
    setDescuento,
    setTipoDescuento,
    setFormaPago,
    setMontoPagado,
    setShowModalPago,
    setShowModalCliente,
    setBusquedaCliente,
    setSelectedProductoVariante,
    setSelectedVariante,
    setCantidadSeleccionada,
    setCodigoEscaneado,
    setCategoriaSeleccionada,
    setCurrentPage,
    setFiltroStock,
    setOrdenamiento,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidadCarrito,
    vaciarCarrito,
    handleConfirmarPago,
    handleBarcodeScan
  };
};