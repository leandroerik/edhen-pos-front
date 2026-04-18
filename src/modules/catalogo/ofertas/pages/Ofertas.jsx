import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockProductoService } from '../../../services/mocks';
import { formatCurrency } from '../../../shared/components/TPV/TPVUtils';

const Ofertas = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockProductoService.listar()
      .then((res) => {
        setProductos((res.data || []).filter((producto) => producto.activo && producto.oferta));
      })
      .catch((err) => {
        console.error('Error al cargar ofertas:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Ofertas</h1>
          <p className="text-muted mb-0">Productos en promoción o liquidación.</p>
        </div>
        <Link to="/ventas/tienda?categoria=Ofertas" className="btn btn-primary">
          <i className="fa fa-cash-register me-2"></i>Vender en TPV
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">Cargando ofertas...</div>
          ) : productos.length === 0 ? (
            <div className="text-center py-5">No hay ofertas activas en este momento.</div>
          ) : (
            <div className="row g-3">
              {productos.map((producto) => (
                <div key={producto.id} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <div className="mb-3">
                        <span className="badge bg-warning text-dark">Oferta</span>
                      </div>
                      <h6 className="card-title">{producto.nombre}</h6>
                      <p className="mb-1 text-muted">SKU: {producto.sku}</p>
                      <p className="mb-1">
                        <span className="text-decoration-line-through text-muted me-2">
                          {formatCurrency(producto.precioVenta)}
                        </span>
                        <span className="fw-semibold text-success">
                          {formatCurrency(producto.precioOferta)}
                        </span>
                      </p>
                      <p className="small text-muted mb-3">
                        {producto.tieneVariantes
                          ? `Stock variantes: ${producto.variantes.reduce((sum, v) => sum + (v.stock || 0), 0)}`
                          : `Stock: ${producto.stock}`}
                      </p>
                      <div className="mt-auto">
                        <span className="badge bg-info">Categoría: {producto.categoria}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ofertas;
