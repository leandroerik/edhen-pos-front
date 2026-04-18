import React, { useState } from 'react';
import styles from './AddressForm.module.css';

/**
 * Componente AddressForm
 * Formulario para crear/editar direcciones de envío
 * Incluye datos específicos para transportistas argentinos
 */
const AddressForm = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(address || {
    calle: '',
    numero: '',
    piso: '',
    depto: '',
    codigoPostal: '',
    localidad: '',
    provincia: '',
    transportista: 'Correo Argentino',
    tipoEnvio: 'Domicilio',
    codigoCliente: '',
    esPorDefecto: false
  });

  const [errors, setErrors] = useState({});

  const transportistas = [
    'Correo Argentino',
    'OCA',
    'Andreani',
    'Otros'
  ];

  const tiposEnvio = [
    'Domicilio',
    'Sucursal',
    'Retiro'
  ];

  const provinciasAR = [
    'Buenos Aires',
    'CABA',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.calle || !formData.calle.trim()) {
      newErrors.calle = 'La calle es requerida';
    }

    if (!formData.numero || !formData.numero.toString().trim()) {
      newErrors.numero = 'El número es requerido';
    }

    if (!formData.codigoPostal || !formData.codigoPostal.trim()) {
      newErrors.codigoPostal = 'El código postal es requerido';
    }

    if (!formData.localidad || !formData.localidad.trim()) {
      newErrors.localidad = 'La localidad es requerida';
    }

    if (!formData.provincia) {
      newErrors.provincia = 'La provincia es requerida';
    }

    if (!formData.codigoCliente || !formData.codigoCliente.trim()) {
      newErrors.codigoCliente = 'El código de cliente del transportista es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'esPorDefecto' ? e.target.checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const getFieldClass = (fieldName) => {
    return errors[fieldName] ? 'form-control is-invalid' : 'form-control';
  };

  return (
    <form onSubmit={handleSubmit}>
      <h6 className="mb-3">
        <i className="fa fa-location-dot me-2"></i>
        {address ? 'Editar' : 'Agregar'} Dirección de Envío
      </h6>

      {/* Dirección */}
      <div className="row">
        <div className="col-md-8 mb-3">
          <label className="form-label">Calle *</label>
          <input
            type="text"
            className={getFieldClass('calle')}
            name="calle"
            value={formData.calle}
            onChange={handleInputChange}
            placeholder="Ej: Avenida Santa Fe"
          />
          {errors.calle && <div className="invalid-feedback d-block">{errors.calle}</div>}
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Número *</label>
          <input
            type="text"
            className={getFieldClass('numero')}
            name="numero"
            value={formData.numero}
            onChange={handleInputChange}
            placeholder="Ej: 3456"
          />
          {errors.numero && <div className="invalid-feedback d-block">{errors.numero}</div>}
        </div>
      </div>

      {/* Piso y Depto */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Piso</label>
          <input
            type="text"
            className="form-control"
            name="piso"
            value={formData.piso}
            onChange={handleInputChange}
            placeholder="Ej: 5"
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Departamento</label>
          <input
            type="text"
            className="form-control"
            name="depto"
            value={formData.depto}
            onChange={handleInputChange}
            placeholder="Ej: A"
          />
        </div>

        <div className="col-md-4 mb-3">
          <label className="form-label">Código Postal *</label>
          <input
            type="text"
            className={getFieldClass('codigoPostal')}
            name="codigoPostal"
            value={formData.codigoPostal}
            onChange={handleInputChange}
            placeholder="Ej: C1425"
          />
          {errors.codigoPostal && <div className="invalid-feedback d-block">{errors.codigoPostal}</div>}
        </div>
      </div>

      {/* Localidad y Provincia */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Localidad/Barrio *</label>
          <input
            type="text"
            className={getFieldClass('localidad')}
            name="localidad"
            value={formData.localidad}
            onChange={handleInputChange}
            placeholder="Ej: San Nicolás"
          />
          {errors.localidad && <div className="invalid-feedback d-block">{errors.localidad}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Provincia *</label>
          <select
            className={getFieldClass('provincia')}
            name="provincia"
            value={formData.provincia}
            onChange={handleInputChange}
          >
            <option value="">Seleccionar provincia</option>
            {provinciasAR.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
          {errors.provincia && <div className="invalid-feedback d-block">{errors.provincia}</div>}
        </div>
      </div>

      <hr className="my-3" />

      {/* Datos de Transportista */}
      <h6 className="mb-3">
        <i className="fa fa-truck me-2"></i>Datos del Transportista
      </h6>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Transportista</label>
          <select
            className="form-select"
            name="transportista"
            value={formData.transportista}
            onChange={handleInputChange}
          >
            {transportistas.map(tr => (
              <option key={tr} value={tr}>{tr}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Tipo de Envío</label>
          <select
            className="form-select"
            name="tipoEnvio"
            value={formData.tipoEnvio}
            onChange={handleInputChange}
          >
            {tiposEnvio.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Código Cliente del Transportista *</label>
        <input
          type="text"
          className={getFieldClass('codigoCliente')}
          name="codigoCliente"
          value={formData.codigoCliente}
          onChange={handleInputChange}
          placeholder="Ej: CA-123456 (Correo Argentino) u OCA-456789"
        />
        <small className="form-text text-muted">
          Tu número de cuenta o código de cliente con el transportista
        </small>
        {errors.codigoCliente && <div className="invalid-feedback d-block">{errors.codigoCliente}</div>}
      </div>

      {/* Dirección por defecto */}
      <div className="mb-3">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="esPorDefecto"
            name="esPorDefecto"
            checked={formData.esPorDefecto}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="esPorDefecto">
            <i className="fa fa-check-double me-2"></i>Marcar como dirección predeterminada para envíos
          </label>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-save me-2"></i>{address ? 'Actualizar' : 'Agregar'} Dirección
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default AddressForm;