import React, { useState, useEffect } from 'react';
import { productoService } from '../services/api';

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productoService.listar();
      setProductos(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="fa fa-box me-2"></i>
          Productos
        </h1>
        <button className="btn btn-success">
          <i className="fa fa-plus me-2"></i>
          Nuevo Producto
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Catálogo de Productos</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Modelo</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto.id}>
                    <td>#{producto.id}</td>
                    <td className="fw-bold">{producto.nombre}</td>
                    <td>{producto.modelo}</td>
                    <td>${producto.precio?.toFixed(2)}</td>
                    <td>{producto.categoria}</td>
                    <td>
                      <span className={`badge bg-${producto.stock > 5 ? 'success' : 'warning'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${producto.activo ? 'success' : 'danger'}`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary">
                        <i className="fa fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-danger ms-1">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
