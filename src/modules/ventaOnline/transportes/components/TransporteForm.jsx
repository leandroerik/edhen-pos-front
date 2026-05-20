import React, { useState, useEffect } from 'react';

const FIELD_TYPES = [
  { value: 'text',   label: 'Texto' },
  { value: 'tel',    label: 'Teléfono' },
  { value: 'email',  label: 'Email' },
  { value: 'number', label: 'Número' },
  { value: 'select', label: 'Lista de opciones' },
];

const PRESETS = {
  correoArgentino: {
    nombre: 'Correo Argentino',
    servicio: 'Estándar / Prioritario',
    descripcion: 'Servicio postal nacional con seguimiento y entrega puerta a puerta',
    campos: [
      { key: 'nombreCompleto', label: 'Nombre y Apellido', type: 'text',   required: true,  placeholder: 'Ej: Juan Pérez',     opciones: [] },
      { key: 'dni',            label: 'DNI',               type: 'text',   required: true,  placeholder: 'Ej: 30123456',       opciones: [] },
      { key: 'celular',        label: 'Celular',            type: 'tel',    required: true,  placeholder: '+54 9 11 1234 5678', opciones: [] },
      { key: 'email',          label: 'Email',              type: 'email',  required: false, placeholder: '',                   opciones: [] },
      { key: 'calle',          label: 'Calle',              type: 'text',   required: true,  placeholder: 'Av. Corrientes',     opciones: [] },
      { key: 'numero',         label: 'Número',             type: 'text',   required: true,  placeholder: '1234',               opciones: [] },
      { key: 'piso',           label: 'Piso / Depto',       type: 'text',   required: false, placeholder: '2B (opcional)',      opciones: [] },
      { key: 'localidad',      label: 'Localidad',          type: 'text',   required: true,  placeholder: '',                   opciones: [] },
      { key: 'provincia',      label: 'Provincia',          type: 'text',   required: true,  placeholder: '',                   opciones: [] },
      { key: 'codigoPostal',   label: 'Código Postal',      type: 'text',   required: true,  placeholder: 'Ej: 1043',           opciones: [] },
      { key: 'tipoEnvio',      label: 'Tipo de envío',      type: 'select', required: true,  placeholder: '',                   opciones: ['Carta certificada', 'Encomienda', 'Prioritario', 'Express'] },
    ],
  },
  andreani: {
    nombre: 'Andreani',
    servicio: 'Estándar / Express',
    descripcion: 'Logística nacional con seguimiento en tiempo real',
    campos: [
      { key: 'nombreCompleto', label: 'Nombre y Apellido', type: 'text',   required: true,  placeholder: '',       opciones: [] },
      { key: 'dni',            label: 'DNI',               type: 'text',   required: true,  placeholder: '',       opciones: [] },
      { key: 'celular',        label: 'Celular',            type: 'tel',    required: true,  placeholder: '+54 9 …',opciones: [] },
      { key: 'email',          label: 'Email',              type: 'email',  required: false, placeholder: '',       opciones: [] },
      { key: 'direccion',      label: 'Dirección',          type: 'text',   required: true,  placeholder: 'Calle, número, piso', opciones: [] },
      { key: 'localidad',      label: 'Localidad',          type: 'text',   required: true,  placeholder: '',       opciones: [] },
      { key: 'provincia',      label: 'Provincia',          type: 'text',   required: true,  placeholder: '',       opciones: [] },
      { key: 'codigoPostal',   label: 'Código Postal',      type: 'text',   required: true,  placeholder: '',       opciones: [] },
      { key: 'tipoServicio',   label: 'Tipo de servicio',   type: 'select', required: true,  placeholder: '',       opciones: ['Andreani Estándar', 'Andreani Express', 'Andreani a Sucursal'] },
      { key: 'pesoKg',         label: 'Peso aprox. (kg)',   type: 'number', required: false, placeholder: '',       opciones: [] },
    ],
  },
  oca: {
    nombre: 'OCA',
    servicio: 'E.PAK / OCA Express',
    descripcion: 'Envíos rápidos con retiro en sucursal opcional',
    campos: [
      { key: 'nombreCompleto', label: 'Nombre y Apellido',     type: 'text',   required: true,  placeholder: '',    opciones: [] },
      { key: 'dni',            label: 'DNI',                   type: 'text',   required: true,  placeholder: '',    opciones: [] },
      { key: 'celular',        label: 'Celular',               type: 'tel',    required: true,  placeholder: '',    opciones: [] },
      { key: 'email',          label: 'Email',                 type: 'email',  required: false, placeholder: '',    opciones: [] },
      { key: 'direccion',      label: 'Dirección completa',    type: 'text',   required: true,  placeholder: '',    opciones: [] },
      { key: 'localidad',      label: 'Localidad',             type: 'text',   required: true,  placeholder: '',    opciones: [] },
      { key: 'provincia',      label: 'Provincia',             type: 'text',   required: true,  placeholder: '',    opciones: [] },
      { key: 'codigoPostal',   label: 'Código Postal',         type: 'text',   required: true,  placeholder: '',    opciones: [] },
      { key: 'sucursalRetiro', label: 'Sucursal retiro (opc.)',type: 'text',   required: false, placeholder: 'Dejar vacío si entrega a domicilio', opciones: [] },
      { key: 'bultos',         label: 'Cantidad de bultos',    type: 'number', required: true,  placeholder: '1',   opciones: [] },
    ],
  },
  informal: {
    nombre: 'Transporte particular',
    servicio: 'Informal / Local',
    descripcion: 'Entrega con transportista propio o informal',
    campos: [
      { key: 'nombre',              label: 'Nombre',                   type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'apellido',            label: 'Apellido',                 type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'dni',                 label: 'DNI',                      type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'celular',             label: 'Celular',                  type: 'tel',   required: true,  placeholder: '+54 9 …', opciones: [] },
      { key: 'email',               label: 'Email',                    type: 'email', required: false, placeholder: '', opciones: [] },
      { key: 'codigoPostal',        label: 'Código Postal',            type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'provincia',           label: 'Provincia',                type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'localidad',           label: 'Localidad',                type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'direccion',           label: 'Dirección',                type: 'text',  required: true,  placeholder: '', opciones: [] },
      { key: 'nombreTransportista', label: 'Nombre del transportista', type: 'text',  required: true,  placeholder: 'Ej: Rodolfo', opciones: [] },
    ],
  },
};

