import React from 'react';

const Dashboard = () => {
  const stats = [
    { title: 'Ventas Hoy', value: '$4,250.50', icon: 'fa-dollar-sign', bg: 'bg-success' },
    { title: 'Productos', value: '156', icon: 'fa-box', bg: 'bg-info' },
    { title: 'Clientes', value: '1,243', icon: 'fa-users', bg: 'bg-warning' },
    { title: 'Órdenes', value: '42', icon: 'fa-receipt', bg: 'bg-danger' }
  ];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">
          <i className="fa fa-tachometer-alt me-2"></i>
          Panel de Control
        </h1>
        <button className="btn btn-primary">
          <i className="fa fa-refresh me-2"></i>
          Actualizar
        </button>
      </div>

      {/* Cards de estadísticas */}
      <div className="row mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">{stat.title}</p>
                    <h4 className="mb-0">{stat.value}</h4>
                  </div>
                  <div className={`${stat.bg} text-white p-3 rounded-circle`} style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <i className={`fa ${stat.icon} fa-lg`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos y tablas */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Ventas Esta Semana</h5>
            </div>
            <div className="card-body" style={{minHeight: '300px'}}>
              <p className="text-muted">Gráfico en desarrollo...</p>
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Categorías Principales</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Electrónica <span className="badge bg-primary">25</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Accesorios <span className="badge bg-info">18</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Audio <span className="badge bg-warning">12</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
