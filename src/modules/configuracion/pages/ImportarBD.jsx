import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../services/adminService';

const ImportarBD = () => {
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(true);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const backupsList = await adminService.listarBackups();
      setBackups(backupsList);
    } catch (error) {
      toast.error('Error al cargar la lista de backups');
      console.error('Error loading backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleImport = async () => {
    if (!selectedBackup) {
      toast.error('Selecciona un backup para restaurar');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que quieres restaurar la base de datos desde "${selectedBackup}"? Esto reemplazará todos los datos actuales.`)) {
      return;
    }

    setLoading(true);

    try {
      const result = await adminService.importarBaseDatos(selectedBackup);
      toast.success(result.message);
      setSelectedBackup('');
      // Recargar la lista de backups después de importar
      await loadBackups();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBackupDate = (filename) => {
    // Extraer fecha del nombre del archivo: pos_backup_2024-01-15_14-30-45.db
    const match = filename.match(/pos_backup_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})\.db/);
    if (match) {
      const date = match[1];
      const time = match[2].replace(/-/g, ':');
      return `${date} ${time}`;
    }
    return filename;
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <h1 className="h3 fw-bold">
            <i className="fa fa-database me-2 text-primary"></i>
            Restaurar Backup
          </h1>
          <p className="text-muted mb-0">
            Restaurar la base de datos desde un backup.
          </p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="fa fa-exclamation-triangle me-2"></i>
            <strong>Advertencia:</strong> Esta acción reemplazará completamente la base de datos actual.
            Se recomienda hacer un backup antes de proceder.
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Backups disponibles en el servidor:</label>

            {loadingBackups ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Cargando backups...
              </div>
            ) : backups.length === 0 ? (
              <div className="alert alert-info">
                <i className="fa fa-info-circle me-2"></i>
                No hay backups disponibles. Crea un backup primero desde la opción "Crear Backup".
              </div>
            ) : (
              <div className="row">
                {backups.map((backup, index) => (
                  <div key={index} className="col-md-6 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="backup"
                        id={`backup-${index}`}
                        value={backup}
                        checked={selectedBackup === backup}
                        onChange={(e) => setSelectedBackup(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor={`backup-${index}`}>
                        <strong>{backup}</strong>
                        <br />
                        <small className="text-muted">
                          <i className="fa fa-calendar me-1"></i>
                          {formatBackupDate(backup)}
                        </small>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleImport}
              disabled={loading || !selectedBackup || loadingBackups}
            >
              <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-upload'} me-2`}></i>
              {loading ? 'Restaurando...' : 'Restaurar Backup'}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={loadBackups}
              disabled={loadingBackups}
            >
              <i className={`fa ${loadingBackups ? 'fa-spinner fa-spin' : 'fa-refresh'} me-2`}></i>
              Actualizar lista
            </button>
          </div>

          <div className="alert alert-info mt-3">
            <i className="fa fa-info-circle me-2"></i>
            <strong>Nota:</strong> Después de restaurar, es recomendable reiniciar la aplicación
            para que los cambios se apliquen completamente.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportarBD;