const campoVacio = () => ({
  key: `campo_${Date.now()}`,
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
  opciones: [],
});

const labelToKey = (label) =>
  label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

const TransporteForm = ({ transporte, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', servicio: '', activo: true, campos: [campoVacio()],
  });
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    if (transporte) {
      setFormData({
        nombre:      transporte.nombre      || '',
        descripcion: transporte.descripcion || '',
        servicio:    transporte.servicio    || '',
        activo:      transporte.activo !== undefined ? transporte.activo : true,
        campos:      transporte.campos?.length ? transporte.campos.map((c) => ({ opciones: [], ...c })) : [campoVacio()],
      });
    } else {
      setFormData({ nombre: '', descripcion: '', servicio: '', activo: true, campos: [campoVacio()] });
    }
    setExpandedIdx(null);
  }, [transporte]);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    if (!p) return;
    setFormData((prev) => ({ ...prev, ...p }));
    setExpandedIdx(null);
  };

  const updateCampo = (idx, patch) => {
    setFormData((prev) => {
      const campos = [...prev.campos];
      campos[idx] = { ...campos[idx], ...patch };
      if (patch.label !== undefined && !isEditing) {
        campos[idx].key = labelToKey(patch.label) || campos[idx].key;
      }
      return { ...prev, campos };
    });
  };

  const addCampo = () => {
    setFormData((prev) => ({ ...prev, campos: [...prev.campos, campoVacio()] }));
    setExpandedIdx(formData.campos.length);
  };

  const removeCampo = (idx) => {
    setFormData((prev) => {
      const campos = prev.campos.filter((_, i) => i !== idx);
      return { ...prev, campos: campos.length ? campos : [campoVacio()] };
    });
    setExpandedIdx(null);
  };

  const moveCampo = (idx, dir) => {
    setFormData((prev) => {
      const campos = [...prev.campos];
      const target = idx + dir;
      if (target < 0 || target >= campos.length) return prev;
      [campos[idx], campos[target]] = [campos[target], campos[idx]];
      return { ...prev, campos };
    });
    setExpandedIdx(idx + dir);
  };

  const addOpcion = (idx) => {
    updateCampo(idx, { opciones: [...(formData.campos[idx].opciones || []), ''] });
  };

  const updateOpcion = (campoIdx, opIdx, val) => {
    const opciones = [...(formData.campos[campoIdx].opciones || [])];
    opciones[opIdx] = val;
    updateCampo(campoIdx, { opciones });
  };

  const removeOpcion = (campoIdx, opIdx) => {
    const opciones = (formData.campos[campoIdx].opciones || []).filter((_, i) => i !== opIdx);
    updateCampo(campoIdx, { opciones });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    const campos = formData.campos
      .filter((c) => c.label.trim())
      .map((c) => ({
        ...c,
        key: c.key || labelToKey(c.label),
        opciones: c.type === 'select' ? (c.opciones || []).filter(Boolean) : [],
      }));
    onSave({ ...formData, campos });
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Presets */}
      {!isEditing && (
        <div className="mb-4 p-3 rounded border bg-light">
          <div className="small fw-semibold text-muted mb-2">
            <i className="fa fa-wand-magic-sparkles me-1" />Cargar plantilla predefinida
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button key={key} type="button" className="btn btn-sm btn-outline-primary"
                onClick={() => applyPreset(key)}>
                {p.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Datos básicos */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-muted">Nombre del transportista <span className="text-danger">*</span></label>
          <input type="text" className="form-control form-control-sm" required
            value={formData.nombre}
            onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))} />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-muted">Servicio</label>
          <input type="text" className="form-control form-control-sm"
            placeholder="Ej: Estándar, Express, Prioritario..."
            value={formData.servicio}
            onChange={(e) => setFormData((p) => ({ ...p, servicio: e.target.value }))} />
        </div>
        <div className="col-12">
          <label className="form-label small fw-semibold text-muted">Descripción</label>
          <textarea className="form-control form-control-sm" rows="2"
            placeholder="Características del servicio..."
            value={formData.descripcion}
            onChange={(e) => setFormData((p) => ({ ...p, descripcion: e.target.value }))} />
        </div>
      </div>

      {/* Editor de campos */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="fw-semibold small">Campos del formulario de envío</span>
            <span className="badge rounded-pill text-bg-secondary ms-2" style={{ fontSize: '0.72rem' }}>
              {formData.campos.filter((c) => c.label.trim()).length}
            </span>
          </div>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addCampo}>
            <i className="fa fa-plus me-1" />Agregar campo
          </button>
        </div>

        <div className="d-flex flex-column gap-2">
          {formData.campos.map((campo, idx) => {
            const expanded = expandedIdx === idx;
            return (
              <div key={idx} className="border rounded overflow-hidden"
                style={{ borderColor: expanded ? '#0d6efd' : '#dee2e6' }}>

                {/* Row principal */}
                <div className="d-flex align-items-center gap-2 px-2 py-2"
                  style={{ backgroundColor: expanded ? '#f0f4ff' : '#f8f9fa' }}>

                  {/* Orden */}
                  <div className="d-flex flex-column gap-0">
                    <button type="button" className="btn btn-link p-0 text-muted" style={{ lineHeight: 1, fontSize: '0.6rem' }}
                      onClick={() => moveCampo(idx, -1)} disabled={idx === 0}>
                      <i className="fa fa-chevron-up" />
                    </button>
                    <button type="button" className="btn btn-link p-0 text-muted" style={{ lineHeight: 1, fontSize: '0.6rem' }}
                      onClick={() => moveCampo(idx, 1)} disabled={idx === formData.campos.length - 1}>
                      <i className="fa fa-chevron-down" />
                    </button>
                  </div>

                  <span className="text-muted small" style={{ minWidth: 20 }}>{idx + 1}.</span>

                  {/* Label */}
                  <input type="text" className="form-control form-control-sm border-0 bg-transparent fw-semibold"
                    placeholder="Nombre del campo (Ej: DNI, Celular...)"
                    value={campo.label}
                    onChange={(e) => updateCampo(idx, { label: e.target.value })}
                    style={{ minWidth: 0, flex: 1 }} />

                  {/* Tipo badge */}
                  <span className="badge rounded-pill bg-light text-secondary border small" style={{ whiteSpace: 'nowrap' }}>
                    {FIELD_TYPES.find((t) => t.value === campo.type)?.label || campo.type}
                  </span>

                  {/* Requerido badge */}
                  {campo.required && (
                    <span className="badge rounded-pill text-bg-danger small">Req.</span>
                  )}

                  {/* Expand / delete */}
                  <button type="button" className="btn btn-sm btn-link text-primary p-0"
                    onClick={() => setExpandedIdx(expanded ? null : idx)}>
                    <i className={`fa fa-chevron-${expanded ? 'up' : 'down'}`} />
                  </button>
                  <button type="button" className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => removeCampo(idx)}>
                    <i className="fa fa-trash" />
                  </button>
                </div>

                {/* Detalles expandidos */}
                {expanded && (
                  <div className="px-3 py-2 border-top" style={{ backgroundColor: '#fff' }}>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">Tipo de campo</label>
                        <select className="form-select form-select-sm" value={campo.type}
                          onChange={(e) => updateCampo(idx, { type: e.target.value, opciones: [] })}>
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small text-muted mb-1">Placeholder</label>
                        <input type="text" className="form-control form-control-sm"
                          placeholder="Texto de ayuda dentro del campo..."
                          value={campo.placeholder || ''}
                          onChange={(e) => updateCampo(idx, { placeholder: e.target.value })} />
                      </div>
                      <div className="col-md-3 d-flex align-items-end pb-1">
                        <div className="form-check mb-0">
                          <input type="checkbox" className="form-check-input" id={`req_${idx}`}
                            checked={campo.required}
                            onChange={(e) => updateCampo(idx, { required: e.target.checked })} />
                          <label className="form-check-label small" htmlFor={`req_${idx}`}>Requerido</label>
                        </div>
                      </div>

                      {/* Opciones para select */}
                      {campo.type === 'select' && (
                        <div className="col-12">
                          <label className="form-label small text-muted mb-1">Opciones de la lista</label>
                          <div className="d-flex flex-column gap-1">
                            {(campo.opciones || []).map((op, opIdx) => (
                              <div key={opIdx} className="input-group input-group-sm">
                                <input type="text" className="form-control" value={op}
                                  placeholder={`Opción ${opIdx + 1}`}
                                  onChange={(e) => updateOpcion(idx, opIdx, e.target.value)} />
                                <button type="button" className="btn btn-outline-danger"
                                  onClick={() => removeOpcion(idx, opIdx)}>
                                  <i className="fa fa-xmark" />
                                </button>
                              </div>
                            ))}
                            <button type="button" className="btn btn-sm btn-outline-secondary"
                              onClick={() => addOpcion(idx)}>
                              <i className="fa fa-plus me-1" />Agregar opción
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activo */}
      <div className="form-check form-switch mb-4">
        <input className="form-check-input" type="checkbox" id="activoSwitch"
          checked={formData.activo}
          onChange={(e) => setFormData((p) => ({ ...p, activo: e.target.checked }))} />
        <label className="form-check-label small" htmlFor="activoSwitch">Transportista activo</label>
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-check me-2" />
          {isEditing ? 'Guardar cambios' : 'Crear transportista'}
        </button>
      </div>
    </form>
  );
};

export default TransporteForm;
