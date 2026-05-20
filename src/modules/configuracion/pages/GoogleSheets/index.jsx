import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { googleSheetsService, DEFAULT_CONFIG } from '../../../../services/googleSheetsService';

const ENTITIES = [
  { key: 'stock',      label: 'Stock / Variantes', icon: 'fa-cubes',         color: '#0d6efd' },
  { key: 'productos',  label: 'Catálogo',          icon: 'fa-tshirt',        color: '#6610f2' },
  { key: 'ventas',     label: 'Ventas',            icon: 'fa-shopping-cart', color: '#198754' },
  { key: 'clientes',   label: 'Clientes',          icon: 'fa-users',         color: '#0dcaf0' },
  { key: 'vendedores', label: 'Vendedores',        icon: 'fa-user-tie',      color: '#6c757d' },
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
};

const GoogleSheetsConfig = () => {
  const [config, setConfig]               = useState(DEFAULT_CONFIG);
  const [syncLog, setSyncLog]             = useState({});
  const [connectionStatus, setConnectionStatus] = useState(null); // null | { success, spreadsheetName }
  const [testing, setTesting]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [syncingAll, setSyncingAll]       = useState(false);
  const [syncingEntity, setSyncingEntity] = useState(null); // key | null

  useEffect(() => {
    googleSheetsService.getConfig().then(setConfig);
    setSyncLog(googleSheetsService.getSyncLog());
  }, []);

  const handleSpreadsheetId = (e) => {
    // Extraer ID si pegaron la URL completa
    let val = e.target.value.trim();
    const match = val.match(/\/spreadsheets\/d\/([\w-]+)/);
    if (match) val = match[1];
    setConfig(prev => ({ ...prev, spreadsheetId: val }));
    setConnectionStatus(null);
  };

  const handleTabChange = (entityKey, tabName) => {
    setConfig(prev => ({
      ...prev,
      hojas: { ...prev.hojas, [entityKey]: { ...prev.hojas[entityKey], tab: tabName } }
    }));
  };

  const handleToggleEntity = (entityKey) => {
    setConfig(prev => ({
      ...prev,
      hojas: {
        ...prev.hojas,
        [entityKey]: { ...prev.hojas[entityKey], activa: !prev.hojas[entityKey].activa }
      }
    }));
  };

  const handleTestConnection = async () => {
    if (!config.spreadsheetId) { toast.error('Ingresá el ID o URL del spreadsheet'); return; }
    setTesting(true);
    setConnectionStatus(null);
    try {
      const result = await googleSheetsService.testConnection(config.spreadsheetId);
      setConnectionStatus(result);
      if (result.success) toast.success(`Conectado: "${result.spreadsheetName}"`);
      else toast.error(result.message);
    } catch {
      toast.error('Error al verificar conexión');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await googleSheetsService.saveConfig(config);
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncEntity = async (entityKey) => {
    if (!connectionStatus?.success) { toast.error('Verificá la conexión primero'); return; }
    setSyncingEntity(entityKey);
    try {
      const tab = config.hojas[entityKey]?.tab;
      const result = await googleSheetsService.syncEntity(entityKey, tab);
      setSyncLog(prev => ({ ...prev, [entityKey]: result }));
      toast.success(`${ENTITIES.find(e => e.key === entityKey)?.label} sincronizado — ${result.records} registros`);
    } catch {
      toast.error('Error al sincronizar');
    } finally {
      setSyncingEntity(null);
    }
  };

  const handleSyncAll = async () => {
    if (!connectionStatus?.success) { toast.error('Verificá la conexión primero'); return; }
    setSyncingAll(true);
    try {
      const result = await googleSheetsService.syncAll(config.hojas);
      setSyncLog(googleSheetsService.getSyncLog());
      const total = Object.values(result.results).reduce((s, r) => s + (r.records ?? 0), 0);
      toast.success(`Sincronización completa — ${total} registros exportados`);
    } catch {
      toast.error('Error en la sincronización');
    } finally {
      setSyncingAll(false);
    }
  };

  const isConnected = connectionStatus?.success === true;
  const activeEntities = ENTITIES.filter(e => config.hojas[e.key]?.activa);

  return (
    <div className="container-fluid p-3">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h5 className="mb-1 fw-bold">
            <i className="fa fa-table-cells me-2 text-success"></i>
            Google Sheets
          </h5>
          <small className="text-muted">
            Exportá stock, ventas, clientes y más a tu planilla de cálculo
          </small>
        </div>
        <span className={`badge py-2 px-3 ${isConnected ? 'bg-success' : 'bg-secondary'}`}>
          <i className={`fa ${isConnected ? 'fa-circle-check' : 'fa-circle-xmark'} me-1`}></i>
          {isConnected ? 'Conectado' : 'Sin conexión'}
        </span>
      </div>

      {/* ── Fila 1: Conexión + Info ───────────────────────────── */}
      <div className="row g-3 mb-3">

        {/* Configuración de conexión */}
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header border-bottom">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-link me-2 text-primary"></i>
                Conexión al Spreadsheet
              </h6>
            </div>
            <div className="card-body">
              <label className="form-label fw-semibold">
                ID del Spreadsheet
                <span className="text-danger ms-1">*</span>
              </label>
              <input
                type="text"
                className="form-control mb-1"
                placeholder="Pegá el ID o la URL completa de Google Sheets"
                value={config.spreadsheetId}
                onChange={handleSpreadsheetId}
              />
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="fa fa-circle-info me-1"></i>
                Encontralo en la URL:
                <code className="ms-1 text-success" style={{ fontSize: '0.72rem' }}>
                  docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit
                </code>
              </div>

              <div className="alert alert-info mt-3 mb-0 py-2" style={{ fontSize: '0.8rem' }}>
                <i className="fa fa-shield-halved me-2"></i>
                <strong>Cuenta de servicio:</strong> la autenticación se configura
                en el backend (Spring Boot). El ID es lo único que necesitás ingresar aquí.
              </div>

              <div className="mt-3 d-flex gap-2">
                <button
                  className="btn btn-primary flex-grow-1"
                  onClick={handleTestConnection}
                  disabled={testing || !config.spreadsheetId}
                >
                  {testing
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Verificando...</>
                    : <><i className="fa fa-plug me-2"></i>Verificar Conexión</>}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <span className="spinner-border spinner-border-sm"></span>
                    : <i className="fa fa-floppy-disk"></i>}
                </button>
              </div>

              {/* Estado de conexión inline */}
              {connectionStatus && (
                <div className={`alert mt-3 mb-0 py-2 ${connectionStatus.success ? 'alert-success' : 'alert-danger'}`}
                  style={{ fontSize: '0.82rem' }}>
                  <i className={`fa ${connectionStatus.success ? 'fa-circle-check' : 'fa-circle-xmark'} me-2`}></i>
                  {connectionStatus.success
                    ? <>Conectado a <strong>"{connectionStatus.spreadsheetName}"</strong></>
                    : connectionStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instrucciones / Pasos */}
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header border-bottom">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-circle-question me-2 text-warning"></i>
                ¿Cómo configurarlo?
              </h6>
            </div>
            <div className="card-body">
              <ol className="mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                <li>
                  Creá un <strong>Google Spreadsheet</strong> y nombrá las hojas según la tabla de abajo
                  (ej: <em>Stock, Ventas, Clientes…</em>).
                </li>
                <li>
                  Compartí el documento con la <strong>cuenta de servicio</strong> configurada en el backend
                  con permiso de <em>Editor</em>.
                </li>
                <li>
                  Copiá el <strong>ID del spreadsheet</strong> desde la URL y pegalo en el campo de la izquierda.
                </li>
                <li>
                  Hacé clic en <strong>Verificar Conexión</strong> para confirmar que el acceso es correcto.
                </li>
                <li>
                  Ajustá los nombres de las hojas (tabs) si los cambiaste, y activá las que querés sincronizar.
                </li>
              </ol>

              <div className="mt-3 p-2 rounded" style={{ background: '#f8f9fa', fontSize: '0.78rem' }}>
                <i className="fa fa-lightbulb text-warning me-2"></i>
                <strong>Tip:</strong> podés pegar la URL completa del spreadsheet directamente,
                el sistema extrae el ID automáticamente.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fila 2: Tabla de entidades ────────────────────────── */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-arrows-rotate me-2 text-success"></i>
                Sincronización de datos
              </h6>
              <button
                className="btn btn-success btn-sm"
                onClick={handleSyncAll}
                disabled={syncingAll || !isConnected || activeEntities.length === 0}
              >
                {syncingAll
                  ? <><span className="spinner-border spinner-border-sm me-1"></span>Sincronizando...</>
                  : <><i className="fa fa-rotate me-1"></i>Sincronizar Todo</>}
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}></th>
                      <th>Datos</th>
                      <th style={{ width: 180 }}>Hoja (tab)</th>
                      <th>Último sync</th>
                      <th style={{ width: 80 }}>Registros</th>
                      <th style={{ width: 90 }}>Estado</th>
                      <th style={{ width: 110 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENTITIES.map(entity => {
                      const hoja   = config.hojas[entity.key] ?? { tab: entity.key, activa: false };
                      const log    = syncLog[entity.key];
                      const isSyncing = syncingEntity === entity.key;

                      return (
                        <tr key={entity.key} className={!hoja.activa ? 'opacity-50' : ''}>
                          {/* Toggle activa */}
                          <td className="text-center align-middle">
                            <div className="form-check form-switch mb-0 d-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={hoja.activa}
                                onChange={() => handleToggleEntity(entity.key)}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          </td>

                          {/* Nombre entidad */}
                          <td className="align-middle">
                            <i
                              className={`fa ${entity.icon} me-2`}
                              style={{ color: entity.color }}
                            ></i>
                            <span className="fw-semibold">{entity.label}</span>
                          </td>

                          {/* Tab name */}
                          <td className="align-middle">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={hoja.tab}
                              onChange={e => handleTabChange(entity.key, e.target.value)}
                              disabled={!hoja.activa}
                              placeholder="Nombre de la hoja"
                            />
                          </td>

                          {/* Último sync */}
                          <td className="align-middle text-muted small">
                            {formatDate(log?.syncedAt)}
                          </td>

                          {/* Registros */}
                          <td className="align-middle text-center">
                            {log?.records != null
                              ? <span className="badge bg-light text-dark border">{log.records}</span>
                              : <span className="text-muted">—</span>}
                          </td>

                          {/* Estado */}
                          <td className="align-middle">
                            {log
                              ? <span className="badge bg-success-subtle text-success border border-success-subtle">
                                  <i className="fa fa-check me-1"></i>OK
                                </span>
                              : <span className="badge bg-secondary-subtle text-secondary border">
                                  Pendiente
                                </span>}
                          </td>

                          {/* Acción */}
                          <td className="align-middle">
                            <button
                              className="btn btn-outline-primary btn-sm w-100"
                              onClick={() => handleSyncEntity(entity.key)}
                              disabled={isSyncing || !isConnected || !hoja.activa}
                            >
                              {isSyncing
                                ? <span className="spinner-border spinner-border-sm"></span>
                                : <><i className="fa fa-upload me-1"></i>Subir</>}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fila 3: Programación + Guardar ───────────────────── */}
      <div className="row g-3">

        {/* Auto-sync */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header border-bottom">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-clock me-2 text-info"></i>
                Sincronización Automática
              </h6>
            </div>
            <div className="card-body">
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoSync"
                  checked={config.autoSync}
                  onChange={e => setConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
                />
                <label className="form-check-label fw-semibold" htmlFor="autoSync">
                  Activar sincronización automática
                </label>
              </div>

              {config.autoSync && (
                <div>
                  <label className="form-label">Intervalo de sincronización</label>
                  <select
                    className="form-select"
                    value={config.syncInterval}
                    onChange={e => setConfig(prev => ({ ...prev, syncInterval: Number(e.target.value) }))}
                  >
                    <option value={15}>Cada 15 minutos</option>
                    <option value={30}>Cada 30 minutos</option>
                    <option value={60}>Cada 1 hora</option>
                    <option value={120}>Cada 2 horas</option>
                    <option value={360}>Cada 6 horas</option>
                    <option value={1440}>Una vez al día</option>
                  </select>
                  <div className="form-text">
                    <i className="fa fa-circle-info me-1"></i>
                    La sincronización automática requiere que el backend esté activo.
                  </div>
                </div>
              )}

              {!config.autoSync && (
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                  Con la sincronización manual podés subir los datos cuando lo necesitás,
                  desde la tabla de arriba.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Guardar configuración */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header border-bottom">
              <h6 className="mb-0 fw-bold">
                <i className="fa fa-floppy-disk me-2 text-secondary"></i>
                Guardar Configuración
              </h6>
            </div>
            <div className="card-body d-flex flex-column">
              <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                Guardá los cambios en el ID del spreadsheet, los nombres de las hojas
                y las opciones de sincronización automática.
              </p>
              <div className="mt-auto">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                    : <><i className="fa fa-floppy-disk me-2"></i>Guardar Configuración</>}
                </button>
                {isConnected && (
                  <button
                    className="btn btn-outline-success w-100 mt-2"
                    onClick={handleSyncAll}
                    disabled={syncingAll || activeEntities.length === 0}
                  >
                    {syncingAll
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Sincronizando...</>
                      : <><i className="fa fa-rotate me-2"></i>Guardar y Sincronizar Todo</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsConfig;
