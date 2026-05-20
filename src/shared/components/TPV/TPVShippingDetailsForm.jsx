import React, { useState, useEffect } from 'react';
import { transportesData } from '../../../services/mocks';

const TPVShippingDetailsForm = ({
  show,
  datosEnvio,
  setDatosEnvio,
  onConfirm,
  onCancel,
  clienteSeleccionado
}) => {
  const [formData, setFormData] = useState(datosEnvio);
  const [transportes, setTransportes] = useState([]);
  const [loadingTransportes, setLoadingTransportes] = useState(true);

  useEffect(() => {
    setFormData(datosEnvio);
  }, [datosEnvio]);

  // Cargar transportistas directamente desde los mocks
  useEffect(() => {
    const loadTransportes = async () => {
      setLoadingTransportes(true);
      try {
        // Simular carga desde API
        setTimeout(() => {
          setTransportes(transportesData);
          setLoadingTransportes(false);
        }, 300);
      } catch (error) {
        console.error('Error cargando transportistas:', error);
        setLoadingTransportes(false);
      }
    };

    if (show) {
      loadTransportes();
    }
  }, [show]);

  // Cargar automáticamente datos del cliente cuando se abre el modal
  useEffect(() => {
    if (show && clienteSeleccionado && clienteSeleccionado.direccion) {
      console.log('Cargando automáticamente datos del cliente al abrir modal:', clienteSeleccionado);
      setFormData(prev => ({
        ...prev,
        atributos: {
          ...prev.atributos,
          nombre: clienteSeleccionado.nombre_envio || clienteSeleccionado.nombre,
          apellido: clienteSeleccionado.apellido_envio || '',
          direccion: clienteSeleccionado.direccion,
          codigoPostal: clienteSeleccionado.codigoPostal,
          localidad: clienteSeleccionado.localidad,
          provincia: clienteSeleccionado.provincia,
          telefono: clienteSeleccionado.telefono,
          email: clienteSeleccionado.email
        }
      }));
    }
  }, [show, clienteSeleccionado]);


  const handleTransportistaChange = (transportistaId) => {
    console.log('Cliente seleccionado:', clienteSeleccionado);
    console.log('Transportista ID:', transportistaId);

    const transportistaSeleccionado = transportes.find(t => t.id === parseInt(transportistaId));
    console.log('Transportista encontrado:', transportistaSeleccionado);

    if (transportistaSeleccionado) {
      // Cargar datos del transportista, manteniendo los atributos existentes (datos del cliente)
      setFormData(prev => ({
        ...prev,
        transportista: transportistaSeleccionado.nombre,
        servicio: transportistaSeleccionado.servicio,
        transportistaId: transportistaSeleccionado.id
        // No resetear atributos aquí, ya que contienen los datos del cliente
      }));

      console.log('Transportista actualizado, atributos del cliente mantenidos');
    } else {
      // Reset cuando no hay transportista seleccionado
      setFormData(prev => ({
        ...prev,
        transportista: '',
        servicio: '',
        transportistaId: null
        // Tampoco resetear atributos aquí para mantener datos del cliente
      }));
    }
  };

  const handleServicioChange = (servicio) => {
    setFormData(prev => ({
      ...prev,
      servicio,
      // Reset campos específicos cuando cambia el servicio
      atributos: {}
    }));
  };

  const handleAtributoChange = (atributo, valor) => {
    setFormData(prev => ({
      ...prev,
      atributos: {
        ...prev.atributos,
        [atributo]: valor
      }
    }));
  };

  const handlePrintShippingDetails = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detalle de Envío - ${clienteSeleccionado?.nombre || 'Cliente'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #007bff;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .section-title {
              font-weight: bold;
              color: #007bff;
              margin-bottom: 10px;
              font-size: 1.2em;
            }
            .field {
              margin-bottom: 8px;
            }
            .field-label {
              font-weight: bold;
              display: inline-block;
              width: 150px;
            }
            .field-value {
              display: inline-block;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 0.9em;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Detalle de Envío</h1>
            <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>

          ${clienteSeleccionado ? `
          <div class="section">
            <div class="section-title">Información del Cliente</div>
            <div class="field">
              <span class="field-label">Cliente:</span>
              <span class="field-value">${clienteSeleccionado.nombre}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${clienteSeleccionado.email || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Teléfono:</span>
              <span class="field-value">${clienteSeleccionado.telefono || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Tipo:</span>
              <span class="field-value">${clienteSeleccionado.tipo || 'No especificado'}</span>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Información del Destinatario</div>
            <div class="field">
              <span class="field-label">Nombre:</span>
              <span class="field-value">${formData.atributos?.nombre || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Apellido:</span>
              <span class="field-value">${formData.atributos?.apellido || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Dirección:</span>
              <span class="field-value">${formData.atributos?.direccion || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Código Postal:</span>
              <span class="field-value">${formData.atributos?.codigoPostal || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Localidad:</span>
              <span class="field-value">${formData.atributos?.localidad || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Provincia:</span>
              <span class="field-value">${formData.atributos?.provincia || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Teléfono:</span>
              <span class="field-value">${formData.atributos?.telefono || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${formData.atributos?.email || 'No especificado'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Información del Transporte</div>
            <div class="field">
              <span class="field-label">Transportista:</span>
              <span class="field-value">${formData.transportista || 'No seleccionado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Servicio:</span>
              <span class="field-value">${formData.servicio || 'No especificado'}</span>
            </div>
            <div class="field">
              <span class="field-label">Monto Mínimo:</span>
              <span class="field-value">${formData.montoMinimo ? '$' + formData.montoMinimo : 'No especificado'}</span>
            </div>
          </div>

          ${formData.atributos && Object.keys(formData.atributos).some(key =>
            !['nombre', 'apellido', 'direccion', 'codigoPostal', 'localidad', 'provincia', 'telefono', 'email'].includes(key)
          ) ? `
          <div class="section">
            <div class="section-title">Atributos Adicionales del Envío</div>
            ${Object.entries(formData.atributos)
              .filter(([key]) => !['nombre', 'apellido', 'direccion', 'codigoPostal', 'localidad', 'provincia', 'telefono', 'email'].includes(key))
              .map(([key, value]) => `
                <div class="field">
                  <span class="field-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span class="field-value">${value || 'No especificado'}</span>
                </div>
              `).join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generado por Sistema Edhen - TPV Online</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleTransportistaAtributoChange = (index, field, value) => {
    setFormData(prev => {
      const transportistaAtributos = [...(prev.transportistaAtributos || [])];
      transportistaAtributos[index] = {
        ...transportistaAtributos[index],
        [field]: value
      };
      return {
        ...prev,
        transportistaAtributos
      };
    });
  };

  const handleAddTransportistaAtributo = () => {
    setFormData(prev => ({
      ...prev,
      transportistaAtributos: [
        ...(prev.transportistaAtributos || []),
        { nombre: '', valor: '' }
      ]
    }));
  };

  const handleRemoveTransportistaAtributo = (index) => {
    setFormData(prev => {
      const transportistaAtributos = [...(prev.transportistaAtributos || [])];
      transportistaAtributos.splice(index, 1);
      return {
        ...prev,
        transportistaAtributos
      };
    });
  };

  const handleConfirm = () => {
    if (!formData.transportistaId) {
      alert('Por favor selecciona un transportista');
      return;
    }
    setDatosEnvio(formData);
    onConfirm();
  };

  const serviciosEnvio = [
    'Andreani',
    'Correo Argentino',
    'OCA',
    'Expreso',
    'Otro'
  ];

  const atributosPorServicio = {
    'Andreani': [
      'nombre', 'apellido', 'direccion', 'codigoPostal', 'localidad', 'provincia',
      'alto', 'ancho', 'largo', 'peso', 'valorDeclarado', 'tipoEnvio'
    ],
    'Correo Argentino': [
      'destinatario', 'domicilio', 'codigoPostal', 'localidad', 'provincia',
      'peso', 'categoria', 'servicio', 'valorDeclarado'
    ],
    'OCA': [
      'destinatario', 'direccion', 'codigoPostal', 'localidad', 'provincia',
      'peso', 'alto', 'ancho', 'largo', 'valorDeclarado', 'tipoServicio'
    ],
    'Expreso': [
      'destinatario', 'direccion', 'codigoPostal', 'localidad', 'provincia',
      'peso', 'dimensiones', 'valorDeclarado', 'urgente'
    ],
    'Otro': [
      'destinatario', 'direccion', 'codigoPostal', 'localidad', 'provincia',
      'peso', 'notas'
    ]
  };

  if (!show) return null;

  const atributosActuales = atributosPorServicio[formData.servicio] || [];

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <i className="fa fa-shipping-fast me-2"></i>Detalles del Envío
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {/* Transportista */}
              <div className="col-12">
                <label className="form-label fw-semibold">Transportista *</label>
                <select
                  className="form-control"
                  value={formData.transportistaId || ''}
                  onChange={(e) => handleTransportistaChange(e.target.value)}
                  disabled={loadingTransportes}
                >
                  <option value="">
                    {loadingTransportes ? 'Cargando transportistas...' : 'Seleccionar transportista...'}
                  </option>
                  {transportes.filter(t => t.activo).map((transportista) => (
                    <option key={transportista.id} value={transportista.id}>
                      {transportista.nombre} - {transportista.servicio}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio de Envío */}
              <div className="col-12">
                <label className="form-label fw-semibold">Servicio de Envío *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.servicio || ''}
                  readOnly
                  placeholder="Se cargará automáticamente al seleccionar transportista"
                />
              </div>

              {formData.servicio && (
                <>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Transportista</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.transportista || ''}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Monto mínimo</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      value={formData.montoMinimo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, montoMinimo: e.target.value }))}
                      placeholder="Monto mínimo"
                    />
                  </div>
                  {/* Información del Destinatario - Siempre visible si hay cliente */}
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="fa fa-user me-2"></i>Información del Destinatario
                    </h6>
                  </div>

                  {/* Campos básicos siempre visibles cuando hay cliente seleccionado */}
                  {clienteSeleccionado && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Nombre</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.nombre || ''}
                          onChange={(e) => handleAtributoChange('nombre', e.target.value)}
                          placeholder="Nombre del destinatario"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Apellido</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.apellido || ''}
                          onChange={(e) => handleAtributoChange('apellido', e.target.value)}
                          placeholder="Apellido del destinatario"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Dirección</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.direccion || ''}
                          onChange={(e) => handleAtributoChange('direccion', e.target.value)}
                          placeholder="Calle, número, piso, departamento"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Código Postal</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.codigoPostal || ''}
                          onChange={(e) => handleAtributoChange('codigoPostal', e.target.value)}
                          placeholder="Código postal"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Localidad</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.localidad || ''}
                          onChange={(e) => handleAtributoChange('localidad', e.target.value)}
                          placeholder="Localidad"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Provincia</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.provincia || ''}
                          onChange={(e) => handleAtributoChange('provincia', e.target.value)}
                          placeholder="Provincia"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.atributos?.telefono || ''}
                          onChange={(e) => handleAtributoChange('telefono', e.target.value)}
                          placeholder="Teléfono de contacto"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.atributos?.email || ''}
                          onChange={(e) => handleAtributoChange('email', e.target.value)}
                          placeholder="Email de contacto"
                        />
                      </div>
                    </>
                  )}

                  {/* Campos adicionales según el servicio seleccionado */}
                  {(atributosActuales.includes('nombre') || atributosActuales.includes('destinatario')) && !clienteSeleccionado && (
                    <div className="col-md-6">
                      <label className="form-label">Nombre Completo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.atributos?.nombre || formData.atributos?.destinatario || ''}
                        onChange={(e) => handleAtributoChange(atributosActuales.includes('nombre') ? 'nombre' : 'destinatario', e.target.value)}
                        placeholder="Nombre completo del destinatario"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('apellido') && !clienteSeleccionado && (
                    <div className="col-md-6">
                      <label className="form-label">Apellido</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.atributos?.apellido || ''}
                        onChange={(e) => handleAtributoChange('apellido', e.target.value)}
                        placeholder="Apellido del destinatario"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('direccion') && !clienteSeleccionado && (
                    <div className="col-12">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.atributos?.direccion || ''}
                        onChange={(e) => handleAtributoChange('direccion', e.target.value)}
                        placeholder="Calle, número, piso, departamento"
                      />
                    </div>
                  )}

                  <div className="col-md-4">
                    <label className="form-label">Código Postal</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.atributos?.codigoPostal || ''}
                      onChange={(e) => handleAtributoChange('codigoPostal', e.target.value)}
                      placeholder="Ej: 1000"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Localidad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.atributos?.localidad || ''}
                      onChange={(e) => handleAtributoChange('localidad', e.target.value)}
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Provincia</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.atributos?.provincia || ''}
                      onChange={(e) => handleAtributoChange('provincia', e.target.value)}
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>

                  {/* Dimensiones y Peso */}
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="fa fa-box me-2"></i>Dimensiones y Peso
                    </h6>
                  </div>

                  {atributosActuales.includes('peso') && (
                    <div className="col-md-6">
                      <label className="form-label">Peso (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.1"
                        value={formData.atributos?.peso || ''}
                        onChange={(e) => handleAtributoChange('peso', e.target.value)}
                        placeholder="0.5"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('alto') && (
                    <div className="col-md-3">
                      <label className="form-label">Alto (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.atributos?.alto || ''}
                        onChange={(e) => handleAtributoChange('alto', e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('ancho') && (
                    <div className="col-md-3">
                      <label className="form-label">Ancho (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.atributos?.ancho || ''}
                        onChange={(e) => handleAtributoChange('ancho', e.target.value)}
                        placeholder="15"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('largo') && (
                    <div className="col-md-3">
                      <label className="form-label">Largo (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.atributos?.largo || ''}
                        onChange={(e) => handleAtributoChange('largo', e.target.value)}
                        placeholder="20"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('dimensiones') && (
                    <div className="col-md-6">
                      <label className="form-label">Dimensiones</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.atributos?.dimensiones || ''}
                        onChange={(e) => handleAtributoChange('dimensiones', e.target.value)}
                        placeholder="Alto x Ancho x Largo"
                      />
                    </div>
                  )}

                  {/* Información Adicional */}
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="fa fa-info-circle me-2"></i>Información Adicional
                    </h6>
                  </div>

                  {atributosActuales.includes('valorDeclarado') && (
                    <div className="col-md-6">
                      <label className="form-label">Valor Declarado ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.atributos?.valorDeclarado || ''}
                        onChange={(e) => handleAtributoChange('valorDeclarado', e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                  )}

                  {atributosActuales.includes('tipoEnvio') && (
                    <div className="col-md-6">
                      <label className="form-label">Tipo de Envío</label>
                      <select
                        className="form-control"
                        value={formData.atributos?.tipoEnvio || ''}
                        onChange={(e) => handleAtributoChange('tipoEnvio', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="estandar">Estándar</option>
                        <option value="express">Express</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                  )}

                  {atributosActuales.includes('categoria') && (
                    <div className="col-md-6">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-control"
                        value={formData.atributos?.categoria || ''}
                        onChange={(e) => handleAtributoChange('categoria', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="carta">Carta</option>
                        <option value="paquete">Paquete</option>
                        <option value="encomienda">Encomienda</option>
                      </select>
                    </div>
                  )}

                  {atributosActuales.includes('servicio') && (
                    <div className="col-md-6">
                      <label className="form-label">Servicio</label>
                      <select
                        className="form-control"
                        value={formData.atributos?.servicio || ''}
                        onChange={(e) => handleAtributoChange('servicio', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="clasico">Clásico</option>
                        <option value="prioridad">Prioridad</option>
                        <option value="express">Express</option>
                      </select>
                    </div>
                  )}

                  {atributosActuales.includes('tipoServicio') && (
                    <div className="col-md-6">
                      <label className="form-label">Tipo de Servicio</label>
                      <select
                        className="form-control"
                        value={formData.atributos?.tipoServicio || ''}
                        onChange={(e) => handleAtributoChange('tipoServicio', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="normal">Normal</option>
                        <option value="rapido">Rápido</option>
                        <option value="super">Super Rápido</option>
                      </select>
                    </div>
                  )}

                  {atributosActuales.includes('urgente') && (
                    <div className="col-md-6">
                      <label className="form-label">¿Es urgente?</label>
                      <select
                        className="form-control"
                        value={formData.atributos?.urgente || ''}
                        onChange={(e) => handleAtributoChange('urgente', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}

                  {atributosActuales.includes('notas') && (
                    <div className="col-12">
                      <label className="form-label">Notas Adicionales</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.atributos?.notas || ''}
                        onChange={(e) => handleAtributoChange('notas', e.target.value)}
                        placeholder="Instrucciones especiales, referencias, etc."
                      />
                    </div>
                  )}

                  <div className="col-12 mt-4">
                    <h6 className="text-primary mb-3">
                      <i className="fa fa-cogs me-2"></i>Atributos del Transportista
                    </h6>
                  </div>

                  {(formData.transportistaAtributos || []).map((atributo, index) => (
                    <React.Fragment key={index}>
                      <div className="col-md-5">
                        <label className="form-label">Nombre del atributo</label>
                        <input
                          type="text"
                          className="form-control"
                          value={atributo.nombre}
                          onChange={(e) => handleTransportistaAtributoChange(index, 'nombre', e.target.value)}
                          placeholder="Ej: código cliente"
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label">Valor</label>
                        <input
                          type="text"
                          className="form-control"
                          value={atributo.valor}
                          onChange={(e) => handleTransportistaAtributoChange(index, 'valor', e.target.value)}
                          placeholder="Ej: 12345"
                        />
                      </div>
                      <div className="col-md-2 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-100"
                          onClick={() => handleRemoveTransportistaAtributo(index)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </React.Fragment>
                  ))}

                  <div className="col-12">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleAddTransportistaAtributo}>
                      <i className="fa fa-plus me-2"></i>Agregar atributo del transportista
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3">
              <small className="text-muted">* Campos obligatorios</small>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="btn btn-outline-primary" onClick={handlePrintShippingDetails}>
              <i className="fa fa-print me-2"></i>Imprimir Detalles
            </button>
            <button type="button" className="btn btn-info" onClick={handleConfirm}>
              <i className="fa fa-check me-2"></i>Confirmar Detalles del Envío
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVShippingDetailsForm;