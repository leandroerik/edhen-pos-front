/**
 * Componente para seleccionar valores de Atributos
 * Selector interactivo de valores con checkboxes
 */
import React, { useState } from 'react';

export const ProductAttributeValuesSelector = ({ 
  attributes = [],
  selectedAttributeValues = {}, // { atributoId: [valor1, valor2, ...] }
  onAttributeValueToggle,
  loading = false
}) => {
  const [expandedAttrs, setExpandedAttrs] = useState({});

  const toggleAttribute = (attrId) => {
    setExpandedAttrs(prev => ({
      ...prev,
      [attrId]: !prev[attrId]
    }));
  };

  const handleValueToggle = (attrId, value) => {
    const currentValues = selectedAttributeValues[attrId] || [];
    const isSelected = currentValues.includes(value);
    
    let newValues;
    if (isSelected) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onAttributeValueToggle(attrId, newValues);
  };

  if (!attributes || attributes.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="fa fa-info-circle me-2"></i>
        No hay atributos disponibles. Crea atributos primero.
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-gradient border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h6 className="mb-0 text-white fw-semibold">
          <i className="fa fa-tags me-2"></i>
          Selecciona Atributos y sus Valores
        </h6>
      </div>
      <div className="card-body p-4">
        <div className="row g-3">
          {attributes.map(attr => {
            const isExpanded = expandedAttrs[attr.id];
            const selectedValues = selectedAttributeValues[attr.id] || [];
            const attrValues = attr.valores ? attr.valores.split(',').map(v => v.trim()) : [];

            return (
              <div key={attr.id} className="col-12">
                <div className="border rounded overflow-hidden">
                  {/* Header del atributo */}
                  <button
                    className="w-100 btn btn-light text-start p-3 d-flex justify-content-between align-items-center"
                    style={{ borderBottom: isExpanded ? '2px solid #667eea' : 'none' }}
                    onClick={() => toggleAttribute(attr.id)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          background: '#f0f0f0',
                          color: '#667eea'
                        }}
                      >
                        <i className="fa fa-cube"></i>
                      </div>
                      <div className="text-start">
                        <div className="fw-semibold text-dark">{attr.nombre}</div>
                        <small className="text-muted">
                          {selectedValues.length > 0 
                            ? `${selectedValues.length} seleccionado${selectedValues.length !== 1 ? 's' : ''}`
                            : 'Ninguno seleccionado'
                          }
                        </small>
                      </div>
                    </div>
                    <i className={`fa fa-chevron-down text-muted transition-all ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* Valores del atributo */}
                  {isExpanded && (
                    <div className="p-3 bg-light">
                      <div className="row g-2">
                        {attrValues.map((value, idx) => {
                          const isSelected = selectedValues.includes(value);
                          return (
                            <div key={idx} className="col-6 col-md-4 col-lg-3">
                              <div className="form-check p-2 rounded" style={{ background: isSelected ? '#e7f5ff' : 'white', border: isSelected ? '2px solid #667eea' : '1px solid #e0e0e0' }}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`attr-${attr.id}-${idx}`}
                                  checked={isSelected}
                                  onChange={() => handleValueToggle(attr.id, value)}
                                />
                                <label 
                                  className="form-check-label fw-500 w-100 mb-0 cursor-pointer"
                                  htmlFor={`attr-${attr.id}-${idx}`}
                                  style={{ fontSize: '0.9rem' }}
                                >
                                  {value}
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductAttributeValuesSelector;
