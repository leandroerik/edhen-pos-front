import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de barra de búsqueda y filtrado reutilizable (compacto)
 * @component
 */
const SearchFilterBar = ({ 
  searchTerm, 
  onSearch, 
  filters = {},
  onFilterChange,
  onClear,
  filterOptions = {}
}) => {
  return (
    <div className="card mb-2 shadow-sm border-0">
      <div className="card-body p-2">
        <div className="row g-2">
          <div className="col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-0">
                <i className="fa fa-search text-secondary"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={filters[key] || ''}
                onChange={(e) => onFilterChange(key, e.target.value)}
              >
                <option value="">Todos</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="col-md-auto">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={onClear}
            >
              <i className="fa fa-times me-1"></i>
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SearchFilterBar.propTypes = {
  searchTerm: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onClear: PropTypes.func,
  filterOptions: PropTypes.object
};

export default SearchFilterBar;
