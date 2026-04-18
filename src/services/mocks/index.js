// Mock data para productos - SOLO ROPA
export const productosData = [
  {
    id: 1,
    nombre: 'Remera de Algodón Clásica',
    sku: 'RMA-001',
    descripcion: 'Remera de algodón 100% premium, suave y cómoda',
    modelo: 'Classic-Basic',
    precioCompra: 150.00,
    precioVenta: 299.00,
    categoria: 'Remeras',
    activo: true,
    oferta: true,
    precioOferta: 249.00,
    stock: 35,
    estado: 'activo',
    icono: 'tshirt',
    tieneVariantes: true,
    atributosAplicables: ['Color', 'Talla'],
    valoresSeleccionados: {
      Color: ['Blanco', 'Negro', 'Gris', 'Azul'],
      Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    variantes: [
      { id: 'Blanco-S', Color: 'Blanco', Talla: 'S', stock: 5 },
      { id: 'Blanco-M', Color: 'Blanco', Talla: 'M', stock: 8 },
      { id: 'Blanco-L', Color: 'Blanco', Talla: 'L', stock: 3 },
      { id: 'Negro-S', Color: 'Negro', Talla: 'S', stock: 7 },
      { id: 'Negro-M', Color: 'Negro', Talla: 'M', stock: 6 },
      { id: 'Negro-L', Color: 'Negro', Talla: 'L', stock: 5 },
      { id: 'Gris-M', Color: 'Gris', Talla: 'M', stock: 4 },
      { id: 'Gris-L', Color: 'Gris', Talla: 'L', stock: 6 },
      { id: 'Azul-S', Color: 'Azul', Talla: 'S', stock: 3 },
      { id: 'Azul-M', Color: 'Azul', Talla: 'M', stock: 5 }
    ],
    codigoBarras: 'REMERA001'
  },
  {
    id: 2,
    nombre: 'Remera de Algodón Estampada',
    sku: 'RMA-002',
    descripcion: 'Remera de algodón con estampado moderno y colorido',
    modelo: 'Print-Style',
    precioCompra: 160.00,
    precioVenta: 329.00,
    categoria: 'Remeras',
    activo: true,
    stock: 28,
    estado: 'activo',
    icono: 'tshirt',
    tieneVariantes: true,
    atributosAplicables: ['Diseño', 'Talla'],
    valoresSeleccionados: {
      Diseño: ['Rosa', 'Verde', 'Naranja'],
      Talla: ['S', 'M', 'L', 'XL']
    },
    variantes: [
      { id: 'Rosa-S', Diseño: 'Rosa', Talla: 'S', stock: 4 },
      { id: 'Rosa-M', Diseño: 'Rosa', Talla: 'M', stock: 5 },
      { id: 'Verde-S', Diseño: 'Verde', Talla: 'S', stock: 6 },
      { id: 'Verde-M', Diseño: 'Verde', Talla: 'M', stock: 3 },
      { id: 'Verde-L', Diseño: 'Verde', Talla: 'L', stock: 4 },
      { id: 'Naranja-M', Diseño: 'Naranja', Talla: 'M', stock: 6 }
    ],
    codigoBarras: 'REMERA002'
  },
  {
    id: 3,
    nombre: 'Pantalón Darlón Clásico',
    sku: 'PDL-001',
    descripcion: 'Pantalón de darlón 100%, elasticidad perfecta, muy cómodo',
    modelo: 'Darlon-Classic',
    precioCompra: 200.00,
    precioVenta: 449.00,
    categoria: 'Pantalones',
    activo: true,
    oferta: true,
    precioOferta: 399.00,
    stock: 42,
    estado: 'activo',
    icono: 'socks',
    tieneVariantes: true,
    atributosAplicables: ['Color', 'Talla'],
    valoresSeleccionados: {
      Color: ['Negro', 'Gris', 'Azul', 'Beige'],
      Talla: ['XS', 'S', 'M', 'L', 'XL']
    },
    variantes: [
      { id: 'Negro-S', Color: 'Negro', Talla: 'S', stock: 6 },
      { id: 'Negro-M', Color: 'Negro', Talla: 'M', stock: 8 },
      { id: 'Negro-L', Color: 'Negro', Talla: 'L', stock: 5 },
      { id: 'Gris-S', Color: 'Gris', Talla: 'S', stock: 4 },
      { id: 'Gris-M', Color: 'Gris', Talla: 'M', stock: 7 },
      { id: 'Gris-L', Color: 'Gris', Talla: 'L', stock: 3 },
      { id: 'Azul-M', Color: 'Azul', Talla: 'M', stock: 2 },
      { id: 'Azul-L', Color: 'Azul', Talla: 'L', stock: 4 },
      { id: 'Beige-S', Color: 'Beige', Talla: 'S', stock: 3 }
    ],
    codigoBarras: 'PANTALON001'
  },
  {
    id: 4,
    nombre: 'Pantalón Darlón Ajustado',
    sku: 'PDL-002',
    descripcion: 'Pantalón de darlón ajustado al cuerpo, estilo moderno',
    modelo: 'Darlon-Fitted',
    precioCompra: 210.00,
    precioVenta: 469.00,
    categoria: 'Pantalones',
    activo: true,
    stock: 36,
    estado: 'activo',
    icono: 'socks',
    tieneVariantes: true,
    atributosAplicables: ['Color', 'Talla'],
    valoresSeleccionados: {
      Color: ['Negro', 'Bordo', 'Azul Marino'],
      Talla: ['XS', 'S', 'M', 'L', 'XL']
    },
    variantes: [
      { id: 'Negro-XS', Color: 'Negro', Talla: 'XS', stock: 2 },
      { id: 'Negro-S', Color: 'Negro', Talla: 'S', stock: 5 },
      { id: 'Negro-M', Color: 'Negro', Talla: 'M', stock: 6 },
      { id: 'Bordo-S', Color: 'Bordo', Talla: 'S', stock: 4 },
      { id: 'Bordo-M', Color: 'Bordo', Talla: 'M', stock: 5 },
      { id: 'Bordo-L', Color: 'Bordo', Talla: 'L', stock: 3 },
      { id: 'AzulM-M', Color: 'Azul Marino', Talla: 'M', stock: 7 },
      { id: 'AzulM-L', Color: 'Azul Marino', Talla: 'L', stock: 4 }
    ],
    codigoBarras: 'PANTALON002'
  },
  {
    id: 5,
    nombre: 'Buzo de Friza Premium',
    sku: 'BFZ-001',
    descripcion: 'Buzo de friza gruesa, perfecto para el frío y la comodidad',
    modelo: 'Fleece-Premium',
    precioCompra: 220.00,
    precioVenta: 499.00,
    categoria: 'Buzos',
    activo: true,
    stock: 32,
    estado: 'activo',
    icono: 'tshirt',
    tieneVariantes: true,
    atributosAplicables: ['Color', 'Talla'],
    valoresSeleccionados: {
      Color: ['Gris', 'Azul', 'Negro', 'Blanco'],
      Talla: ['S', 'M', 'L', 'XL', 'XXL']
    },
    variantes: [
      { id: 'Gris-S', Color: 'Gris', Talla: 'S', stock: 3 },
      { id: 'Gris-M', Color: 'Gris', Talla: 'M', stock: 5 },
      { id: 'Gris-L', Color: 'Gris', Talla: 'L', stock: 4 },
      { id: 'Azul-S', Color: 'Azul', Talla: 'S', stock: 2 },
      { id: 'Azul-M', Color: 'Azul', Talla: 'M', stock: 6 },
      { id: 'Azul-L', Color: 'Azul', Talla: 'L', stock: 3 },
      { id: 'Negro-M', Color: 'Negro', Talla: 'M', stock: 4 },
      { id: 'Negro-L', Color: 'Negro', Talla: 'L', stock: 5 },
      { id: 'Blanco-S', Color: 'Blanco', Talla: 'S', stock: 2 }
    ],
    codigoBarras: 'BUZO001'
  },
  {
    id: 6,
    nombre: 'Buzo de Friza Estadio',
    sku: 'BFZ-002',
    descripcion: 'Buzo de friza con bolsillos grandes, estilo casual deportivo',
    modelo: 'Fleece-Stadium',
    precioCompra: 240.00,
    precioVenta: 539.00,
    categoria: 'Buzos',
    activo: true,
    stock: 28,
    estado: 'activo',
    icono: 'tshirt',
    tieneVariantes: true,
    atributosAplicables: ['Color', 'Talla'],
    valoresSeleccionados: {
      Color: ['Gris Oscuro', 'Negro', 'Azul Cielo'],
      Talla: ['S', 'M', 'L', 'XL']
    },
    variantes: [
      { id: 'GrisO-S', Color: 'Gris Oscuro', Talla: 'S', stock: 3 },
      { id: 'GrisO-M', Color: 'Gris Oscuro', Talla: 'M', stock: 4 },
      { id: 'GrisO-L', Color: 'Gris Oscuro', Talla: 'L', stock: 2 },
      { id: 'Negro-S', Color: 'Negro', Talla: 'S', stock: 5 },
      { id: 'Negro-M', Color: 'Negro', Talla: 'M', stock: 6 },
      { id: 'Negro-L', Color: 'Negro', Talla: 'L', stock: 4 },
      { id: 'AzulC-M', Color: 'Azul Cielo', Talla: 'M', stock: 3 },
      { id: 'AzulC-L', Color: 'Azul Cielo', Talla: 'L', stock: 4 }
    ],
    codigoBarras: 'BUZO002'
  }
];

// Mock data para clientes
export const clientesData = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '11-2345-6789',
    ciudad: 'Buenos Aires',
    activo: true,
    tipo: 'Mayorista',
    // Datos de envío
    nombre_envio: 'Juan',
    apellido_envio: 'Pérez',
    dni: '12345678',
    direccion: 'Av. Corrientes 3456, Piso 5',
    localidad: 'Almagro',
    provincia: 'Buenos Aires',
    codigoPostal: '1195',
    transportista: 'Transportista Genérico',
    montoMinimo: 500
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria@example.com',
    telefono: '351-4567-8901',
    ciudad: 'Córdoba',
    activo: true,
    tipo: 'Minorista',
    // Datos de envío
    nombre_envio: 'María',
    apellido_envio: 'García',
    dni: '23456789',
    direccion: 'Calle San Martín 789, Depto 2B',
    localidad: 'Nueva Córdoba',
    provincia: 'Córdoba',
    codigoPostal: '5000',
    transportista: 'Correo Argentino',
    montoMinimo: 300
  },
  {
    id: 3,
    nombre: 'Carlos López',
    email: 'carlos@example.com',
    telefono: '341-9876-5432',
    ciudad: 'Rosario',
    activo: true,
    tipo: 'Mayorista',
    // Datos de envío
    nombre_envio: 'Carlos',
    apellido_envio: 'López',
    dni: '34567890',
    direccion: 'Paseo Ribera 1234',
    localidad: 'Centro',
    provincia: 'Santa Fe',
    codigoPostal: '2000',
    transportista: 'Transportista Genérico',
    montoMinimo: 600
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    email: 'ana@example.com',
    telefono: '11-5555-5555',
    ciudad: 'La Plata',
    activo: true,
    tipo: 'Minorista',
    // Datos de envío
    nombre_envio: 'Ana',
    apellido_envio: 'Martínez',
    dni: '45678901',
    direccion: 'Calle 7 Nº 543',
    localidad: 'La Plata',
    provincia: 'Buenos Aires',
    codigoPostal: '1900',
    transportista: 'Correo Argentino',
    montoMinimo: 250
  },
  {
    id: 5,
    nombre: 'Roberto Fernández',
    email: 'roberto@example.com',
    telefono: '261-1234-5678',
    ciudad: 'Mendoza',
    activo: true,
    tipo: 'Mayorista',
    // Datos de envío
    nombre_envio: 'Roberto',
    apellido_envio: 'Fernández',
    dni: '56789012',
    direccion: 'Avenida San Bernardo 2345',
    localidad: 'Ciudad de Mendoza',
    provincia: 'Mendoza',
    codigoPostal: '5500',
    transportista: 'Transportista Genérico',
    montoMinimo: 400
  }
];

// Mock data para categorías
export const categoriasData = [
  { id: 1, nombre: 'Remeras', descripcion: 'Remeras de algodón y otros materiales', icono: 'tshirt', activo: true },
  { id: 2, nombre: 'Pantalones', descripcion: 'Pantalones de darlón, jeans y otros', icono: 'tshirt', activo: true },
  { id: 3, nombre: 'Buzos', descripcion: 'Buzos y hoodies de friza', icono: 'tshirt', activo: true },
  { id: 4, nombre: 'Ofertas', descripcion: 'Productos en promoción y liquidación', icono: 'tag', activo: true }
];

// Mock data para atributos
export const atributosData = [
  {
    id: 1,
    nombre: 'Color',
    descripcion: 'Color de la prenda',
    tipo: 'lista',
    valores: ['Blanco', 'Negro', 'Gris', 'Azul', 'Rosa', 'Verde', 'Naranja', 'Rojo', 'Beige', 'Bordo', 'Azul Marino', 'Gris Oscuro', 'Azul Cielo'],
    activo: true
  },
  {
    id: 2,
    nombre: 'Talla',
    descripcion: 'Talla de la prenda',
    tipo: 'lista',
    valores: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    activo: true
  },
  {
    id: 3,
    nombre: 'Material',
    descripcion: 'Material de la prenda',
    tipo: 'lista',
    valores: ['Algodón', 'Darlón', 'Friza', 'Lana'],
    activo: true
  }
];

// Mock data para usuarios
export const usuariosData = [
  {
    id: 1,
    nombre: 'Admin User',
    email: 'admin@edhen.com',
    telefono: '11-0000-0000',
    rol: 'admin',
    estado: 'activo',
    permisos: ['crear', 'editar', 'eliminar', 'reportes']
  },
  {
    id: 2,
    nombre: 'Vendedor Juan',
    email: 'juan.vendedor@edhen.com',
    telefono: '11-1111-1111',
    rol: 'vendedor',
    estado: 'activo',
    permisos: ['vender', 'consultar']
  },
  {
    id: 3,
    nombre: 'Gerente Almacén',
    email: 'almacen@edhen.com',
    telefono: '11-2222-2222',
    rol: 'gerente_almacen',
    estado: 'activo',
    permisos: ['editar', 'reportes', 'stock']
  }
];

// Mock data para ventas
export const ventasData = [
  {
    id: 1,
    fecha: '2026-04-01',
    hora: '10:30',
    cliente: 'Juan Pérez',
    items: 3,
    total: 1089.00,
    estado: 'Completada'
  },
  {
    id: 2,
    fecha: '2026-04-02',
    hora: '14:15',
    cliente: 'María García',
    items: 2,
    total: 598.00,
    estado: 'Completada'
  },
  {
    id: 3,
    fecha: '2026-04-03',
    hora: '16:45',
    cliente: 'Carlos López',
    items: 1,
    total: 499.00,
    estado: 'Completada'
  }
];

