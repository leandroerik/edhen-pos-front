import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../../services/adminService';

const NotificacionesConfig = () => {
  const [config, setConfig] = useState({
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      activo: false
    },
    sms: {
      provider: 'twilio',
      accountSid: '',
      authToken: '',
      fromNumber: '',
      activo: false
    },
    eventos: {
      nuevoPedido: { email: false, sms: false },
      pedidoConfirmado: { email: false, sms: false },
      pedidoEnviado: { email: false, sms: false },
      pedidoEntregado: { email: false, sms: false },
      pagoRecibido: { email: false, sms: false },
      stockBajo: { email: false, sms: false },
      clienteRegistro: { email: false, sms: false }
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSms, setTestingSms] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await adminService.getNotificacionesConfig();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading notifications config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSmsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleEventoChange = (evento, tipo, checked) => {
    setConfig(prev => ({
      ...prev,
      eventos: {
        ...prev.eventos,
        [evento]: {
          ...prev.eventos[evento],
          [tipo]: checked
        }
      }
    }));
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      await adminService.saveNotificacionesConfig(config);
      toast.success('Configuración de notificaciones guardada correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    if (!config.email.activo) {
      toast.error('El email debe estar activo para hacer pruebas');
      return;
    }

    try {
      setTestingEmail(true);
      await adminService.testEmailConfig();
      toast.success('Email de prueba enviado correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al enviar email de prueba');
    } finally {
      setTestingEmail(false);
    }
  };

  const testSms = async () => {
    if (!config.sms.activo) {
      toast.error('El SMS debe estar activo para hacer pruebas');
      return;
    }

    try {
      setTestingSms(true);
      await adminService.testSmsConfig();
      toast.success('SMS de prueba enviado correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al enviar SMS de prueba');
    } finally {
      setTestingSms(false);
    }
  };

  const eventosLabels = {
    nuevoPedido: 'Nuevo pedido online',
    pedidoConfirmado: 'Pedido confirmado',
    pedidoEnviado: 'Pedido enviado',
    pedidoEntregado: 'Pedido entregado',
    pagoRecibido: 'Pago recibido',
    stockBajo: 'Producto con stock bajo',
    clienteRegistro: 'Nuevo cliente registrado'
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
          style={{ width: 40, height: 40, backgroundColor: '#cfe2ff' }}>
          <i className="fa fa-bell text-primary" />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Notificaciones</h4>
          <small className="text-muted">Configurá alertas por email y SMS para eventos del sistema</small>
        </div>
      </div>

      <div className="row">
        {/* Configuración Email */}
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-envelope me-2 text-muted"></i>
                Email (SMTP)
              </h6>
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="activo"
                  checked={config.email.activo}
                  onChange={handleEmailChange}
                />
                <label className="form-check-label small">Activo</label>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">SMTP Host</label>
                  <input
                    type="text"
                    className="form-control"
                    name="smtpHost"
                    value={config.email.smtpHost}
                    onChange={handleEmailChange}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Puerto</label>
                  <input
                    type="number"
                    className="form-control"
                    name="smtpPort"
                    value={config.email.smtpPort}
                    onChange={handleEmailChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Usuario SMTP</label>
                <input
                  type="text"
                  className="form-control"
                  name="smtpUser"
                  value={config.email.smtpUser}
                  onChange={handleEmailChange}
                  placeholder="tu-email@gmail.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="smtpPassword"
                  value={config.email.smtpPassword}
                  onChange={handleEmailChange}
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email Remitente</label>
                  <input
                    type="email"
                    className="form-control"
                    name="fromEmail"
                    value={config.email.fromEmail}
                    onChange={handleEmailChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre Remitente</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fromName"
                    value={config.email.fromName}
                    onChange={handleEmailChange}
                    placeholder="Tu Tienda"
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={testEmail}
                disabled={testingEmail || !config.email.activo}
              >
                <i className={`fa ${testingEmail ? 'fa-spinner fa-spin' : 'fa-paper-plane'} me-1`}></i>
                {testingEmail ? 'Enviando...' : 'Probar Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Configuración SMS */}
        <div className="col-lg-6">
          <div className="card mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-sms me-2 text-muted"></i>
                SMS
              </h6>
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="activo"
                  checked={config.sms.activo}
                  onChange={handleSmsChange}
                />
                <label className="form-check-label small">Activo</label>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Proveedor</label>
                <select
                  className="form-select"
                  name="provider"
                  value={config.sms.provider}
                  onChange={handleSmsChange}
                >
                  <option value="twilio">Twilio</option>
                  <option value="aws">Amazon SNS</option>
                  <option value="messagebird">MessageBird</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Account SID</label>
                <input
                  type="text"
                  className="form-control"
                  name="accountSid"
                  value={config.sms.accountSid}
                  onChange={handleSmsChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Auth Token</label>
                <input
                  type="password"
                  className="form-control"
                  name="authToken"
                  value={config.sms.authToken}
                  onChange={handleSmsChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Número Remitente</label>
                <input
                  type="text"
                  className="form-control"
                  name="fromNumber"
                  value={config.sms.fromNumber}
                  onChange={handleSmsChange}
                  placeholder="+34123456789"
                />
              </div>

              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={testSms}
                disabled={testingSms || !config.sms.activo}
              >
                <i className={`fa ${testingSms ? 'fa-spinner fa-spin' : 'fa-paper-plane'} me-1`}></i>
                {testingSms ? 'Enviando...' : 'Probar SMS'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Eventos de Notificación */}
      <div className="card">
        <div className="card-header py-3">
          <h6 className="mb-0 fw-bold">
            <i className="fa fa-calendar-check me-2 text-muted"></i>
            Eventos
          </h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th className="text-center">
                    <i className="fa fa-envelope me-1"></i>
                    Email
                  </th>
                  <th className="text-center">
                    <i className="fa fa-sms me-1"></i>
                    SMS
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(eventosLabels).map(([key, label]) => (
                  <tr key={key}>
                    <td>
                      <strong>{label}</strong>
                    </td>
                    <td className="text-center">
                      <div className="form-check d-inline-block">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={config.eventos[key]?.email || false}
                          onChange={(e) => handleEventoChange(key, 'email', e.target.checked)}
                          disabled={!config.email.activo}
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="form-check d-inline-block">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={config.eventos[key]?.sms || false}
                          onChange={(e) => handleEventoChange(key, 'sms', e.target.checked)}
                          disabled={!config.sms.activo}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="row mt-4">
        <div className="col-12 text-end">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={saveConfig}
            disabled={saving}
          >
            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`}></i>
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesConfig;