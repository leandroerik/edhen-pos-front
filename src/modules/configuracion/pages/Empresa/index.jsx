import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const PROVINCIAS = [
  'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco',
  'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const DEFAULTS = {
  nombre: '', cuit: '', direccion: '', ciudad: '', codigoPostal: '',
  provincia: '', pais: 'Argentina', telefono: '', email: '', web: '',
  logo: '', regimenFiscal: 'responsable_inscripto', serieFactura: 'A', numeroFactura: 1
};

const EmpresaConfig = () => {
  const [formData, setFormData] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('empresaConfig');
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('empresaConfig', JSON.stringify(formData));
      toast.success('Configuración guardada correctamente');
      setSaving(false);
    }, 400);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40, backgroundColor: '#cfe2ff' }}>
          <i className="fa fa-building text-primary" />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Configuración de Empresa</h4>
          <small className="text-muted">Datos generales, fiscales y de contacto de tu negocio</small>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">

            <div className="card mb-4">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold"><i className="fa fa-info-circle me-2 text-muted" />Información General</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Nombre de la Empresa *</label>
                    <input type="text" className="form-control" name="nombre"
                      value={formData.nombre} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">CUIT *</label>
                    <input type="text" className="form-control" name="cuit"
                      value={formData.cuit} onChange={handleChange}
                      placeholder="30-12345678-9" required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Dirección</label>
                  <input type="text" className="form-control" name="direccion"
                    value={formData.direccion} onChange={handleChange}
                    placeholder="Av. Corrientes 1234, Piso 2" />
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label fw-semibold">Ciudad</label>
                    <input type="text" className="form-control" name="ciudad"
                      value={formData.ciudad} onChange={handleChange} />
                  </div>
                  <div className="col-md-2 mb-3">
                    <label className="form-label fw-semibold">C.P.</label>
                    <input type="text" className="form-control" name="codigoPostal"
                      value={formData.codigoPostal} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Provincia</label>
                    <select className="form-select" name="provincia"
                      value={formData.provincia} onChange={handleChange}>
                      <option value="">Seleccionar provincia...</option>
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold"><i className="fa fa-phone me-2 text-muted" />Contacto</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Teléfono</label>
                    <input type="tel" className="form-control" name="telefono"
                      value={formData.telefono} onChange={handleChange} placeholder="+54 11 1234-5678" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control" name="email"
                      value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label fw-semibold">Sitio Web</label>
                  <input type="url" className="form-control" name="web"
                    value={formData.web} onChange={handleChange}
                    placeholder="https://www.tunegocio.com.ar" />
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold"><i className="fa fa-calculator me-2 text-muted" />Configuración Fiscal</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Condición IVA</label>
                    <select className="form-select" name="regimenFiscal"
                      value={formData.regimenFiscal} onChange={handleChange}>
                      <option value="responsable_inscripto">Responsable Inscripto</option>
                      <option value="monotributista">Monotributista</option>
                      <option value="exento">Exento</option>
                      <option value="no_responsable">No Responsable</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-semibold">Tipo de Comprobante</label>
                    <select className="form-select" name="serieFactura"
                      value={formData.serieFactura} onChange={handleChange}>
                      <option value="A">Factura A</option>
                      <option value="B">Factura B</option>
                      <option value="C">Factura C</option>
                      <option value="X">Ticket X (sin fiscal)</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label fw-semibold">Nº Siguiente</label>
                    <input type="number" className="form-control" name="numeroFactura"
                      value={formData.numeroFactura} onChange={handleChange} min="1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-4">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold"><i className="fa fa-image me-2 text-muted" />Logo</h6>
              </div>
              <div className="card-body text-center">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="img-fluid rounded mb-3"
                    style={{ maxHeight: 150 }} />
                ) : (
                  <div className="rounded d-flex align-items-center justify-content-center mb-3"
                    style={{ height: 150, backgroundColor: '#f8f9fa' }}>
                    <i className="fa fa-image fa-3x text-muted" />
                  </div>
                )}
                <button type="button" className="btn btn-outline-secondary btn-sm">
                  <i className="fa fa-upload me-1" />Subir Logo
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`} />
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmpresaConfig;
