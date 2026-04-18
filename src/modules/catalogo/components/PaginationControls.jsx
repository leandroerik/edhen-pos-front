import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable de paginación
 * @component
 */
const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
      <div className="d-flex align-items-center gap-2">
        <label htmlFor="pageSize" className="form-label mb-0 small me-2">
          Mostrar:
        </label>
        <select 
          id="pageSize"
          className="form-select form-select-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ width: '100px' }}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size} items</option>
          ))}
        </select>
      </div>

      <nav aria-label="Paginación">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              title="Primera página"
            >
              <i className="fa fa-step-backward me-1"></i>
              Primera
            </button>
          </li>

          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <i className="fa fa-chevron-left"></i>
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            </>
          )}

          {pages.map(page => (
            <li 
              key={page} 
              className={`page-item ${page === currentPage ? 'active' : ''}`}
            >
              <button 
                className="page-link"
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Siguiente página"
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          </li>

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              Última
              <i className="fa fa-step-forward ms-1"></i>
            </button>
          </li>
        </ul>
      </nav>

      <div className="text-muted small">
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
      </div>
    </div>
  );
};

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number)
};

export default PaginationControls;
