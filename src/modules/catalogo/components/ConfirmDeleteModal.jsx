import React, { useEffect, useRef } from 'react';

const ConfirmDeleteModal = ({ nombre, entidad, onConfirm, onCancel }) => {
  const actionsRef = useRef({});
  actionsRef.current = { onConfirm, onCancel };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') actionsRef.current.onCancel();
      if (e.key === 'Enter') actionsRef.current.onConfirm();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">
              <i className="fa fa-triangle-exclamation text-warning me-2"></i>
              Eliminar {entidad}
            </h5>
          </div>
          <div className="modal-body">
            ¿Estás seguro de que querés eliminar{' '}
            <strong>{nombre}</strong>? Esta acción no se puede deshacer.
          </div>
          <div className="modal-footer border-0">
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              <i className="fa fa-trash me-2"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
