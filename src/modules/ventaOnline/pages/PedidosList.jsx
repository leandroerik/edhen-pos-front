import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from './PedidosList.module.css';

/**
 * Página de Listado de Pedidos Online
 * @component
 */
const PedidosList = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const ESTADOS = {
    nuevo: { label: 'Nuevo', badge: 'bg-info' },
    confirmado: { label: 'Confirmado', badge: 'bg-primary' },
    preparando: { label: 'Preparando', badge: 'bg-warning' },
    listo: { label: 'Listo', badge: 'bg-info' },
    enviado: { label: 'Enviado', badge: 'bg-success' },
    entregado: { label: 'Entregado', badge: 'bg-success' },
    cancelado: { label: 'Cancelado', badge: 'bg-danger' }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    setLoading(true);
    try {
      setPedidos([
        { 
          id: 1, 
          numeroPedido: 'P-001', 
          fecha: '2026-04-08', 
          cliente: 'Cliente Online 1', 
          total: 299.99,
          estado: 'confirmado',
          email: 'cliente1@example.com'
        },
        { 
          id: 2, 
          numeroPedido: 'P-002', 
          fecha: '2026-04-08', 
          cliente: 'Cliente Online 2', 
          total: 150.00,
          estado: 'preparando',
          email: 'cliente2@example.com'
        },
        { 
          id: 3, 
          numeroPedido: 'P-003', 
          fecha: '2026-04-07', 
          cliente: 'Cliente Online 3', 
          total: 450.50,
          estado: 'enviado',
          email: 'cliente3@example.com'
        },
        { 
          id: 4, 
          numeroPedido: 'P-004', 
          fecha: '2026-04-06', 
          cliente: 'Cliente Online 4', 
          total: 200.00,
          estado: 'entregado',
          email: 'cliente4@example.com'
        }
      ]);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(p => 
    p.numeroPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRastrear = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    toast.info(`Rastreando pedido ${pedido?.numeroPedido}...`);
  };

  const handleCambiarEstado = (pedidoId, nuevoEstado) => {
    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p)
    );
    toast.success('Estado actualizado');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className="h4 mb-0">
            <i className="fa fa-box me-2"></i>
            Listado de Pedidos
          </h2>
          <p className="text-muted small mb-0">Gestión de pedidos online</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={loadPedidos}
          disabled={loading}
        >
          <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-sync'} me-2`}></i>
          Actualizar
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fa fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por número de pedido, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="alert alert-info mb-0">
              <i className="fa fa-info-circle me-2"></i>
              No hay pedidos para mostrar
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id}>
                      <td><strong>{pedido.numeroPedido}</strong></td>
                      <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.email}</td>
                      <td className="fw-semibold">${pedido.total.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${ESTADOS[pedido.estado]?.badge || 'bg-secondary'}`}>
                          {ESTADOS[pedido.estado]?.label || pedido.estado}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleRastrear(pedido.id)}
                            title="Rastrear"
                          >
                            <i className="fa fa-map-marker"></i>
                          </button>
                          <button 
                            className="btn btn-outline-info"
                            title="Editar estado"
                            data-bs-toggle="dropdown"
                          >
                            <i className="fa fa-pencil"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosList;
