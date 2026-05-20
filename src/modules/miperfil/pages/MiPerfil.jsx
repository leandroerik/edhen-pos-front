import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMiPerfil } from '../hooks/useMiPerfil';

const MiPerfil = () => {
  const { user } = useAuth();
  const { formData, setFormData, errors, saving, handleSave } = useMiPerfil();

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4 align-items-center">
        <div className="col-md-8">
          <h1 className="h3 fw-bold">
            <i className="fa fa-user-circle me-2 text-primary"></i>
            Mi Perfil
          </h1>
          <p className="text-muted mb-0">
            Actualiza tus datos y revisa tu información de contacto.
          </p>
        </div>
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          <span className="badge bg-secondary fs-6">
            {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
          </span>
        </div>
      </div>

      <div className="row gy-4">
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <img
                src={formData.avatar || 'https://ui-avatars.com/api/?name=Perfil+Usuario&background=0D6EFD&color=fff'}
                alt="Avatar"
                className="rounded-circle mb-3"
                style={{ width: '120px', height: '120px', objectFit: 'cover' }}
              />
              <h5 className="card-title mb-1">{formData.nombre || 'Sin nombre'}</h5>
              <p className="text-muted mb-2">{user?.email}</p>
              <p className="small text-muted mb-1">Rol asignado</p>
              <span className="badge bg-primary text-uppercase">
                {user?.role || 'Sin rol'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label fw-semibold">Nombre completo</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Ana Pérez"
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>

              <div className="row gx-3">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@edhen.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold">Teléfono</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="11-1234-5678"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Avatar URL</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                />
                <small className="text-muted">
                  Opcional: pega la URL de tu avatar o deja el predeterminado.
                </small>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFormData({
                    nombre: user?.nombre || user?.name || '',
                    email: user?.email || '',
                    telefono: user?.telefono || '',
                    avatar: user?.avatar || ''
                  })}
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
