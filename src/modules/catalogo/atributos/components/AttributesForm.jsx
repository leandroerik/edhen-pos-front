/**
 * Componente Form para Atributos
 * Formulario modal para crear/editar atributos con sistema de tags editable
 */
import React, { useState, useEffect } from 'react';

export const AttributesForm = ({ 
  editingId, 
  formData, 
  setFormData, 
  errors, 
  onSave,
  onSaveWithValues,
  onCancel 
}) => {
  const [valueInput, setValueInput] = useState('');
  const [valueTags, setValueTags] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Inicializar tags desde formData
  useEffect(() => {
    if (formData.valores) {
      const tags = formData.valores.split(',').map(v => v.trim()).filter(v => v);
      setValueTags(tags);
    }
  }, [editingId]);

  const handleAddTag = () => {
    if (!valueInput.trim()) return;
    
    const newValue = valueInput.trim();
    if (!valueTags.includes(newValue)) {
      setValueTags([...valueTags, newValue]);
      setValueInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setValueTags(valueTags.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleDoubleClickTag = (index) => {
    setEditingIndex(index);
    setEditingValue(valueTags[index]);
  };

  const handleSaveEditTag = (index) => {
    if (!editingValue.trim()) {
      handleRemoveTag(index);
      return;
    }
    
    const newTags = [...valueTags];
    newTags[index] = editingValue.trim();
    setValueTags(newTags);
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleKeyPressInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleKeyPressEdit = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEditTag(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleSaveWithTags = () => {
    const valoresString = valueTags.join(',');
    
    if (onSaveWithValues) {
      onSaveWithValues(valoresString);
    } else {
      setFormData({ ...formData, valores: valoresString });
      onSave();
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Atributo' : 'Nuevo Atributo'}
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Nombre */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Nombre *
              </label>
              <input
                type="text"
                className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Talla, Color"
              />
              {errors.nombre && (
                <div className="invalid-feedback d-block mt-2">
                  <i className="fa fa-exclamation-circle me-2"></i>
                  {errors.nombre}
                </div>
              )}
            </div>

            {/* Tipo */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Tipo
              </label>
              <select
                className="form-select form-select-lg"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="select">Selección</option>
                <option value="text">Texto</option>
                <option value="number">Número</option>
              </select>
            </div>

            {/* Valores */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Valores
              </label>
              <div className="input-group input-group-lg mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingresa un valor y presiona Enter"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyPress={handleKeyPressInput}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleAddTag}
                >
                  <i className="fa fa-plus me-2"></i> Agregar
                </button>
              </div>

              {/* Tags Display */}
              <div className="p-4 bg-light border border-2 rounded" style={{ minHeight: '60px' }}>
                {valueTags.length === 0 ? (
                  <p className="text-muted small mb-0">
                    <i className="fa fa-info-circle me-2"></i>
                    Agrega al menos un valor arriba
                  </p>
                ) : (
                  <div>
                    {valueTags.map((tag, index) => (
                      <span key={index} className="me-2 mb-2 d-inline-block">
                        {editingIndex === index ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: '150px', display: 'inline-block' }}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyPressEdit(e, index)}
                            onBlur={() => handleSaveEditTag(index)}
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => handleDoubleClickTag(index)}
                            className="badge bg-primary"
                            style={{ cursor: 'pointer', userSelect: 'none', fontSize: '0.95rem', padding: '0.5rem 0.75rem' }}
                            title="Click para editar"
                          >
                            {tag}
                            <button
                              className="btn-close btn-close-white ms-2"
                              style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0 0.125rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(index);
                              }}
                              title="Eliminar"
                            ></button>
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              <label className="form-check-label fw-semibold" htmlFor="activo">
                Atributo Activo
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-top">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              <i className="fa fa-times me-2"></i>
              Cancelar
            </button>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleSaveWithTags}
              disabled={valueTags.length === 0}
            >
              <i className="fa fa-save me-2"></i>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributesForm;
