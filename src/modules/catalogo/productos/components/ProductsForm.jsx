import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ProductVariantsTable from './ProductVariantsTable';
import { generateBarcode, formatBarcode } from '../../utils/barcodeGenerator';

export const FORM_INICIAL = {
  nombre:          '',
  descripcion:     '',
  categoriaId:     '',
  precioBase:      '',
  codigoBarras:    '',
  atributosUsados: [],
  variants:        [],
  activo:          true,
};

const StepIndicator = ({ step }) => (
  <div className="d-flex align-items-center gap-2 mb-4">
    <div className={`d-flex align-items-center gap-2 ${step === 1 ? 'text-primary' : 'text-success'}`}>
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
          step > 1 ? 'bg-success text-white' : 'bg-primary text-white'
        }`}
        style={{ width: 28, height: 28, fontSize: '0.8rem', flexShrink: 0 }}
      >
        {step > 1 ? <i className="fa fa-check" /> : '1'}
      </div>
      <span className="small fw-semibold">Información</span>
    </div>

    <div className="flex-grow-1 border-top mx-2" />

    <div className={`d-flex align-items-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted'}`}>
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
          step === 2 ? 'bg-primary text-white' : 'border text-muted bg-white'
        }`}
        style={{ width: 28, height: 28, fontSize: '0.8rem', flexShrink: 0 }}
      >
        2
      </div>
      <span className="small fw-semibold">Stock y variantes</span>
    </div>
  </div>
);

const ProductsForm = ({
  editingId,
  formData,
  onChange,
  errors,
  onSave,
  onCancel,
  loading,
  attributes = [],
  categories = [],
}) => {
  const [step,               setStep]               = useState(1);
  const [stepErrors,         setStepErrors]         = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [variants,           setVariants]           = useState([]);
  const [stockGeneral,       setStockGeneral]       = useState(0);

  // Init / reset al abrir modal
  useEffect(() => {
    setStep(1);
    setStepErrors({});

    if (!editingId) {
      setSelectedAttributes([]);
      setVariants([]);
      setStockGeneral(0);
      return;
    }

    const savedVariants = formData.variants || [];
    if (savedVariants.length > 0) {
      setVariants(savedVariants);
      const reconstructed = (formData.atributosUsados || [])
        .map((attrName) => {
          const attr = attributes.find((a) => a.nombre === attrName);
          if (!attr) return null;
          const values = [...new Set(savedVariants.map((v) => v[attrName]).filter(Boolean))];
          return { id: attr.id, values };
        })
        .filter(Boolean);
      setSelectedAttributes(reconstructed);
    } else {
      setStockGeneral(formData.stockGeneral || 0);
      setSelectedAttributes([]);
      setVariants([]);
    }
  }, [editingId]);

  // Si la página devuelve errores de campos del paso 1, volver al paso 1
  useEffect(() => {
    const step1Fields = ['nombre', 'descripcion', 'categoriaId', 'precioBase'];
    if (step === 2 && step1Fields.some((f) => errors[f])) setStep(1);
  }, [errors]);

  // ── Helpers de atributos ──────────────────────────────────────────────────

  const getValues = (attrId) => {
    const attr = attributes.find((a) => a.id === attrId);
    return attr?.valores ? attr.valores.split(',').map((v) => v.trim()) : [];
  };

  const isAttrSelected = (attrId) => selectedAttributes.some((sa) => sa.id === attrId);

  const getSelectedAttr = (attrId) => selectedAttributes.find((sa) => sa.id === attrId);

  const toggleAttribute = (attr) => {
    if (isAttrSelected(attr.id)) {
      const next = selectedAttributes.filter((sa) => sa.id !== attr.id);
      setSelectedAttributes(next);
      if (next.length > 0) generateVariants(next);
      else setVariants([]);
    } else {
      const next = [...selectedAttributes, { id: attr.id, values: [] }];
      setSelectedAttributes(next);
    }
  };

  const toggleValue = (attrId, value) => {
    const next = selectedAttributes.map((sa) => {
      if (sa.id !== attrId) return sa;
      const values = sa.values.includes(value)
        ? sa.values.filter((v) => v !== value)
        : [...sa.values, value];
      return { ...sa, values };
    });
    setSelectedAttributes(next);
    generateVariants(next);
  };

  const generateVariants = (attrs) => {
    const valid = attrs.filter((a) => a.values.length > 0);
    if (!valid.length) { setVariants([]); return; }

    const attrMap = valid.map((a) => ({
      name: attributes.find((x) => x.id === a.id)?.nombre || '',
      values: a.values,
    }));

    const combine = (index, current) => {
      if (index === attrMap.length) return [{ ...current }];
      return attrMap[index].values.flatMap((v) =>
        combine(index + 1, { ...current, [attrMap[index].name]: v })
      );
    };

    const combos = combine(0, {});
    const newVariants = combos.map((combo, idx) => {
      const match = variants.find((v) => Object.keys(combo).every((k) => v[k] === combo[k]));
      return {
        variantId:  match?.variantId || `var-${idx}-${Date.now()}`,
        productoId: editingId || 'new',
        ...combo,
        stock:  match?.stock  ?? 0,
        precio: match?.precio ?? parseFloat(formData.precioBase || 0),
      };
    });
    setVariants(newVariants);
  };

  const handleVariantStock = (variantId, stock) =>
    setVariants((prev) => prev.map((v) => (v.variantId === variantId ? { ...v, stock } : v)));

  const handleVariantPrice = (variantId, precio) =>
    setVariants((prev) => prev.map((v) => (v.variantId === variantId ? { ...v, precio } : v)));

  // ── Barcode ───────────────────────────────────────────────────────────────

  const handleGenerateBarcode = () => onChange('codigoBarras', generateBarcode());

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(formData.codigoBarras);
    toast.success('Código copiado al portapapeles');
  };

  // ── Paso 1 → validación local antes de avanzar ────────────────────────────

  const handleNext = () => {
    const e = {};
    if (!formData.nombre?.trim())       e.nombre      = 'El nombre es obligatorio';
    if (!formData.descripcion?.trim())  e.descripcion = 'La descripción es obligatoria';
    if (!formData.categoriaId)          e.categoriaId = 'La categoría es obligatoria';
    if (!formData.precioBase || parseFloat(formData.precioBase) < 0)
      e.precioBase = 'El precio base es inválido';
    setStepErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    const finalData = {
      ...formData,
      variants,
      stockGeneral: selectedAttributes.length === 0 ? stockGeneral : undefined,
      atributosUsados: selectedAttributes
        .filter((sa) => sa.values.length > 0)
        .map((sa) => attributes.find((a) => a.id === sa.id)?.nombre)
        .filter(Boolean),
    };
    onSave(finalData);
  };

  const allErrors = { ...stepErrors, ...errors };

  const actionsRef = useRef({});
  actionsRef.current = { onCancel, handleNext, handleGuardar, loading, step };

  useEffect(() => {
    const handler = (e) => {
      const { loading, onCancel, handleNext, handleGuardar, step } = actionsRef.current;
      if (loading) return;
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key === 'Enter' && !e.defaultPrevented && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        if (step === 1) handleNext();
        else handleGuardar();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          {/* Header */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h5>
            <button className="btn-close" onClick={onCancel} disabled={loading} />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <StepIndicator step={step} />

            {/* ── PASO 1: Información ─────────────────────────────────── */}
            {step === 1 && (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombre *</label>
                  <input
                    type="text"
                    className={`form-control ${allErrors.nombre ? 'is-invalid' : ''}`}
                    value={formData.nombre || ''}
                    onChange={(e) => onChange('nombre', e.target.value)}
                    placeholder="Ej: Remera Básica"
                    disabled={loading}
                    autoFocus
                  />
                  {allErrors.nombre && <div className="invalid-feedback d-block">{allErrors.nombre}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Descripción *</label>
                  <textarea
                    className={`form-control ${allErrors.descripcion ? 'is-invalid' : ''}`}
                    rows="2"
                    value={formData.descripcion || ''}
                    onChange={(e) => onChange('descripcion', e.target.value)}
                    placeholder="Breve descripción del producto"
                    disabled={loading}
                  />
                  {allErrors.descripcion && <div className="invalid-feedback d-block">{allErrors.descripcion}</div>}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Categoría *</label>
                    <select
                      className={`form-select ${allErrors.categoriaId ? 'is-invalid' : ''}`}
                      value={formData.categoriaId || ''}
                      onChange={(e) => onChange('categoriaId', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Seleccioná una categoría…</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                    {allErrors.categoriaId && <div className="invalid-feedback d-block">{allErrors.categoriaId}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Precio Base *</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className={`form-control ${allErrors.precioBase ? 'is-invalid' : ''}`}
                        value={formData.precioBase || ''}
                        onChange={(e) => onChange('precioBase', parseFloat(e.target.value) || '')}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                    </div>
                    {allErrors.precioBase && <div className="invalid-feedback d-block">{allErrors.precioBase}</div>}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">Código de Barras</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fa fa-barcode"></i></span>
                      <input
                        type="text"
                        className="form-control font-monospace text-center"
                        value={formatBarcode(formData.codigoBarras || '')}
                        readOnly
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={handleCopyBarcode} title="Copiar" disabled={loading}>
                        <i className="fa fa-copy"></i>
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={handleGenerateBarcode} title="Generar nuevo" disabled={loading}>
                        <i className="fa fa-refresh"></i>
                      </button>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Estado</label>
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="productoActivo"
                        checked={formData.activo ?? true}
                        onChange={(e) => onChange('activo', e.target.checked)}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="productoActivo">
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 2: Stock y variantes ────────────────────────────── */}
            {step === 2 && (
              <div>
                {/* Selector de atributos */}
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">
                    <i className="fa fa-layer-group me-2 text-primary"></i>
                    Atributos
                    <span className="text-muted fw-normal ms-2 small">
                      — seleccioná los que apliquen al producto
                    </span>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {attributes.map((attr) => {
                      const selected = isAttrSelected(attr.id);
                      return (
                        <button
                          key={attr.id}
                          type="button"
                          className={`btn btn-sm px-3 ${selected ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => toggleAttribute(attr)}
                          disabled={loading}
                        >
                          <i className={`fa ${selected ? 'fa-check' : 'fa-plus'} me-2`}></i>
                          {attr.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Valores de cada atributo seleccionado */}
                {selectedAttributes.length > 0 && (
                  <div className="mb-4">
                    {selectedAttributes.map((sel) => {
                      const attr = attributes.find((a) => a.id === sel.id);
                      const values = getValues(sel.id);
                      return (
                        <div key={sel.id} className="mb-3 p-3 border rounded">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fw-semibold small">
                              <i className="fa fa-tag me-2 text-primary"></i>
                              {attr?.nombre}
                              {sel.values.length > 0 && (
                                <span className="badge bg-primary ms-2">{sel.values.length} seleccionados</span>
                              )}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => toggleAttribute(attr)}
                              disabled={loading}
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {values.map((value) => {
                              const active = sel.values.includes(value);
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  className={`btn btn-sm ${active ? 'btn-success' : 'btn-outline-secondary'}`}
                                  onClick={() => toggleValue(sel.id, value)}
                                  disabled={loading}
                                >
                                  {active && <i className="fa fa-check me-1"></i>}
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tabla de variantes o stock general */}
                {selectedAttributes.length === 0 ? (
                  <div className="p-3 border rounded">
                    <label className="form-label fw-semibold">
                      <i className="fa fa-boxes me-2 text-primary"></i>Stock General
                    </label>
                    <div className="row">
                      <div className="col-md-5">
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={stockGeneral}
                            onChange={(e) => setStockGeneral(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            disabled={loading}
                          />
                          <span className="input-group-text">unidades</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : variants.length > 0 ? (
                  <ProductVariantsTable
                    variants={variants}
                    selectedAttributes={selectedAttributes}
                    onVariantStockChange={handleVariantStock}
                    onVariantPriceChange={handleVariantPrice}
                    basePrecio={parseFloat(formData.precioBase || 0)}
                  />
                ) : (
                  <div className="text-center text-muted py-4 border rounded">
                    <i className="fa fa-layer-group fa-2x mb-2 d-block opacity-25"></i>
                    Seleccioná valores para generar las variantes
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top">
            {step === 1 ? (
              <>
                <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                  <i className="fa fa-times me-2"></i>Cancelar
                </button>
                <button className="btn btn-primary ms-auto" onClick={handleNext} disabled={loading}>
                  Siguiente<i className="fa fa-arrow-right ms-2"></i>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline-secondary" onClick={() => setStep(1)} disabled={loading}>
                  <i className="fa fa-arrow-left me-2"></i>Anterior
                </button>
                <button className="btn btn-primary ms-auto" onClick={handleGuardar} disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Guardando…</>
                  ) : (
                    <><i className="fa fa-save me-2"></i>Guardar Producto</>
                  )}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductsForm;
