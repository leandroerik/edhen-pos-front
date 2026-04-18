import React from 'react';
import { formatCurrency } from './TPVUtils';

const TPVPaymentModal = ({
  show,
  formaPago,
  onFormaPagoChange,
  montoPagado,
  onMontoPagadoChange,
  total,
  cambio,
  onClose,
  onConfirm
}) => {
  if (!show) return null;

  const opcionesPago = [
    { id: 'efectivo', label: 'Efectivo', icon: 'money-bill' },
    { id: 'tarjeta', label: 'Tarjeta', icon: 'credit-card' },
    { id: 'cheque', label: 'Cheque', icon: 'check' },
    { id: 'transferencia', label: 'Transferencia', icon: 'exchange' }
  ];

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Forma de Pago</h5>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Seleccionar forma de pago</label>
              <div className="btn-group w-100" role="group">
                {opcionesPago.map((opcion) => (
                  <React.Fragment key={opcion.id}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="formaPago"
                      id={opcion.id}
                      value={opcion.id}
                      checked={formaPago === opcion.id}
                      onChange={(e) => onFormaPagoChange(e.target.value)}
                    />
                    <label className="btn btn-outline-primary" htmlFor={opcion.id}>
                      <i className={`fa fa-${opcion.icon} me-1`}></i>
                      {opcion.label}
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {formaPago === 'efectivo' && (
              <div className="mb-3">
                <label className="form-label">Monto Pagado</label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  value={montoPagado}
                  onChange={(e) => onMontoPagadoChange(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="bg-light p-3 rounded">
              <div className="d-flex justify-content-between mb-2">
                <span>Total a pagar:</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              {formaPago === 'efectivo' && (
                <div className="d-flex justify-content-between text-success">
                  <span>Cambio:</span>
                  <strong>{formatCurrency(cambio)}</strong>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-success btn-lg" onClick={onConfirm}>
              <i className="fa fa-check me-2"></i>Confirmar Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVPaymentModal;
