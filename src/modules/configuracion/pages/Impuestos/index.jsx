import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../../services/adminService';

const ImpuestosConfig = () => {
  const [impuestos, setImpuestos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nuevoImpuesto, setNuevoImpuesto] = useState({
    nombre: '',
    tasa: 0,
    activo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [impuestosData, categoriasData] = await Promise.all([
        adminService.getImpuestos(),
        adminService.getCategorias()
      ]);
      setImpuestos(impuestosData || []);
      setCategorias(categoriasData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoImpuestoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoImpuesto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const agregarImpuesto = async () => {
    if (!nuevoImpuesto.nombre.trim()) {
      toast.error('El nombre del impuesto es obligatorio');
      return;
    }

    if (nuevoImpuesto.tasa < 0 || nuevoImpuesto.tasa > 100) {
      toast.error('La tasa debe estar entre 0 y 100');
      return;
    }

    try {
      await adminService.createImpuesto(nuevoImpuesto);
      toast.success('Impuesto creado correctamente');
      setNuevoImpuesto({ nombre: '', tasa: 0, activo: true });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al crear el impuesto');
    }
  };

  const actualizarImpuesto = async (id, updates) => {
    try {
      await adminService.updateImpuesto(id, updates);
      toast.success('Impuesto actualizado correctamente');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el impuesto');
    }
  };

  const eliminarImpuesto = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este impuesto?')) {
      return;
    }

    try {
      await adminService.deleteImpuesto(id);
      toast.success('Impuesto eliminado correctamente');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al eliminar el impuesto');
    }
  };

  const asignarImpuestoCategoria = async (categoriaId, impuestoId) => {
    try {
      await adminService.asignarImpuestoCategoria(categoriaId, impuestoId);
      toast.success('Impuesto asignado a la categoría');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Error al asignar el impuesto');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: '#e2d9f3' }}>
          <i className="fa fa-calculator text-purple" style={{ color: '#6f42c1' }} />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Impuestos e IVA</h4>
          <small className="text-muted">Tasas de alícuotas y asignación por categoría de producto</small>
        </div>
      </div>

      <div className="row">
        {/* Lista de Impuestos */}
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-percentage me-2 text-muted"></i>
                Alícuotas de IVA
              </h6>
              <span className="badge bg-primary">{impuestos.length}</span>
            </div>
            <div className="card-body">
              {/* Agregar nuevo impuesto */}
              <div className="border rounded p-3 mb-3">
                <h6 className="fw-bold mb-3">Agregar alícuota</h6>
                <div className="row g-2">
                  <div className="col-5">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nombre (ej: IVA 21%)"
                      name="nombre"
                      value={nuevoImpuesto.nombre}
                      onChange={handleNuevoImpuestoChange}
                    />
                  </div>
                  <div className="col-3">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Tasa %"
                      name="tasa"
                      value={nuevoImpuesto.tasa}
                      onChange={handleNuevoImpuestoChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div className="col-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="activo"
                        checked={nuevoImpuesto.activo}
                        onChange={handleNuevoImpuestoChange}
                      />
                      <label className="form-check-label small">Activo</label>
                    </div>
                  </div>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm w-100"
                      onClick={agregarImpuesto}
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de impuestos existentes */}
              <div className="list-group">
                {impuestos.map(impuesto => (
                  <div key={impuesto.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{impuesto.nombre}</strong>
                      <span className="badge bg-secondary ms-2">{impuesto.tasa}%</span>
                      {!impuesto.activo && (
                        <span className="badge bg-warning ms-1">Inactivo</span>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm me-1"
                        onClick={() => actualizarImpuesto(impuesto.id, { activo: !impuesto.activo })}
                        title={impuesto.activo ? 'Desactivar' : 'Activar'}
                      >
                        <i className={`fa ${impuesto.activo ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => eliminarImpuesto(impuesto.id)}
                        title="Eliminar"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {impuestos.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <i className="fa fa-percentage fa-2x mb-2"></i>
                    <p>No hay impuestos configurados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Asignación por Categorías */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header py-3">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-tags me-2 text-muted"></i>
                Asignación por Categoría
              </h6>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Impuesto Actual</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(categoria => (
                      <tr key={categoria.id}>
                        <td>
                          <strong>{categoria.nombre}</strong>
                        </td>
                        <td>
                          {categoria.impuesto ? (
                            <span className="badge bg-success">
                              {categoria.impuesto.nombre} ({categoria.impuesto.tasa}%)
                            </span>
                          ) : (
                            <span className="text-muted">Sin asignar</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            onChange={(e) => {
                              if (e.target.value) {
                                asignarImpuestoCategoria(categoria.id, e.target.value);
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">Cambiar...</option>
                            {impuestos.filter(imp => imp.activo).map(impuesto => (
                              <option key={impuesto.id} value={impuesto.id}>
                                {impuesto.nombre} ({impuesto.tasa}%)
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {categorias.length === 0 && (
                <div className="text-center text-muted py-4">
                  <i className="fa fa-tags fa-2x mb-2"></i>
                  <p>No hay categorías disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpuestosConfig;