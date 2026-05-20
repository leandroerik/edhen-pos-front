import React, { useState, useEffect, useRef } from 'react';
import { getTransportes } from '../../transportes/services/transportesService';

const INPUT_TYPE_MAP = {
  text: 'text', tel: 'tel', email: 'email', number: 'number', select: 'select',
};

const CLIENT_FIELD_MAP = {
  nombreCompleto: (c) => [c.nombre, c.apellido].filter(Boolean).join(' '),
  nombre:         (c) => c.nombre || '',
  apellido:       (c) => c.apellido || '',
  dni:            (c) => c.dni || '',
  celular:        (c) => c.telefono || '',
  telefono:       (c) => c.telefono || '',
  email:          (c) => c.email || '',
  calle:          (c) => c.direccion || '',
  direccion:      (c) => c.direccion || '',
  localidad:      (c) => c.localidad || c.ciudad || '',
  ciudad:         (c) => c.ciudad || c.localidad || '',
  provincia:      (c) => c.provincia || '',
  codigoPostal:   (c) => c.codigoPostal || '',
};

const TPVOnlineShippingForm = ({ show, datosEnvio, setDatosEnvio, onConfirm, onCancel, clientes = [] }) => {
  const [transportes, setTransportes]           = useState([]);
  const [transporteId, setTransporteId]         = useState('');
  const [transporteActual, setTransporteActual] = useState(null);
  const [valores, setValores]                   = useState({});
  const [errors, setErrors]                     = useState({});
  const [clienteSearch, setClienteSearch]       = useState('');
  const [showClientDrop, setShowClientDrop]     = useState(false);
  const clienteRef                              = useRef(null);

  useEffect(() => {
    getTransportes()
      .then((data) => setTransportes((data || []).filter((t) => t.activo)))
      .catch(() => {});
  }, []);

  // Pre-populate transporteId from existing datosEnvio when modal opens / resets when closed
  useEffect(() => {
    if (show && datosEnvio?._transporteId) {
      setTransporteId(String(datosEnvio._transporteId));
    } else if (!show) {
      setTransporteId('');
      setClienteSearch('');
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // When transporteId changes, load campos and pre-fill from datosEnvio
  useEffect(() => {
    if (!transporteId) { setTransporteActual(null); setValores({}); return; }
    const t = transportes.find((t) => String(t.id) === String(transporteId));
    setTransporteActual(t || null);
    const init = {};
    (t?.campos || []).forEach((c) => { init[c.key] = datosEnvio?.[c.key] || ''; });
    setValores(init);
    setErrors({});
  }, [transporteId, transportes]);

  // Click-outside for client dropdown
  useEffect(() => {
    const handler = (e) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) {
        setShowClientDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (key, value) => {
    setValores((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleSelectCliente = (cliente) => {
    const newValores = { ...valores };
    (transporteActual?.campos || []).forEach((c) => {
      const getter = CLIENT_FIELD_MAP[c.key];
      if (getter) {
        const val = getter(cliente);
        if (val) newValores[c.key] = val;
      }
    });
    setValores(newValores);
    setClienteSearch(cliente.nombre);
    setShowClientDrop(false);
    setErrors({});
  };

  const handleConfirm = () => {
    if (!transporteActual) return;
    const newErrors = {};
    (transporteActual.campos || []).forEach((c) => {
      if (c.required && !String(valores[c.key] || '').trim()) newErrors[c.key] = true;
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const newDatosEnvio = {
      ...valores,
      _transporteId:       transporteActual.id,
      _transporteNombre:   transporteActual.nombre,
      _transporteServicio: transporteActual.servicio,
    };
    setDatosEnvio(newDatosEnvio);
    onConfirm(newDatosEnvio);
  };

  if (!show) return null;

  const clientesFiltrados = clienteSearch
    ? clientes.filter((c) =>
        c.nombre?.toLowerCase().includes(clienteSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(clienteSearch.toLowerCase())
      )
    : clientes.slice(0, 8);

  const campos      = transporteActual?.campos || [];
  const requeridos  = campos.filter((c) => c.required).length;
  const completados = campos.filter((c) => c.required && String(valores[c.key] || '').trim()).length;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onCancel}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          <div className="modal-header border-bottom" style={{ backgroundColor: '#0d6efd' }}>
            <h5 className="modal-title fw-bold" style={{ color: '#fff' }}>
              <i className="fa fa-truck me-2" />Datos de Envío
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel} />
          </div>

          <div className="modal-body">

            {/* Traer datos de cliente registrado */}
            {clientes.length > 0 && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                <div className="small fw-semibold text-muted mb-2">
                  <i className="fa fa-user-check me-1 text-primary" />Traer datos de cliente registrado
                </div>
                <div className="position-relative" ref={clienteRef}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Buscar cliente por nombre o email..."
                    value={clienteSearch}
                    onChange={(e) => { setClienteSearch(e.target.value); setShowClientDrop(true); }}
                    onFocus={() => setShowClientDrop(true)}
                  />
                  {showClientDrop && clientesFiltrados.length > 0 && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm"
                      style={{ top: '100%', zIndex: 1050, maxHeight: 200, overflowY: 'auto' }}>
                      {clientesFiltrados.map((c) => (
                        <button key={c.id} type="button"
                          className="d-block w-100 text-start px-3 py-2 border-0 bg-transparent"
                          style={{ fontSize: '0.85rem' }}
                          onMouseDown={() => handleSelectCliente(c)}>
                          <div className="fw-semibold">{c.nombre}</div>
                          {c.email && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{c.email}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!transporteActual && (
                  <div className="text-muted mt-1" style={{ fontSize: '0.78rem' }}>
                    <i className="fa fa-circle-info me-1" />Seleccioná un transportista primero para que los campos se completen automáticamente
                  </div>
                )}
              </div>
            )}

            {/* Selector de transportista */}
            <div className="mb-4">
              <label className="form-label fw-semibold small text-muted">
                <i className="fa fa-truck me-1" />Transportista
              </label>
              <select className="form-select" value={transporteId}
                onChange={(e) => setTransporteId(e.target.value)}>
                <option value="">— Seleccionar transportista —</option>
                {transportes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}{t.servicio ? ` · ${t.servicio}` : ''}
                  </option>
                ))}
              </select>
              {transporteActual?.descripcion && (
                <div className="form-text text-muted mt-1">
                  <i className="fa fa-circle-info me-1" />{transporteActual.descripcion}
                </div>
              )}
            </div>

            {/* Campos dinámicos */}
            {transporteActual && campos.length > 0 && (
              <>
                {requeridos > 0 && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">Campos requeridos</span>
                      <span className="small fw-semibold">{completados}/{requeridos}</span>
                    </div>
                    <div className="progress" style={{ height: 4 }}>
                      <div className="progress-bar bg-primary"
                        style={{ width: `${requeridos ? (completados / requeridos) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}

                <div className="row g-3">
                  {campos.map((campo) => {
                    const err = errors[campo.key];
                    const val = valores[campo.key] ?? '';
                    const inputType = INPUT_TYPE_MAP[campo.type] || 'text';

                    return (
                      <div key={campo.key}
                        className={campo.type === 'text' && campo.key.includes('direccion') ? 'col-12' : 'col-md-6'}>
                        <label className="form-label small fw-semibold">
                          {campo.label}
                          {campo.required
                            ? <span className="text-danger ms-1">*</span>
                            : <span className="text-muted ms-1 fw-normal">(opc.)</span>}
                        </label>

                        {campo.type === 'select' ? (
                          <select
                            className={`form-select form-select-sm ${err ? 'is-invalid' : ''}`}
                            value={val}
                            onChange={(e) => handleChange(campo.key, e.target.value)}>
                            <option value="">— Seleccionar —</option>
                            {(campo.opciones || []).map((op) => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={inputType}
                            className={`form-control form-control-sm ${err ? 'is-invalid' : ''}`}
                            placeholder={campo.placeholder || ''}
                            value={val}
                            onChange={(e) => handleChange(campo.key, e.target.value)}
                          />
                        )}

                        {err && <div className="invalid-feedback">Campo requerido</div>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!transporteActual && (
              <div className="text-center py-4 text-muted">
                <i className="fa fa-truck fa-2x d-block mb-2 opacity-25" />
                Seleccioná un transportista para ver los campos requeridos
              </div>
            )}
          </div>

          <div className="modal-footer border-top">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!transporteActual}>
              <i className="fa fa-check me-2" />Confirmar datos de envío
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TPVOnlineShippingForm;
