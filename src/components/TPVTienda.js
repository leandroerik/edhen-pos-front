import React, { useState, useEffect } from 'react';
import { productoService } from '../services/api';

const TPVTienda = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    calcularTotal();
  }, [carrito]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productoService.listar();
      setProductos(response.data.filter(p => p.activo));
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    const nuevoTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setTotal(nuevoTotal);
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      }]);
    }
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      setCarrito(carrito.map(item =>
        item.id === id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const procesarVenta = () => {
    if (carrito.length === 0) {
      alert('Agregue productos al carrito antes de procesar la venta');
      return;
    }

    // Aquí iría la lógica para procesar la venta
    alert(`Venta procesada por $${total.toFixed(2)}`);
    setCarrito([]);
    setClienteSeleccionado(null);
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.modelo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando TPV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">🛒 TPV - Ventas en Tienda</h1>
          <p className="text-muted mb-0">Sistema de punto de venta</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">
            <i className="fa fa-history me-2"></i>
            Historial
          </button>
          <button className="btn btn-outline-info">
            <i className="fa fa-cog me-2"></i>
            Configuración
          </button>
        </div>
      </div>

      <div className="row">
        {/* Panel de productos */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Productos Disponibles</h5>
                <div className="input-group" style={{width: '300px'}}>
                  <span className="input-group-text">
                    <i className="fa fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar productos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {productosFiltrados.map((producto) => (
                  <div key={producto.id} className="col-xl-3 col-lg-4 col-md-6">
                    <div className="card h-100 product-card-tpv">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                               style={{width: '50px', height: '50px', fontSize: '18px'}}>
                            {producto.nombre.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <h6 className="card-title mb-1">{producto.nombre}</h6>
                        <p className="text-success fw-bold mb-2">${producto.precio?.toFixed(2)}</p>
                        <small className="text-muted d-block mb-2">
                          {producto.categoria || 'Sin categoría'}
                        </small>
                        <button
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => agregarAlCarrito(producto)}
                        >
                          <i className="fa fa-plus me-1"></i>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {productosFiltrados.length === 0 && (
                <div className="text-center py-5">
                  <div className="text-muted mb-3">
                    <i className="fa fa-search" style={{fontSize: '3rem'}}></i>
                  </div>
                  <h5>No se encontraron productos</h5>
                  <p className="text-muted">Intenta con otros términos de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel del carrito */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{top: '20px'}}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fa fa-shopping-cart me-2"></i>
                Carrito de Compras
              </h5>
            </div>
            <div className="card-body">
              {/* Cliente */}
              <div className="mb-3">
                <label className="form-label">Cliente</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Seleccionar cliente..."
                    value={clienteSeleccionado?.nombre || ''}
                    readOnly
                  />
                  <button className="btn btn-outline-secondary">
                    <i className="fa fa-user"></i>
                  </button>
                </div>
              </div>

              {/* Items del carrito */}
              <div className="mb-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                {carrito.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fa fa-shopping-cart fa-2x mb-2"></i>
                    <p>Carrito vacío</p>
                  </div>
                ) : (
                  carrito.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <div className="flex-grow-1">
                        <div className="fw-bold small">{item.nombre}</div>
                        <div className="text-muted small">${item.precio?.toFixed(2)} c/u</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        >
                          <i className="fa fa-minus"></i>
                        </button>
                        <span className="fw-bold">{item.cantidad}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => eliminarDelCarrito(item.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Total:</h4>
                  <h4 className="mb-0 text-success">${total.toFixed(2)}</h4>
                </div>

                {/* Acciones */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={procesarVenta}
                    disabled={carrito.length === 0}
                  >
                    <i className="fa fa-credit-card me-2"></i>
                    Procesar Venta
                  </button>
                  <button
                    className="btn btn-outline-warning"
                    onClick={vaciarCarrito}
                    disabled={carrito.length === 0}
                  >
                    <i className="fa fa-trash me-2"></i>
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVTienda;