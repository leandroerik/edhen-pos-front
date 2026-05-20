import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const METODOS_INICIALES = [
  { id: 'efectivo',      nombre: 'Efectivo',               icono: 'fa-money-bill-wave', activo: true,  comision: 0 },
  { id: 'debito',        nombre: 'Débito (Visa / Master)',  icono: 'fa-credit-card',     activo: true,  comision: 0 },
  { id: 'credito',       nombre: 'Crédito (Visa / Master)', icono: 'fa-credit-card',     activo: true,  comision: 3 },
  { id: 'transferencia', nombre: 'Transferencia / CVU',     icono: 'fa-university',      activo: true,  comision: 0 },
  { id: 'mercadopago',   nombre: 'Mercado Pago / QR',       icono: 'fa-qrcode',          activo: false, comision: 5.99 },
  { id: 'cuentadni',    nombre: 'Cuenta DNI',              icono: 'fa-mobile-alt',      activo: false, comision: 0 },
];

const PagosConfig = () => {
  const [metodos, setMetodos] = useState(METODOS_INICIALES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pagosConfig');
    if (saved) setMetodos(JSON.parse(saved));
  }, []);

  const toggleActivo = (id) => {
    setMetodos(prev => prev.map(m => m.id === id ? { ...m, activo: !m.activo } : m));
  };

  const updateComision = (id, value) => {
    setMetodos(prev => prev.map(m => m.id === id ? { ...m, comision: parseFloat(value) || 0 } : m));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('pagosConfig', JSON.stringify(metodos));
      toast.success('Métodos de pago guardados correctamente');
      setSaving(false);
    }, 400);
  };

  const activos = metodos.filter(m => m.activo).length;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: '#d1e7dd' }}>
          <i className="fa fa-credit-card text-success" />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Métodos de Pago</h4>
          <small className="text-muted">{activos} de {metodos.length} métodos activos</small>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header py-3">
          <h6 className="mb-0 fw-bold"><i className="fa fa-list me-2 text-muted" />Medios de pago habilitados</h6>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 20 }}>Método</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 160 }}>Comisión %</th>
                <th className="text-center" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', width: 120 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {metodos.map(m => (
                <tr key={m.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 36, height: 36, backgroundColor: m.activo ? '#cfe2ff' : '#f8f9fa' }}>
                        <i className={`fa ${m.icono} ${m.activo ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.85rem' }} />
                      </div>
                      <span className={`fw-medium ${!m.activo ? 'text-muted' : ''}`}>{m.nombre}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="input-group input-group-sm" style={{ maxWidth: 110, margin: '0 auto' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        value={m.comision}
                        onChange={(e) => updateComision(m.id, e.target.value)}
                        min="0" max="100" step="0.01"
                        disabled={!m.activo}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="form-check form-switch d-flex justify-content-center mb-0">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={m.activo}
                        onChange={() => toggleActivo(m.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default PagosConfig;
