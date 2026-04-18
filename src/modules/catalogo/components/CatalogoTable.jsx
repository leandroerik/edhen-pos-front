import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para tabla genérica
 * @component
 */
const CatalogoTable = ({ 
  columns, 
  data = [], 
  onEdit, 
  onDelete, 
  onToggleActive,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="fa fa-info-circle me-2"></i>
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className="py-3">
                {col.label}
              </th>
            ))}
            <th style={{ width: '180px' }} className="text-center py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key} className="py-3">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="py-3">
                <div className="d-flex justify-content-center gap-2">
                  {onToggleActive && (
                  <button
                    className={`btn btn-sm ${row.activo ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                    onClick={() => onToggleActive(row.id, !row.activo)}
                    title={row.activo ? 'Desactivar' : 'Activar'}
                  >
                    <i className={`fa fa-power-off me-1`}></i>
                    {row.activo ? 'Desactivar' : 'Activar'}
                  </button>
                )}
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onEdit && onEdit(row)}
                    title="Editar"
                  >
                    <i className="fa fa-pen-to-square me-1"></i>
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete && onDelete(row.id)}
                    title="Eliminar"
                  >
                    <i className="fa fa-trash me-1"></i>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CatalogoTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
  loading: PropTypes.bool
};

export default CatalogoTable;
