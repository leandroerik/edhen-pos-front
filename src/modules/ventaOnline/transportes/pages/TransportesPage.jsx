import React, { useState, useMemo } from 'react';
import { useTransportes } from '../hooks/useTransportes';
import TransporteForm from '../components/TransporteForm';

/**
 * Página principal de gestión de transportistas
 * Catálogo ABM con formulario modal
 */
const TransportesPage = () => {
  const {
    transportes,
    loading,
    searchTerm,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    handleSearch,
    clearSearch,
    isEmpty,
    totalCount,
    activeCount,
    inactiveCount
  } = useTransportes();

  const [showForm, setShowForm] = useState(false);
  const [editingTransporte, setEditingTransporte] = useState(null);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtrar y ordenar transportistas
  const filteredAndSortedTransportes = useMemo(() => {
    let filtered = transportes;

    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transporte =>
        transporte.nombre.toLowerCase().includes(searchLower) ||
        transporte.descripcion.toLowerCase().includes(searchLower) ||
        transporte.servicio.toLowerCase().includes(searchLower) ||
        (transporte.campos || []).some(c => c.label.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar filtro de estado
    if (statusFilter === 'activos') {
      filtered = filtered.filter(t => t.activo);
    } else if (statusFilter === 'inactivos') {
      filtered = filtered.filter(t => !t.activo);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'nombre':
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
          break;
        case 'servicio':
          aValue = (a.servicio || '').toLowerCase();
          bValue = (b.servicio || '').toLowerCase();
          break;
        case 'activo':
          aValue = a.activo ? 1 : 0;
          bValue = b.activo ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transportes, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return 'fa-sort';
    return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

  const openNewTransportista = () => {
    setEditingTransporte(null);
    setShowForm(true);
  };

  const openEditTransportista = (transporte) => {
    setEditingTransporte(transporte);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingTransporte) {
        await handleUpdate(editingTransporte.id, formData);
      } else {
        await handleCreate(formData);
      }
      setShowForm(false);
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDuplicate = async (transporte) => {
    const duplicated = {
      ...transporte,
      nombre: `${transporte.nombre} (copia)`,
      id: undefined
    };
    delete duplicated.id;
    try {
      await handleCreate(duplicated);
    } catch (error) {
      console.error('Error duplicating transporte:', error);
    }
  };

  const handleExportCSV = () => {
    // Función eliminada
  };

  const STAT_CFG = [
    { label: 'Total',    val: totalCount,   color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-truck' },
    { label: 'Activos',  val: activeCount,  color: '#198754', bg: '#d1e7dd', icon: 'fa-circle-check' },
    { label: 'Inactivos',val: inactiveCount,color: '#6c757d', bg: '#e9ecef', icon: 'fa-circle-xmark' },
    { label: 'Actividad',val: `${totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%`, color: '#6f42c1', bg: '#e8d5ff', icon: 'fa-chart-pie' },
  ];

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 fw-bold">
            <i className="fa fa-truck me-2 text-primary" />Transportistas
          </h1>
          <p className="text-muted small mb-0 mt-1">
            Catálogo de transportistas con sus campos de envío dinámicos
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNewTransportista}>
          <i className="fa fa-plus me-2" />Nuevo transportista
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {STAT_CFG.map(({ label, val, color, bg, icon }) => (
          <div key={label} className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 44, height: 44, backgroundColor: bg, color }}>
                  <i className={`fa ${icon}`} />
                </div>
                <div>
                  <div className="text-muted small mb-0">{label}</div>
                  <div className="fw-bold fs-5" style={{ color }}>{val}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card border shadow-sm mb-3">
        <div className="card-body p-3">
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div className="input-group input-group-sm" style={{ maxWidth: 320 }}>
              <span className="input-group-text bg-white"><i className="fa fa-search text-muted" /></span>
              <input type="text" className="form-control" placeholder="Nombre, servicio, campo..."
                value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
              {searchTerm && (
                <button className="btn btn-outline-secondary" onClick={clearSearch}>
                  <i className="fa fa-xmark" />
                </button>
              )}
            </div>
            <div className="btn-group btn-group-sm">
              {[['todos','Todos'],['activos','Activos'],['inactivos','Inactivos']].map(([val, lbl]) => (
                <button key={val}
                  className={`btn ${statusFilter === val ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter(val)}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card border shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="table-light border-bottom">
                <th className="ps-3 text-muted fw-semibold small" style={{ cursor:'pointer' }}
                  onClick={() => handleSort('nombre')}>
                  Transportista <i className={`fa ${getSortIcon('nombre')} ms-1`} />
                </th>
                <th className="text-muted fw-semibold small" style={{ width:'16%', cursor:'pointer' }}
                  onClick={() => handleSort('servicio')}>
                  Servicio <i className={`fa ${getSortIcon('servicio')} ms-1`} />
                </th>
                <th className="text-muted fw-semibold small text-center" style={{ width:'10%' }}>Campos</th>
                <th className="text-muted fw-semibold small" style={{ width:'10%', cursor:'pointer' }}
                  onClick={() => handleSort('activo')}>
                  Estado <i className={`fa ${getSortIcon('activo')} ms-1`} />
                </th>
                <th className="text-muted fw-semibold small pe-3 text-end" style={{ width:'13%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((__, j) => (
                    <td key={j}><div className="placeholder-glow"><span className="placeholder col-8 rounded" /></div></td>
                  ))}</tr>
                ))
              ) : filteredAndSortedTransportes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <i className="fa fa-truck fa-2x d-block mb-2 opacity-25" />
                    No hay transportistas registrados
                  </td>
                </tr>
              ) : (
                filteredAndSortedTransportes.map((t) => {
                  const numCampos = (t.campos || []).length;
                  return (
                    <tr key={t.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 34, height: 34, backgroundColor: '#cfe2ff', color: '#0d6efd' }}>
                            <i className="fa fa-truck" style={{ fontSize: '0.8rem' }} />
                          </div>
                          <div>
                            <div className="fw-semibold small">{t.nombre}</div>
                            {t.descripcion && <div className="text-muted" style={{ fontSize:'0.72rem' }}>{t.descripcion}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="small text-muted">{t.servicio || '—'}</td>
                      <td className="text-center">
                        <span className="badge rounded-pill bg-light text-secondary border">
                          {numCampos} {numCampos === 1 ? 'campo' : 'campos'}
                        </span>
                      </td>
                      <td>
                        <button type="button"
                          className="btn btn-sm rounded-pill fw-semibold"
                          style={t.activo
                            ? { backgroundColor:'#d1e7dd', color:'#198754', border:'none', fontSize:'0.75rem' }
                            : { backgroundColor:'#e9ecef', color:'#6c757d', border:'none', fontSize:'0.75rem' }}
                          onClick={() => handleToggleActive(t.id)}>
                          {t.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-end gap-1">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDuplicate(t)} title="Duplicar">
                            <i className="fa fa-clone" />
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEditTransportista(t)} title="Editar">
                            <i className="fa fa-pen" />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)} title="Eliminar">
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={handleFormCancel}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="fa fa-truck me-2 text-primary" />
                  {editingTransporte ? 'Editar transportista' : 'Nuevo transportista'}
                </h5>
                <button type="button" className="btn-close" onClick={handleFormCancel} />
              </div>
              <div className="modal-body">
                <TransporteForm
                  transporte={editingTransporte}
                  onSave={handleSave}
                  onCancel={handleFormCancel}
                  isEditing={!!editingTransporte}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportesPage;
