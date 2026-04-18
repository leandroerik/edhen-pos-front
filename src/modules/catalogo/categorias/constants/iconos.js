/**
 * Iconos disponibles para categorías de ropa de mujer
 * Lista simplificada de iconos de FontAwesome para tienda de indumentaria femenina
 */
export const ICONOS_CATEGORIAS = [
  // Prendas Superiores
  { value: 'fa-shirt', label: 'Remeras/Camisetas', search: 'remera,camiseta,shirt,t-shirt' },
  { value: 'fa-coat', label: 'Hoodies/Sudaderas', search: 'hoodie,sudadera,sweatshirt' },
  { value: 'fa-person-snowboarding', label: 'Chaquetas/Abrigos', search: 'chaqueta,abrigo,jacket' },
  { value: 'fa-vest', label: 'Camisas/Blusas', search: 'camisa,blusa,shirt,vest' },
  
  // Prendas Inferiores
  { value: 'fa-person-hiking', label: 'Pantalones', search: 'pantalon,pants,trousers' },
  { value: 'fa-person-running', label: 'Shorts', search: 'short,shorts' },
  { value: 'fa-person-dress', label: 'Polleras/Faldas', search: 'pollera,falda,skirt' },
  { value: 'fa-person-walking', label: 'Jeans', search: 'jean,denim,jeans' },
  
  // Vestidos
  { value: 'fa-wand-magic-sparkles', label: 'Vestidos', search: 'vestido,dress,gown' },
  
  // Calzado
  { value: 'fa-shoe-prints', label: 'Zapatillas', search: 'zapatilla,sneaker,shoe' },
  { value: 'fa-boot', label: 'Botas', search: 'bota,boot' },
  
  // Accesorios
  { value: 'fa-hat-cowboy', label: 'Gorras/Sombreros', search: 'gorro,gorra,sombrero,hat,cap' },
  { value: 'fa-bag-shopping', label: 'Bolsos/Carteras', search: 'bolso,cartera,bag' },
  { value: 'fa-backpack', label: 'Mochilas', search: 'mochila,backpack' },
  { value: 'fa-ring', label: 'Joyas', search: 'joya,jewelry,ring' },
  { value: 'fa-clock', label: 'Relojes', search: 'reloj,watch' },
  
  // Ropa Interior
  { value: 'fa-heart', label: 'Ropa Interior', search: 'interior,lingerie' },
  
  // Categorías Especiales
  { value: 'fa-star', label: 'Destacados/Ofertas', search: 'oferta,descuento,destacado,special' },
  { value: 'fa-fire', label: 'Tendencia', search: 'tendencia,trending,hot,nuevo' },
];

/**
 * Busca iconos por término de búsqueda
 * @param {string} termino - Término a buscar
 * @returns {Array} Iconos que coinciden
 */
export const buscarIconos = (termino) => {
  if (!termino) return ICONOS_CATEGORIAS;
  
  const termino_lower = termino.toLowerCase();
  return ICONOS_CATEGORIAS.filter(icono => 
    icono.label.toLowerCase().includes(termino_lower) ||
    icono.search.toLowerCase().includes(termino_lower)
  );
};

export default ICONOS_CATEGORIAS;
