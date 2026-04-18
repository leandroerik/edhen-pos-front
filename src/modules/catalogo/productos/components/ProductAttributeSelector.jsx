/**
 * Componente para agregar atributos dinámicamente
 * Desplegables compacto con tags de valores seleccionados
 */
import React, { useState } from 'react';

export const ProductAttributeSelector = ({ 
  attributes = [],
  selectedAttributes = [], // Array de { id, values: [] }
  onAddAttribute,
  onRemoveAttribute,
  onUpdateAttributeValues
}) => {
  const [selectedAttrIdForAdd, setSelectedAttrIdForAdd] = useState('');
  const [editingAttrId, setEditingAttrId] = useState(null);

  console.log('ProductAttributeSelector - Atributos recibidos:', attributes); // DEBUG

  const handleAddAttribute = (attrId) => {
    if (!attrId) return;
    const attr = attributes.find(a => a.id === parseInt(attrId));
    if (attr) {
      onAddAttribute(attr);
      setSelectedAttrIdForAdd(''); // Limpiar selector
    }
  };

  const getAvailableAttributes = () => {
    const selectedIds = selectedAttributes.map(sa => sa.id);
    const available = attributes.filter(a => !selectedIds.includes(a.id));
    console.log('Atributos disponibles:', available, 'Total atributos:', attributes.length); // DEBUG
    return available;
  };

  const getAttributeValues = (attrId) => {
    const attr = attributes.find(a => a.id === attrId);
    return attr?.valores ? attr.valores.split(',').map(v => v.trim()) : [];
  };

  const getAttributeById = (attrId) => {
    return attributes.find(a => a.id === attrId);
  };

  return (
    <div className="mb-4">
      {/* Verificar si hay atributos disponibles */}
      {attributes.length === 0 && (
        <div className="alert alert-warning mb-3">
          <i className="fa fa-exclamation-triangle me-2"></i>
          <strong>Sin atributos:</strong> No se encontraron atributos en el sistema.
        </div>
      )}

      {/* Selector simple - UN solo dropdown */}
      <div className="mb-3">
        <label className="form-label fw-semibold small">
          <i className="fa fa-plus me-2 text-success"></i>
          Agregar Atributo:
        </label>
        <div className="input-group">
          <select
            className="form-select"
            value={selectedAttrIdForAdd}
            onChange={(e) => setSelectedAttrIdForAdd(e.target.value)}
          >
            <option value="">-- Selecciona un atributo --</option>
            {getAvailableAttributes().map(attr => (
              <option key={attr.id} value={attr.id}>
                {attr.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleAddAttribute(selectedAttrIdForAdd)}
            disabled={!selectedAttrIdForAdd || getAvailableAttributes().length === 0}
          >
            <i className="fa fa-plus me-2"></i>
            Agregar
          </button>
        </div>
      </div>

      {/* Tags de atributos seleccionados - EDITABLES */}
      {selectedAttributes.length > 0 && (
        <div className="mb-3">
          <label className="form-label fw-semibold small mb-2">
            <i className="fa fa-tags me-2 text-primary"></i>
            Atributos Agregados:
          </label>
          <div className="d-flex flex-wrap gap-2">
            {selectedAttributes.map((selected) => {
              const attr = getAttributeById(selected.id);
              const allValues = getAttributeValues(selected.id);
              const selectedValues = selected.values || [];
              const isEditing = editingAttrId === selected.id;

              return (
                <div key={selected.id} className="position-relative">
                  {/* Tag principal - Clickeable para editar */}
                  <span
                    className="badge bg-primary d-inline-flex align-items-center gap-2 px-3 py-2"
                    onClick={() => setEditingAttrId(editingAttrId === selected.id ? null : selected.id)}
                    style={{cursor: 'pointer', fontSize: '0.95rem'}}
                  >
                    <i className="fa fa-edit me-1"></i>
                    <strong>{attr?.nombre}:</strong>
                    <span className="ms-1">
                      {selectedValues.length > 0 
                        ? selectedValues.slice(0, 2).join(', ') + (selectedValues.length > 2 ? '...' : '')
                        : 'sin valores'}
                    </span>
                    <button
                      type="button"
                      className="btn-close btn-close-white p-0 ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAttribute(selected.id);
                        setEditingAttrId(null);
                      }}
                      style={{fontSize: '0.65rem'}}
                    />
                  </span>

                  {/* Popup expandible para editar valores */}
                  {isEditing && (
                    <div className="position-absolute top-100 start-0 mt-2 bg-white border-2 border-primary rounded shadow-lg p-3"
                         style={{zIndex: 1000, minWidth: '280px', maxWidth: '400px'}}>
                      <h6 className="mb-3 fw-semibold">
                        Valores de {attr?.nombre}:
                      </h6>
                      <div className="d-flex flex-column gap-2 mb-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {allValues.map((value) => (
                          <div key={value} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`attr-${selected.id}-${value}`}
                              checked={selectedValues.includes(value) || false}
                              onChange={(e) => {
                                let newValues = selectedValues || [];
                                if (e.target.checked) {
                                  newValues = [...newValues, value];
                                } else {
                                  newValues = newValues.filter(v => v !== value);
                                }
                                onUpdateAttributeValues(selected.id, newValues);
                              }}
                            />
                            <label 
                              className="form-check-label small"
                              htmlFor={`attr-${selected.id}-${value}`}
                            >
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted d-block pt-2 border-top">
                        Seleccionados: <strong>{selectedValues.length} de {allValues.length}</strong>
                      </small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay atributos */}
      {selectedAttributes.length === 0 && attributes.length > 0 && (
        <div className="alert alert-info alert-sm mb-0">
          <small>
            <i className="fa fa-info-circle me-2"></i>
            Sin atributos seleccionados. El producto no tendrá variantes.
          </small>
        </div>
      )}
    </div>
  );
};

export default ProductAttributeSelector;
