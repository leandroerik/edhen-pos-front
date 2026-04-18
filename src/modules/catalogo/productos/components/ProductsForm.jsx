/**
 * Componente Form para Productos
 * Formulario simple, dinámico y profesional
 */
import React, { useState, useEffect } from 'react';
import ProductVariantsTable from './ProductVariantsTable';
import { generateBarcode, formatBarcode } from '../../utils/barcodeGenerator';
import { toast } from 'react-hot-toast';

export const ProductsForm = ({ 
  editingId, 
  formData, 
  setFormData, 
  errors, 
  onSave, 
  onCancel,
  attributes = [],
  categories = [],
  initialVariants = [],
  onVariantStockChange,
  onVariantPriceChange
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState([]); // Array de { id, values }
  const [variants, setVariants] = useState([]); // Variantes generadas
  const [stockGeneral, setStockGeneral] = useState(0); // Para productos sin atributos
  const [isLoading, setIsLoading] = useState(false); // Control de carga
  const [selectedAttrIdForAdd, setSelectedAttrIdForAdd] = useState(''); // Dropdown selector atributo
  const [selectedAttrValuesForAdd, setSelectedAttrValuesForAdd] = useState([]); // Valores seleccionados del nuevo atributo
  const [editingAttrId, setEditingAttrId] = useState(null); // Tag siendo editado

  console.log('ProductsForm - Atributos recibidos:', attributes); // DEBUG
  console.log('ProductsForm - editingId:', editingId); // DEBUG
  console.log('ProductsForm - formData:', formData); // DEBUG

  // Cargar datos al editar un producto existente O cuando cambian los props
  useEffect(() => {
    setIsLoading(true);
    console.log('📋 ProductsForm useEffect - editingId:', editingId, 'initialVariants:', initialVariants?.length || 0);
    
    // Si NO hay editingId, es un NUEVO PRODUCTO - resetear todo
    if (!editingId) {
      console.log('ℹ NUEVO PRODUCTO - reseteando estado');
      setSelectedAttributes([]);
      setVariants([]);
      setStockGeneral(0);
      setSelectedAttrIdForAdd('');
      setSelectedAttrValuesForAdd([]);
      setEditingAttrId(null);
    } 
    // Si hay editingId, es EDITAR - cargar datos
    else if (editingId && formData && Object.keys(formData).length > 0) {
      console.log('=== INICIANDO CARGA DE PRODUCTO PARA EDITAR ===');
      console.log('✓ editingId:', editingId);
      console.log('✓ initialVariants:', initialVariants?.length || 0);
      
      // Prioridad: initialVariants (del hook) > formData.variants (del estado)
      const variantsToUse = initialVariants && initialVariants.length > 0 
        ? initialVariants 
        : (formData.variants || []);
      
      // Cargar variantes si existen
      if (variantsToUse.length > 0) {
        console.log('✓ Variantes encontradas:', variantsToUse.length);
        setVariants(variantsToUse);
        
        // Reconstruir los atributos seleccionados desde las variantes
        if (formData.atributosUsados && Array.isArray(formData.atributosUsados) && formData.atributosUsados.length > 0) {
          console.log('✓ Atributos a reconstruir:', formData.atributosUsados);
          
          const reconstructedAttrs = formData.atributosUsados.map(attrName => {
            const attr = attributes.find(a => a.nombre === attrName);
            if (!attr) {
              console.warn('✗ Atributo no encontrado:', attrName);
              return null;
            }
            
            // Extraer valores únicos de las variantes para este atributo
            const values = [...new Set(variantsToUse.map(v => v[attrName]).filter(Boolean))];
            console.log(`✓ Valores para "${attrName}":`, values);
            
            return { id: attr.id, values };
          }).filter(Boolean);
          
          console.log('✓ Atributos reconstruidos:', reconstructedAttrs);
          setSelectedAttributes(reconstructedAttrs);
        }
      } else if (formData.stockGeneral !== undefined && formData.stockGeneral !== null) {
        console.log('✓ Stock general encontrado:', formData.stockGeneral);
        setStockGeneral(formData.stockGeneral || 0);
        setSelectedAttributes([]); // Sin atributos
        setVariants([]);
      }
    }
    
    setIsLoading(false);
  }, [editingId, initialVariants]);

  const handleAddAttribute = (attrId) => {
    if (!attrId || selectedAttrValuesForAdd.length === 0) return; // Debe haber valores seleccionados
    const attr = attributes.find(a => a.id === parseInt(attrId));
    if (attr) {
      const newAttributes = [...selectedAttributes, { id: attr.id, values: selectedAttrValuesForAdd }];
      setSelectedAttributes(newAttributes);
      
      // IMPORTANTE: Generar variantes inmediatamente con los nuevos atributos
      setTimeout(() => {
        generateVariantsFromSelected(newAttributes);
      }, 0);
      
      setSelectedAttrIdForAdd(''); // Limpiar selector
      setSelectedAttrValuesForAdd([]); // Limpiar valores
    }
  };

  const handleRemoveAttribute = (attrId) => {
    const newAttributes = selectedAttributes.filter(sa => sa.id !== attrId);
    setSelectedAttributes(newAttributes);
    
    // Regenerar variantes con los atributos restantes
    if (newAttributes.length > 0) {
      // Si aún hay atributos, regenera las variantes
      generateVariantsFromSelected(newAttributes);
    } else {
      // Si no hay atributos, limpiar variantes
      setVariants([]);
    }
  };

  const handleUpdateAttributeValues = (attrId, values) => {
    const updated = selectedAttributes.map(sa =>
      sa.id === attrId ? { ...sa, values } : sa
    );
    setSelectedAttributes(updated);
    // AUTO-Regenerar variantes cuando cambian valores
    generateVariantsFromSelected(updated);
  };

  const handleVariantStockChange = (variantId, stock) => {
    setVariants(prev =>
      prev.map(v =>
        v.variantId === variantId ? { ...v, stock } : v
      )
    );
  };

  const handleVariantPriceChange = (variantId, precio) => {
    setVariants(prev =>
      prev.map(v =>
        v.variantId === variantId ? { ...v, precio } : v
      )
    );
  };

  const generateVariantsFromSelected = (attrs) => {
    const hasValidSelection = attrs.every(a => a.values?.length > 0);
    
    if (!hasValidSelection || attrs.length === 0) {
      setVariants([]);
      return;
    }

    // Construir mapa de valores por nombre de atributo
    const attrMap = {};
    attrs.forEach(a => {
      const attr = attributes.find(x => x.id === a.id);
      if (attr) {
        attrMap[attr.nombre] = a.values;
      }
    });

    // Generar combinaciones cartesianas
    const generateCombinations = (attrArray, index, current) => {
      if (index === attrArray.length) {
        return [{ ...current }];
      }
      const [attrName, values] = attrArray[index];
      const results = [];
      if (values && values.length > 0) {
        values.forEach(value => {
          const newCurrent = { ...current, [attrName]: value };
          results.push(...generateCombinations(attrArray, index + 1, newCurrent));
        });
      }
      return results;
    };

    const attrArray = Object.entries(attrMap);
    const combinations = generateCombinations(attrArray, 0, {});
    
    const newVariants = combinations.map((combo, idx) => {
      // Buscar variantes antiguas que coincidan con la nueva combinación
      // Importante: permitir coincidir incluso si la variante antigua tiene atributos extras
      const matchingOldVariants = variants.filter(v => {
        return Object.keys(combo).every(key => v[key] === combo[key]);
      });

      // Si hay variantes antiguas que coinciden, sumar sus stocks
      const totalStock = matchingOldVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const basePrice = matchingOldVariants?.[0]?.precio ?? (formData.precioBase || 0);

      return {
        variantId: matchingOldVariants?.[0]?.variantId || `var-${idx}-${Date.now()}`,
        productoId: editingId || 'new',
        ...combo,
        stock: totalStock,
        precio: basePrice
      };
    });

    setVariants(newVariants);
  };

  const getAvailableAttributes = () => {
    const selectedIds = selectedAttributes.map(sa => sa.id);
    return attributes.filter(a => !selectedIds.includes(a.id));
  };

  const getAttributeValues = (attrId) => {
    const attr = attributes.find(a => a.id === attrId);
    return attr?.valores ? attr.valores.split(',').map(v => v.trim()) : [];
  };

  const getAttributeById = (attrId) => {
    return attributes.find(a => a.id === attrId);
  };

  const handleGenerateNewBarcode = () => {
    const newBarcode = generateBarcode();
    setFormData({ ...formData, codigoBarras: newBarcode });
    toast.success('Código de barras generado');
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(formData.codigoBarras);
    toast.success('Código copiado al portapapeles');
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '850px' }}>
        <div className="modal-content">
          
          {/* HEADER */}
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h5>
            <button 
              className="btn-close"
              onClick={onCancel}
            />
          </div>

          {/* BODY */}
          <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

            {/* ========== SECCIÓN 1: DATOS BÁSICOS ========== */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-3" style={{ color: '#495057' }}>
                <i className="fa fa-info-circle me-2" style={{ color: '#0d6efd' }}></i>
                Información del Producto
              </h6>

              {/* Nombre */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre *</label>
                <input
                  type="text"
                  className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Remera Premium"
                />
                {errors.nombre && <div className="invalid-feedback d-block"><i className="fa fa-exclamation-circle me-2"></i>{errors.nombre}</div>}
              </div>

              {/* Descripción */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción *</label>
                <textarea
                  className={`form-control form-control-lg ${errors.descripcion ? 'is-invalid' : ''}`}
                  rows="2"
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción del producto"
                />
                {errors.descripcion && <div className="invalid-feedback d-block"><i className="fa fa-exclamation-circle me-2"></i>{errors.descripcion}</div>}
              </div>

              {/* Row: Categoría y Precio */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Categoría *</label>
                  <select
                    className={`form-select form-select-lg ${errors.categoriaId ? 'is-invalid' : ''}`}
                    value={formData.categoriaId || ''}
                    onChange={(e) => setFormData({...formData, categoriaId: e.target.value})}
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                  {errors.categoriaId && <div className="invalid-feedback d-block"><i className="fa fa-exclamation-circle me-2"></i>{errors.categoriaId}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Precio Base *</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className={`form-control ${errors.precioBase ? 'is-invalid' : ''}`}
                      value={formData.precioBase || ''}
                      onChange={(e) => setFormData({...formData, precioBase: parseFloat(e.target.value)})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.precioBase && <div className="invalid-feedback d-block"><i className="fa fa-exclamation-circle me-2"></i>{errors.precioBase}</div>}
                </div>
              </div>

              {/* Row: Código de Barras y Estado */}
              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Código de Barras</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text"><i className="fa fa-barcode"></i></span>
                    <input
                      type="text"
                      className="form-control text-center font-monospace"
                      value={formatBarcode(formData.codigoBarras || '')}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCopyBarcode}
                      title="Copiar"
                    >
                      <i className="fa fa-copy"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleGenerateNewBarcode}
                      title="Generar nuevo"
                    >
                      <i className="fa fa-refresh"></i>
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Estado</label>
                  <div className="form-check form-switch pt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activo"
                      checked={formData.activo || false}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="activo">
                      Producto Activo
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {/* ========== SECCIÓN 2: ATRIBUTOS ========== */}
            <div className="card border-0 shadow-sm bg-white mb-4">
              <div className="card-header bg-white border-bottom border-primary border-2 py-3">
                <h6 className="mb-0 fw-semibold text-dark">
                  <i className="fa fa-layer-group me-2 text-primary"></i>
                  Atributos y Variantes
                </h6>
              </div>
              <div className="card-body p-4">
                {/* DROPDOWN para agregar atributo + valores */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">
                    <i className="fa fa-plus me-2 text-primary"></i>
                    Agregar Atributo:
                  </label>
                  
                  {/* Dropdown 1: Seleccionar atributo */}
                  <div className="input-group mb-2">
                    <select
                      className="form-select border-primary"
                      value={selectedAttrIdForAdd}
                      onChange={(e) => {
                        setSelectedAttrIdForAdd(e.target.value);
                        setSelectedAttrValuesForAdd([]); // Limpiar valores al cambiar atributo
                      }}
                    >
                      <option value="">-- Selecciona un atributo --</option>
                      {getAvailableAttributes().map(attr => (
                        <option key={attr.id} value={attr.id}>
                          {attr.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown 2: Seleccionar valores (si hay atributo seleccionado) */}
                  {selectedAttrIdForAdd && (
                    <div className="mb-2">
                      <label className="form-label fw-semibold small text-dark">
                        <i className="fa fa-check me-2 text-primary"></i>
                        Selecciona Valores:
                      </label>
                      <div className="input-group mb-2">
                        <select
                          className="form-select border-primary"
                          multiple
                          size="4"
                          value={selectedAttrValuesForAdd}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedAttrValuesForAdd(selected);
                          }}
                        >
                          {getAttributeValues(parseInt(selectedAttrIdForAdd)).map(value => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tags de valores seleccionados */}
                      {selectedAttrValuesForAdd.length > 0 && (
                        <div className="mb-3">
                          <div className="d-flex flex-wrap gap-2">
                            {selectedAttrValuesForAdd.map(value => (
                              <span key={value} className="badge bg-success">
                                <i className="fa fa-check me-1"></i>
                                {value}
                                <button
                                  type="button"
                                  className="btn-close btn-close-white p-0 ms-2"
                                  onClick={() => setSelectedAttrValuesForAdd(selectedAttrValuesForAdd.filter(v => v !== value))}
                                  style={{fontSize: '0.65rem'}}
                                />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botón Agregar */}
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={() => handleAddAttribute(selectedAttrIdForAdd)}
                        disabled={!selectedAttrIdForAdd || selectedAttrValuesForAdd.length === 0}
                      >
                        <i className="fa fa-plus me-2"></i>
                        Agregar Atributo
                      </button>
                    </div>
                  )}
                </div>

                {/* TAGS de atributos seleccionados - EDITABLES */}
                {selectedAttributes.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small mb-2 text-dark">
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
                          <div key={selected.id} className="d-flex align-items-center gap-2 position-relative">
                            <span
                              className="badge bg-info bg-opacity-10 text-info border border-info d-inline-flex align-items-center gap-2 px-3 py-2"
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
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                handleRemoveAttribute(selected.id);
                                setEditingAttrId(null);
                              }}
                              title="Eliminar atributo"
                            >
                              <i className="fa fa-times"></i>
                            </button>

                            {/* POPUP para editar valores */}
                            {isEditing && (
                              <div className="position-absolute top-100 start-0 mt-2 bg-white border border-primary rounded shadow-sm p-3"
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
                                          handleUpdateAttributeValues(selected.id, newValues);
                                        }}
                                      />
                                      <label className="form-check-label ms-1" htmlFor={`attr-${selected.id}-${value}`}>
                                        {value}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary w-100"
                                  onClick={() => setEditingAttrId(null)}
                                >
                                  <i className="fa fa-check me-2"></i>Listo
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== SECCIÓN 3: STOCK Y VARIANTES ========== */}
            {selectedAttributes.length > 0 ? (
              // Con atributos: tabla de variantes (SIEMPRE mostrar)
              <>
                {variants.length > 0 && (
                  <div className="mb-4">
                    <ProductVariantsTable
                      variants={variants}
                      selectedAttributes={selectedAttributes}
                      onVariantStockChange={handleVariantStockChange}
                      onVariantPriceChange={handleVariantPriceChange}
                      basePrecio={formData.precioBase || 0}
                    />
                  </div>
                )}
              </>
            ) : (
              // Sin atributos: stock general
              <div className="card bg-light border">
                <div className="card-body p-4">
                  <h6 className="fw-semibold mb-3">
                    <i className="fa fa-boxes me-2" style={{ color: '#0d6efd' }}></i>
                    Stock General
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Cantidad en Stock</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        value={stockGeneral}
                        onChange={(e) => setStockGeneral(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                      <small className="text-muted">Este es el único nivel de stock</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer bg-light border-top">
            <button 
              className="btn btn-secondary"
              onClick={onCancel}
            >
              <i className="fa fa-times me-2"></i>
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Validar campos obligatorios
                if (!formData.nombre?.trim()) {
                  toast.error('El nombre es obligatorio');
                  return;
                }
                if (!formData.descripcion?.trim()) {
                  toast.error('La descripción es obligatoria');
                  return;
                }
                if (!formData.categoriaId) {
                  toast.error('Debes seleccionar una categoría');
                  return;
                }
                if (!formData.precioBase || formData.precioBase < 0) {
                  toast.error('El precio base es inválido');
                  return;
                }
                if (!formData.codigoBarras) {
                  toast.error('Debe tener un código de barras');
                  return;
                }

                // Pasar datos completos incluyendo variantes
                const finalData = {
                  ...formData,
                  variants: variants,
                  stockGeneral: selectedAttributes.length === 0 ? stockGeneral : undefined,
                  atributosUsados: selectedAttributes.map(sa => {
                    const attr = attributes.find(a => a.id === sa.id);
                    return attr?.nombre;
                  }).filter(Boolean)
                };
                onSave && onSave(finalData);
              }}
            >
              <i className="fa fa-save me-2"></i>
              Guardar Producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsForm;
