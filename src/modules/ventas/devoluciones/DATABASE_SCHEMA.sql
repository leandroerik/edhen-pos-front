-- ============================================
-- BASE DE DATOS - MÓDULO DE DEVOLUCIONES
-- Para tienda de ropa EDHEN
-- ============================================

-- ============================================
-- 1. TABLA PRINCIPAL: DEVOLUCIONES Y FALLAS
-- ============================================

CREATE TABLE devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único de la devolución/falla',
  
  -- Tipo y clasificación
  tipo ENUM('devueltas', 'fallas') NOT NULL COMMENT 'Tipo de registro: devolución o falla',
  
  -- Vinculación con venta (opcional)
  venta_id INT NULL COMMENT 'ID de la venta vinculada',
  venta_numero VARCHAR(50) NULL COMMENT 'Número de venta para referencia',
  
  -- Información del cliente
  cliente_id INT NULL COMMENT 'ID del cliente (puede estar sin vincular)',
  cliente VARCHAR(255) NOT NULL COMMENT 'Nombre del cliente',
  
  -- Información del producto
  producto_id INT NOT NULL COMMENT 'ID del producto',
  producto VARCHAR(255) NOT NULL COMMENT 'Nombre del producto',
  
  -- Variante (talla, color, etc.)
  variante_id VARCHAR(100) NULL COMMENT 'ID de la variante (ej: Blanco-M)',
  variante VARCHAR(100) NULL COMMENT 'Descripción de la variante',
  
  -- Detalles de la devolución
  cantidad INT NOT NULL COMMENT 'Cantidad de unidades devueltas/con falla',
  motivo VARCHAR(255) NOT NULL COMMENT 'Razón de la devolución/falla',
  descripcion TEXT NULL COMMENT 'Descripción detallada del problema',
  
  -- Reembolso (solo para devueltas)
  reembolso VARCHAR(100) NULL COMMENT 'Tipo de reembolso: Dinero devuelto, Crédito tienda, Cambio de producto, -',
  
  -- Control de stock
  stock_anterior INT NOT NULL COMMENT 'Stock antes de la operación',
  stock_posterior INT NOT NULL COMMENT 'Stock después de la operación',
  cambio_stock INT NOT NULL GENERATED ALWAYS AS (stock_posterior - stock_anterior) STORED COMMENT 'Cambio neto de stock',
  
  -- Auditoría
  registrado_por VARCHAR(100) NOT NULL COMMENT 'Usuario que registró la devolución',
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
  
  -- Timestamps
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última actualización',
  
  -- Índices
  KEY idx_tipo (tipo),
  KEY idx_cliente_id (cliente_id),
  KEY idx_venta_id (venta_id),
  KEY idx_producto_id (producto_id),
  KEY idx_fecha (fecha),
  KEY idx_tipo_fecha (tipo, fecha),
  
  -- Restricciones de integridad
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Registro de devoluciones y fallas de productos';

-- ============================================
-- 2. TABLA PARA REEMBOLSOS
-- ============================================

CREATE TABLE reembolsos_devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único del reembolso',
  
  -- Referencia a devolución
  devolucion_id INT NOT NULL COMMENT 'ID de la devolución',
  
  -- Detalles del reembolso
  tipo ENUM('Dinero devuelto', 'Crédito tienda', 'Cambio de producto') NOT NULL,
  monto DECIMAL(10, 2) NULL COMMENT 'Monto reembolsado (si aplica)',
  
  -- Método de pago/reembolso
  metodo_pago VARCHAR(100) NOT NULL COMMENT 'Cómo se realizó el reembolso',
  referencia_pago VARCHAR(255) NULL COMMENT 'Referencia del pago (transf, cheque, etc.)',
  
  -- Auditoría
  procesado_por VARCHAR(100) NOT NULL COMMENT 'Usuario que procesó el reembolso',
  fecha_procesado DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Estado
  estado ENUM('pendiente', 'procesado', 'rechazado') DEFAULT 'procesado',
  
  -- Índices
  KEY idx_devolucion_id (devolucion_id),
  KEY idx_estado (estado),
  KEY idx_fecha (fecha_procesado),
  
  FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registro de reembolsos procesados en devoluciones';

