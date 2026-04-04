import React from 'react';

const Reports = () => {
  const reports = [
    { title: 'Informe de Ventas', icon: 'fa-chart-line', desc: 'Análisis de ventas por período' },
    { title: 'Productos Más Vendidos', icon: 'fa-star', desc: 'Top 10 productos' },
    { title: 'Clientes Top', icon: 'fa-crown', desc: 'Mejores clientes' },
    { title: 'Análisis de Categorías', icon: 'fa-pie-chart', desc: 'Ventas por categoría' }
  ];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="h3">
          <i className="fa fa-chart-bar me-2"></i>
          Informes
        </h1>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-3">
              <label className="form-label">Desde</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Hasta</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Categoría</label>
              <select className="form-select">
                <option>Todas</option>
                <option>Electrónica</option>
                <option>Accesorios</option>
                <option>Audio</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100">
                <i className="fa fa-search me-2"></i>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reportes disponibles */}
      <div className="row">
        {reports.map((report, idx) => (
          <div key={idx} className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white p-3 rounded-circle me-3">
                    <i className={`fa ${report.icon} fa-lg`}></i>
                  </div>
                  <div>
                    <h5 className="card-title mb-1">{report.title}</h5>
                    <p className="card-text text-muted mb-0">{report.desc}</p>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-sm btn-primary">
                  <i className="fa fa-arrow-right me-2"></i>
                  Ver Reporte
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