// Función para generar código de barras único
const generateBarcode = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PROD${timestamp}${random}`;
};

export const mockClienteService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: clientesData });
      }, 500);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: clientesData.find(c => c.id === id) });
      }, 300);
    });
  },
  crear: async (cliente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoCliente = { ...cliente, id: clientesData.length + 1 };
        clientesData.push(nuevoCliente);
        resolve({ data: nuevoCliente });
      }, 500);
    });
  },
  actualizar: async (id, cliente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = clientesData.findIndex(c => c.id === id);
        if (idx !== -1) {
          clientesData[idx] = { ...clientesData[idx], ...cliente };
        }
        resolve({ data: clientesData[idx] });
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = clientesData.findIndex(c => c.id === id);
        if (idx !== -1) {
          clientesData.splice(idx, 1);
        }
        resolve({ data: { success: true } });
      }, 500);
    });
  }
};

export const mockProductoService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: productosData });
      }, 500);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: productosData.find(p => p.id === id) });
      }, 300);
    });
  },
  // Buscar por código de barras (para escáner TPV)
  buscarPorCodigo: async (codigo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const producto = productosData.find(p => p.codigoBarras === codigo);
        if (producto) {
          resolve({ data: producto });
        } else {
          reject({ 
            response: { 
              status: 404, 
              data: { message: `Código no encontrado: ${codigo}` } 
            } 
          });
        }
      }, 300);
    });
  },
  // Buscar por nombre (para búsqueda general)
  buscarPorNombre: async (nombre) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const resultados = productosData.filter(p =>
          p.nombre.toLowerCase().includes(nombre.toLowerCase()) ||
          p.sku.toLowerCase().includes(nombre.toLowerCase())
        );
        resolve({ data: resultados });
      }, 300);
    });
  },
  // Obtener producto consolidado (con variantes resumidas)
  obtenerConsolidado: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const producto = productosData.find(p => p.id === parseInt(id));
        if (producto) {
          resolve({ data: producto });
        } else {
          reject({ 
            response: { 
              status: 404, 
              data: { message: 'Producto no encontrado' } 
            } 
          });
        }
      }, 300);
    });
  },
  crear: async (producto) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoProducto = { 
          ...producto, 
          id: productosData.length + 1,
          codigoBarras: generateBarcode()
        };
        productosData.push(nuevoProducto);
        resolve({ data: nuevoProducto });
      }, 500);
    });
  },
  actualizar: async (id, producto) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = productosData.findIndex(p => p.id === id);
        if (idx !== -1) {
          productosData[idx] = { ...productosData[idx], ...producto };
        }
        resolve({ data: productosData[idx] });
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = productosData.findIndex(p => p.id === id);
        if (idx !== -1) {
          productosData.splice(idx, 1);
        }
        resolve({ data: { success: true } });
      }, 500);
    });
  }
};

export const mockCategoriaService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: categoriasData });
      }, 300);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const categoria = categoriasData.find(c => c.id === id);
        if (categoria) {
          resolve({ data: categoria });
        } else {
          reject({ response: { status: 404, data: { message: 'Categoría no encontrada' } } });
        }
      }, 300);
    });
  },
  crear: async (categoria) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaCategoria = {
          ...categoria,
          id: Math.max(...categoriasData.map(c => c.id), 0) + 1,
          activo: true
        };
        categoriasData.push(nuevaCategoria);
        resolve({ data: nuevaCategoria });
      }, 500);
    });
  },
  actualizar: async (id, categoria) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = categoriasData.findIndex(c => c.id === id);
        if (idx !== -1) {
          categoriasData[idx] = { ...categoriasData[idx], ...categoria };
          resolve({ data: categoriasData[idx] });
        } else {
          reject({ response: { status: 404, data: { message: 'Categoría no encontrada' } } });
        }
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = categoriasData.findIndex(c => c.id === id);
        if (idx !== -1) {
          categoriasData.splice(idx, 1);
          resolve({ data: { success: true } });
        } else {
          reject({ response: { status: 404, data: { message: 'Categoría no encontrada' } } });
        }
      }, 500);
    });
  }
};

export const mockAtributoService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: atributosData });
      }, 300);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const atributo = atributosData.find(a => a.id === id);
        if (atributo) {
          resolve({ data: atributo });
        } else {
          reject({ response: { status: 404, data: { message: 'Atributo no encontrado' } } });
        }
      }, 300);
    });
  },
  crear: async (atributo) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoAtributo = {
          ...atributo,
          id: Math.max(...atributosData.map(a => a.id), 0) + 1,
          activo: true
        };
        atributosData.push(nuevoAtributo);
        resolve({ data: nuevoAtributo });
      }, 500);
    });
  },
  actualizar: async (id, atributo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = atributosData.findIndex(a => a.id === id);
        if (idx !== -1) {
          atributosData[idx] = { ...atributosData[idx], ...atributo };
          resolve({ data: atributosData[idx] });
        } else {
          reject({ response: { status: 404, data: { message: 'Atributo no encontrado' } } });
        }
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = atributosData.findIndex(a => a.id === id);
        if (idx !== -1) {
          atributosData.splice(idx, 1);
          resolve({ data: { success: true } });
        } else {
          reject({ response: { status: 404, data: { message: 'Atributo no encontrado' } } });
        }
      }, 500);
    });
  }
};

export const mockUsuarioService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: usuariosData });
      }, 300);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usuario = usuariosData.find(u => u.id === id);
        if (usuario) {
          resolve({ data: usuario });
        } else {
          reject({ response: { status: 404, data: { message: 'Usuario no encontrado' } } });
        }
      }, 300);
    });
  },
  crear: async (usuario) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoUsuario = {
          ...usuario,
          id: Math.max(...usuariosData.map(u => u.id), 0) + 1,
          estado: 'activo'
        };
        usuariosData.push(nuevoUsuario);
        resolve({ data: nuevoUsuario });
      }, 500);
    });
  },
  actualizar: async (id, usuario) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = usuariosData.findIndex(u => u.id === id);
        if (idx !== -1) {
          usuariosData[idx] = { ...usuariosData[idx], ...usuario };
          resolve({ data: usuariosData[idx] });
        } else {
          reject({ response: { status: 404, data: { message: 'Usuario no encontrado' } } });
        }
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = usuariosData.findIndex(u => u.id === id);
        if (idx !== -1) {
          usuariosData.splice(idx, 1);
          resolve({ data: { success: true } });
        } else {
          reject({ response: { status: 404, data: { message: 'Usuario no encontrado' } } });
        }
      }, 500);
    });
  }
};

export const mockSkuService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: [] });
      }, 500);
    });
  }
};

export const mockVentaService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: ventasData });
      }, 500);
    });
  },
  crear: async (venta) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaVenta = { ...venta, id: ventasData.length + 1, source: 'api' };
        ventasData.push(nuevaVenta);
        resolve({ data: nuevaVenta });
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = ventasData.findIndex((venta) => venta.id === id);
        if (index !== -1) {
          ventasData.splice(index, 1);
        }
        resolve({ data: { success: index !== -1 } });
      }, 500);
    });
  }
};

export const mockReporteService = {
  ventasPorPeriodo: async (desde, hasta) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: ventasData });
      }, 500);
    });
  },
  productosMasVendidos: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: productosData.slice(0, 10) });
      }, 500);
    });
  }
};

export const mockDocumentoService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: [] });
      }, 500);
    });
  }
};

// Mock data para devoluciones y fallas
export const devolucionesData = [
  {
    id: 1,
    tipo: 'devueltas',
    ventaId: 1,
    ventaNumero: 1001,
    clienteId: 5,
    cliente: 'Juan Pérez',
    productoId: 1,
    producto: 'Remera de Algodón Clásica',
    varianteId: 'Blanco-M',
    variante: 'Blanco-M',
    cantidad: 1,
    motivo: 'Cambio de talla',
    descripcion: 'El cliente requería talla L en lugar de M, no encaja bien',
    reembolso: 'Cambio de producto',
    stockAnterior: 8,
    stockPosterior: 9,
    registradoPor: 'admin',
    fecha: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    tipo: 'fallas',
    ventaId: 2,
    ventaNumero: 1002,
    clienteId: 6,
    cliente: 'María García',
    productoId: 3,
    producto: 'Pantalón Darlón Clásico',
    varianteId: 'Negro-L',
    variante: 'Negro-L',
    cantidad: 1,
    motivo: 'Rotura/Costura',
    descripcion: 'Costura rota en la costura lateral izquierda. Defecto de fabricación.',
    reembolso: '-',
    stockAnterior: 5,
    stockPosterior: 4,
    registradoPor: 'admin',
    fecha: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 3,
    tipo: 'devueltas',
    ventaId: null,
    ventaNumero: null,
    clienteId: null,
    cliente: 'Sin vincular',
    productoId: 2,
    producto: 'Remera de Algodón Estampada',
    varianteId: 'Rosa-S',
    variante: 'Rosa-S',
    cantidad: 2,
    motivo: 'Color diferente',
    descripcion: 'El color del estampado no coincide con la foto del catálogo. Es mucho más pálido.',
    reembolso: 'Dinero devuelto',
    stockAnterior: 4,
    stockPosterior: 6,
    registradoPor: 'admin',
    fecha: new Date(Date.now() - 259200000).toISOString()
  }
];

export const mockDevolucionService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: devolucionesData });
      }, 500);
    });
  },

  listarPorTipo: async (tipo) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtradas = devolucionesData.filter((d) => d.tipo === tipo);
        resolve({ data: filtradas });
      }, 500);
    });
  },

  listarPorCliente: async (clienteId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtradas = devolucionesData.filter((d) => d.clienteId === clienteId);
        resolve({ data: filtradas });
      }, 500);
    });
  },

  listarPorVenta: async (ventaId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtradas = devolucionesData.filter((d) => d.ventaId === ventaId);
        resolve({ data: filtradas });
      }, 500);
    });
  },

  crear: async (devolucion) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nueva = {
          ...devolucion,
          id: Math.max(...devolucionesData.map((d) => d.id), 0) + 1,
          fecha: new Date().toISOString()
        };
        devolucionesData.push(nueva);
        resolve({ data: nueva });
      }, 500);
    });
  },

  obtener: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const devolucion = devolucionesData.find((d) => d.id === id);
        resolve({ data: devolucion || null });
      }, 500);
    });
  },

  actualizar: async (id, datos) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = devolucionesData.findIndex((d) => d.id === id);
        if (index !== -1) {
          devolucionesData[index] = { ...devolucionesData[index], ...datos };
          resolve({ data: devolucionesData[index] });
        } else {
          resolve({ data: null });
        }
      }, 500);
    });
  },

  eliminar: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = devolucionesData.findIndex((d) => d.id === id);
        if (index !== -1) {
          devolucionesData.splice(index, 1);
          resolve({ data: { success: true } });
        } else {
          resolve({ data: { success: false } });
        }
      }, 500);
    });
  },

  obtenerEstadisticas: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalDevueltas = devolucionesData.filter((d) => d.tipo === 'devueltas').length;
        const totalFallas = devolucionesData.filter((d) => d.tipo === 'fallas').length;
        const stockRecuperado = devolucionesData
          .filter((d) => d.tipo === 'devueltas')
          .reduce((sum, d) => sum + d.cantidad, 0);
        const stockPerdido = devolucionesData
          .filter((d) => d.tipo === 'fallas')
          .reduce((sum, d) => sum + d.cantidad, 0);

        resolve({
          data: {
            totalDevueltas,
            totalFallas,
            stockRecuperado,
            stockPerdido,
            motivosComunes: {
              'Cambio de talla': 15,
              'Defecto de fabricación': 8,
              'No encaja': 12,
              'Decoloración': 3,
              'Color diferente': 5
            },
            ultimasDevolucionesHoy: 2
          }
        });
      }, 500);
    });
  },

  procesarReembolso: async (devolucionId, datosReembolso) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            devolucionId,
            mensaje: `Reembolso de tipo "${datosReembolso.tipo}" procesado correctamente`
          }
        });
      }, 500);
    });
  },

  exportarCSV: async (filtros = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            url: '/downloads/devoluciones-export.csv',
            registros: devolucionesData.length
          }
        });
      }, 500);
    });
  }
};
