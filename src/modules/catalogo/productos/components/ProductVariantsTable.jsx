/**
 * Componente Tabla de Variantes
 * Muestra todas las combinaciones de atributos con stock y precio
 */
import React from 'react';

export const ProductVariantsTable = ({ 
  variants = [], 
  selectedAttributes = {},
  onVariantStockChange,
  onVariantPriceChange,
  basePrecio = 0
}) => {
  if (!variants || variants.length === 0) {
    return (
      <div className="alert alert-info mb-0 border-0">
        <i className="fa fa-info-circle me-2"></i>
        Selecciona atributos arriba para generar variantes
      </div>
    );
  }

  // Obtener nombres de atributos dinámicamente
  const attributeNames = Object.keys(variants[0] || {}).filter(
    key => !['variantId', 'productoId', 'stock', 'precio'].includes(key)
  );

  // Calcular stock total
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  const getStockBadge = (stock) => {
    if (stock > 10) return <span className="badge bg-success">OK</span>;
    if (stock > 0) return <span className="badge bg-warning text-dark">Bajo</span>;
    return <span className="badge bg-danger">Agotado</span>;
  };

  return (
    <div className="card border-0 shadow-sm bg-white">
      <div className="card-header bg-white border-bottom border-primary border-2 py-3">
        <h6 className="mb-0 fw-semibold text-dark">
          <i className="fa fa-table me-2 text-primary"></i>
          Variantes Generadas ({variants.length})
        </h6>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr className="bg-light">
                {attributeNames.map((attr) => (
                  <th key={attr} className="text-capitalize fw-semibold text-dark border-0">
                    {attr}
                  </th>
                ))}
                <th className="fw-semibold text-dark border-0">Stock</th>
                <th className="fw-semibold text-dark border-0">Precio</th>
                <th className="text-center fw-semibold text-dark border-0">Estado</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, idx) => (
                <tr key={variant.variantId || idx} className="align-middle">
                  {attributeNames.map((attr) => (
                    <td key={`${variant.variantId}-${attr}`} className="fw-500">
                      {variant[attr]}
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{maxWidth: '100px'}}
                      value={variant.stock || 0}
                      min="0"
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        onVariantStockChange(variant.variantId, val);
                      }}
                    />
                  </td>
                  <td>
                    <div className="input-group input-group-sm" style={{maxWidth: '120px'}}>
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={variant.precio !== undefined && variant.precio !== null ? variant.precio : basePrecio}
                        min="0"
                        step="0.01"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || basePrecio;
                          onVariantPriceChange(variant.variantId, val);
                        }}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    {getStockBadge(variant.stock || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer con stock total */}
        <div className="bg-light p-3 border-top border-primary border-2 d-flex justify-content-end">
          <div>
            <small className="text-muted">Stock Total:</small>
            <span className="badge bg-primary ms-2" style={{fontSize: '1rem', padding: '0.5rem 0.75rem'}}>
              {totalStock} unidades
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantsTable;
