import React, { useState, useEffect } from 'react';

const TPVOnlineShippingForm = ({
  show,
  clienteEnvio,
  setClienteEnvio,
  onConfirm,
  onCancel
}) => {
  const [formData, setFormData] = useState(clienteEnvio);

  useEffect(() => {
    setFormData(clienteEnvio);
  }, [clienteEnvio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = () => {
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.direccion || !formData.ciudad || !formData.codigoPostal) {
      alert('Por favor completa todos los campos');
      return;
    }
    setClienteEnvio(formData);
    onConfirm();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              <i className="fa fa-truck me-2"></i>Datos de Envío
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+54 9 XXXX XXXXXX"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Ciudad</label>
                <input
                  type="text"
                  className="form-control"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  placeholder="Ej: Buenos Aires"
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Calle y número"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Código Postal</label>
                <input
                  type="text"
                  className="form-control"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleChange}
                  placeholder="XXXX"
                />
              </div>
            </div>

            <div className="alert alert-info mt-3" role="alert">
              <i className="fa fa-info-circle me-2"></i>
              Verifica que todos los datos sean correctos antes de confirmar.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="btn btn-warning text-dark btn-lg" onClick={handleConfirm}>
              <i className="fa fa-check me-2"></i>Confirmar Datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVOnlineShippingForm;