-- ============================================
-- 3. TABLA DE AUDITORÍA (OPCIONAL pero RECOMENDADA)
-- ============================================

CREATE TABLE auditoria_devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Referencia
  devolucion_id INT NULL COMMENT 'ID de la devolución modificada',
  
  -- Acción
  accion ENUM('crear', 'actualizar', 'eliminar') NOT NULL,
  
  -- Datos anteriores (JSON para flexibilidad)
  datos_anteriores JSON NULL COMMENT 'Estado anterior registrado en JSON',
  datos_nuevos JSON NULL COMMENT 'Nuevo estado en JSON',
  
  -- Quién y cuándo
  usuario_id INT NOT NULL,
  usuario_nombre VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  KEY idx_devolucion_id (devolucion_id),
  KEY idx_usuario_id (usuario_id),
  KEY idx_fecha (fecha),
  
  FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Auditoría de cambios en devoluciones';

-- ============================================
-- 4. VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista: Devoluciones con cliente y stock actualizado
CREATE OR REPLACE VIEW v_devoluciones_detalle AS
SELECT 
  d.id,
  d.tipo,
  d.venta_numero,
  d.cliente,
  d.producto,
  d.variante,
  d.cantidad,
  d.motivo,
  d.descripcion,
  d.reembolso,
  d.stock_anterior,
  d.stock_posterior,
  d.cambio_stock,
  d.registrado_por,
  d.fecha,
  CASE 
    WHEN d.tipo = 'devueltas' THEN 'Devolución'
    WHEN d.tipo = 'fallas' THEN 'Falla'
  END AS tipo_descripcion,
  DATEDIFF(NOW(), d.fecha) AS dias_desde_registro
FROM devoluciones d
ORDER BY d.fecha DESC;

-- Vista: Estadísticas por día
CREATE OR REPLACE VIEW v_estadisticas_devoluciones_diarias AS
SELECT 
  DATE(fecha) AS fecha,
  tipo,
  COUNT(*) AS cantidad_registros,
  SUM(cantidad) AS total_unidades,
  SUM(CASE WHEN stock_posterior > stock_anterior THEN cantidad ELSE 0 END) AS stock_recuperado,
  SUM(CASE WHEN stock_posterior < stock_anterior THEN cantidad ELSE 0 END) AS stock_perdido
FROM devoluciones
GROUP BY DATE(fecha), tipo
ORDER BY fecha DESC;

-- Vista: Top motivos de devolución
CREATE OR REPLACE VIEW v_motivos_frecuentes AS
SELECT 
  motivo,
  COUNT(*) AS cantidad,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM devoluciones) AS porcentaje,
  tipo
FROM devoluciones
GROUP BY motivo, tipo
ORDER BY cantidad DESC;

-- Vista: Clientes con más devoluciones
CREATE OR REPLACE VIEW v_clientes_devoluciones AS
SELECT 
  cliente_id,
  cliente,
  COUNT(*) AS total_devoluciones,
  SUM(CASE WHEN tipo = 'devueltas' THEN 1 ELSE 0 END) AS devueltas_cliente,
  SUM(CASE WHEN tipo = 'fallas' THEN 1 ELSE 0 END) AS fallas_productos,
  MAX(fecha) AS ultima_devolucion
FROM devoluciones
WHERE cliente_id IS NOT NULL
GROUP BY cliente_id, cliente
HAVING total_devoluciones > 0
ORDER BY total_devoluciones DESC;

-- ============================================
-- 5. TRIGGERS PARA MANTENER INTEGRIDAD
-- ============================================

