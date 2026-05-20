import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const DEFAULTS = {
  alertasStock: {
    activo: true,
    umbralBajo: 5,
    umbralCritico: 1,
    notificarEmail: true,
    notificarDashboard: true
  },
  reposicionAutomatica: {
    activo: false,
    puntoReposicion: 10,
    cantidadReposicion: 20
  }
};

const InventarioConfig = () => {
  const [config, setConfig] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('inventarioConfig');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const handleAlertasChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      alertasStock: { ...prev.alertasStock, [name]: type === 'checkbox' ? checked : parseInt(value) || value }
    }));
  };

  const handleReposicionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      reposicionAutomatica: { ...prev.reposicionAutomatica, [name]: type === 'checkbox' ? checked : parseInt(value) || value }
    }));
  };

  const saveConfig = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('inventarioConfig', JSON.stringify(config));
      toast.success('Configuración de inventario guardada correctamente');
      setSaving(false);
    }, 400);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: '#fff3cd' }}>
          <i className="fa fa-boxes text-warning" />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Configuración de Inventario</h4>
          <small className="text-muted">Alertas de stock y reposición automática</small>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold"><i className="fa fa-exclamation-triangle me-2 text-muted" />Alertas de Stock</h6>
              <div className="form-check form-switch mb-0">
                <input type="checkbox" className="form-check-input" name="activo"
                  checked={config.alertasStock.activo} onChange={handleAlertasChange} />
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Stock bajo (unidades)</label>
                  <input type="number" className="form-control" name="umbralBajo"
                    value={config.alertasStock.umbralBajo} onChange={handleAlertasChange}
                    min="0" disabled={!config.alertasStock.activo} />
                  <small className="text-muted">Alerta cuando quede menos de este valor</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Stock crítico (unidades)</label>
                  <input type="number" className="form-control" name="umbralCritico"
                    value={config.alertasStock.umbralCritico} onChange={handleAlertasChange}
                    min="0" disabled={!config.alertasStock.activo} />
                  <small className="text-muted">Alerta roja cuando quede menos de este valor</small>
                </div>
              </div>
              <label className="form-label fw-semibold">Notificaciones</label>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" name="notificarEmail"
                    checked={config.alertasStock.notificarEmail} onChange={handleAlertasChange}
                    disabled={!config.alertasStock.activo} />
                  <label className="form-check-label">Email</label>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" name="notificarDashboard"
                    checked={config.alertasStock.notificarDashboard} onChange={handleAlertasChange}
                    disabled={!config.alertasStock.activo} />
                  <label className="form-check-label">Dashboard</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold"><i className="fa fa-sync me-2 text-muted" />Reposición Automática</h6>
              <div className="form-check form-switch mb-0">
                <input type="checkbox" className="form-check-input" name="activo"
                  checked={config.reposicionAutomatica.activo} onChange={handleReposicionChange} />
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Punto de reposición</label>
                  <input type="number" className="form-control" name="puntoReposicion"
                    value={config.reposicionAutomatica.puntoReposicion} onChange={handleReposicionChange}
                    min="0" disabled={!config.reposicionAutomatica.activo} />
                  <small className="text-muted">Unidades mínimas para activar reposición</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Cantidad a reponer</label>
                  <input type="number" className="form-control" name="cantidadReposicion"
                    value={config.reposicionAutomatica.cantidadReposicion} onChange={handleReposicionChange}
                    min="1" disabled={!config.reposicionAutomatica.activo} />
                  <small className="text-muted">Unidades a solicitar al proveedor</small>
                </div>
              </div>
              {!config.reposicionAutomatica.activo && (
                <p className="text-muted small mb-0">
                  <i className="fa fa-info-circle me-1" />
                  Activá esta opción para configurar la reposición automática cuando el stock baje.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-primary" onClick={saveConfig} disabled={saving}>
          <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`} />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};

export default InventarioConfig;
