import React, { useState, useEffect, useRef } from 'react';
import Barcode from 'react-barcode';

const PrintBarcodesModal = ({ producto, onClose }) => {
  const { nombre, codigoBarras, variants = [], atributosUsados = [] } = producto;

  const allItems = [
    { id: 'general', label: 'General', sublabel: nombre, barcode: codigoBarras },
    ...variants.map((v, i) => ({
      id: v.variantId || `var-${i}`,
      label: atributosUsados.map((a) => v[a]).filter(Boolean).join(' / ') || `Variante ${i + 1}`,
      sublabel: nombre,
      barcode: codigoBarras,
    })),
  ];

  const [selected, setSelected] = useState(new Set(allItems.map((item) => item.id)));

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(selected.size === allItems.length ? new Set() : new Set(allItems.map((i) => i.id)));

  const selectedItems = allItems.filter((item) => selected.has(item.id));

  const actionsRef = useRef({});
  actionsRef.current = { onClose, selected };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') actionsRef.current.onClose();
      if (e.key === 'Enter' && actionsRef.current.selected.size > 0) window.print();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #barcode-print-area, #barcode-print-area * { visibility: visible; }
          #barcode-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex !important;
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px;
          }
        }
      `}</style>

      {/* Área oculta solo para impresión */}
      <div id="barcode-print-area" style={{ display: 'none' }}>
        {selectedItems.map((item) => (
          <div
            key={item.id}
            style={{ textAlign: 'center', padding: '10px 14px', border: '1px solid #ccc', borderRadius: 6 }}
          >
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{item.sublabel}</div>
            {item.id !== 'general' && (
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{item.label}</div>
            )}
            <Barcode value={item.barcode} format="EAN13" width={1.4} height={55} fontSize={10} displayValue />
          </div>
        ))}
      </div>

      <div
        className="modal d-block"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">

            <div className="modal-header border-bottom">
              <h5 className="modal-title fw-bold">
                <i className="fa fa-print me-2"></i>
                Códigos de barras — {nombre}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body p-4">

              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="text-muted small">
                  {selected.size} de {allItems.length} seleccionados
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none p-0"
                  onClick={toggleAll}
                >
                  {selected.size === allItems.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                {allItems.map((item) => {
                  const isSelected = selected.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`d-flex align-items-center gap-3 p-3 border rounded ${isSelected ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                      style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                      onClick={() => toggle(item.id)}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input flex-shrink-0 mt-0"
                        style={{ width: 18, height: 18 }}
                        checked={isSelected}
                        onChange={() => toggle(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-grow-1">
                        {item.id === 'general' ? (
                          <>
                            <div className="fw-semibold small">
                              <i className="fa fa-box me-2 text-muted"></i>Producto general
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.sublabel}</div>
                          </>
                        ) : (
                          <>
                            <div className="fw-semibold small">
                              <i className="fa fa-tag me-2 text-muted"></i>{item.label}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.sublabel}</div>
                          </>
                        )}
                      </div>

                      <div style={{ pointerEvents: 'none', flexShrink: 0 }}>
                        <Barcode
                          value={item.barcode}
                          format="EAN13"
                          width={1.1}
                          height={45}
                          fontSize={9}
                          displayValue
                          margin={0}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer border-top">
              <button className="btn btn-secondary" onClick={onClose}>
                <i className="fa fa-times me-2"></i>Cerrar
              </button>
              <button
                className="btn btn-primary ms-auto"
                onClick={() => window.print()}
                disabled={selected.size === 0}
              >
                <i className="fa fa-print me-2"></i>
                Imprimir{selected.size > 0 ? ` (${selected.size})` : ''}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PrintBarcodesModal;