-- Trigger: Validar que stock_posterior sea coherente con tipo
DELIMITER //
CREATE TRIGGER tr_validar_stock_devolucion
BEFORE INSERT ON devoluciones
FOR EACH ROW
BEGIN
  IF NEW.tipo = 'devueltas' THEN
    -- Para devueltas, stock debe aumentar
    IF NEW.stock_posterior <= NEW.stock_anterior THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Error: En devolución, el stock posterior debe ser mayor al anterior';
    END IF;
  ELSE
    -- Para fallas, stock debe disminuir
    IF NEW.stock_posterior >= NEW.stock_anterior THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Error: En falla, el stock posterior debe ser menor al anterior';
    END IF;
  END IF;
END//
DELIMITER ;

-- Trigger: Auditoría en inserciones
DELIMITER //
CREATE TRIGGER tr_auditoria_insert_devolucion
AFTER INSERT ON devoluciones
FOR EACH ROW
BEGIN
  INSERT INTO auditoria_devoluciones (
    devolucion_id, accion, datos_nuevos, usuario_nombre, fecha
  ) VALUES (
    NEW.id, 
    'crear',
    JSON_OBJECT(
      'tipo', NEW.tipo,
      'cliente', NEW.cliente,
      'producto', NEW.producto,
      'motivo', NEW.motivo,
      'stock_anterior', NEW.stock_anterior,
      'stock_posterior', NEW.stock_posterior
    ),
    NEW.registrado_por,
    NOW()
  );
END//
DELIMITER ;

-- ============================================
-- 6. ALMACENADOS ÚTILES
-- ============================================

-- Procedimiento: Obtener estadísticas por rango de fecha
DELIMITER //
CREATE PROCEDURE sp_estadisticas_devoluciones_rango(
  IN p_fecha_inicio DATE,
  IN p_fecha_fin DATE,
  IN p_tipo VARCHAR(50)
)
BEGIN
  SELECT 
    COUNT(*) AS total_registros,
    SUM(CASE WHEN tipo = 'devueltas' THEN 1 ELSE 0 END) AS total_devueltas,
    SUM(CASE WHEN tipo = 'fallas' THEN 1 ELSE 0 END) AS total_fallas,
    SUM(CASE WHEN tipo = 'devueltas' THEN cantidad ELSE 0 END) AS unidades_devueltas,
    SUM(CASE WHEN tipo = 'fallas' THEN cantidad ELSE 0 END) AS unidades_con_falla,
    MIN(fecha) AS primer_registro,
    MAX(fecha) AS ultimo_registro
  FROM devoluciones
  WHERE (p_tipo IS NULL OR tipo = p_tipo)
    AND DATE(fecha) BETWEEN p_fecha_inicio AND p_fecha_fin;
END//
DELIMITER ;

-- Procedimiento: Motivos recientes
DELIMITER //
CREATE PROCEDURE sp_motivos_ultimos_30_dias()
BEGIN
  SELECT 
    motivo,
    tipo,
    COUNT(*) AS cantidad,
    DATE(MAX(fecha)) AS ultimo_registro
  FROM devoluciones
  WHERE fecha >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY motivo, tipo
  ORDER BY cantidad DESC;
END//
DELIMITER ;

-- ============================================
-- 7. PERMISOS RECOMENDADOS (RBAC)
-- ============================================

-- Rol: Admin (acceso total)
-- GRANT ALL PRIVILEGES ON devoluciones.* TO 'admin'@'localhost';

-- Rol: Vendedor (crear y ver)
-- GRANT SELECT, INSERT ON devoluciones TO 'vendedor'@'localhost';

-- Rol: Reportes (solo lectura)
-- GRANT SELECT ON devoluciones TO 'reportes'@'localhost';
-- GRANT SELECT ON v_* TO 'reportes'@'localhost';

-- ============================================
-- 8. ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Para búsquedas frecuentes
CREATE INDEX idx_cliente_fecha ON devoluciones(cliente_id, fecha DESC);
CREATE INDEX idx_producto_tipo ON devoluciones(producto_id, tipo);
CREATE INDEX idx_tipo_motivo ON devoluciones(tipo, motivo);

-- Para reportes
CREATE INDEX idx_fecha_tipo_cantidad ON devoluciones(fecha, tipo, cantidad);
