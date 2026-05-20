import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../services/adminService';

const ExportarBD = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      await adminService.exportarBaseDatos();
      toast.success('Base de datos exportada correctamente desde el backend');
    } catch (error) {
      toast.error(error.message || 'Error al exportar la base de datos');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <h1 className="h3 fw-bold">
            <i className="fa fa-database me-2 text-primary"></i>
            Crear Backup
          </h1>
          <p className="text-muted mb-0">
            Crear un backup de la base de datos en el servidor.
          </p>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fa fa-info-circle me-2"></i>
            <strong>Nota:</strong> Esta función crea una copia del archivo de base de datos actual
            y la guarda en la carpeta <code>backups/</code> del servidor como backup.
          </div>

          <p>
            Al hacer clic en "Crear Backup", el backend copiará el archivo <code>pos.db</code> actual
            a la carpeta de backups con un nombre que incluye la fecha y hora.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleExport}
            disabled={exporting}
          >
            <i className={`fa ${exporting ? 'fa-spinner fa-spin' : 'fa-save'} me-2`}></i>
            {exporting ? 'Creando backup...' : 'Crear Backup'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportarBD;
