export const ICONOS_CATEGORIAS = [
  // Prendas superiores
  { value: 'fa-shirt',             label: 'Remeras / Camisetas',    search: 'remera,camiseta,shirt,t-shirt,musculosa,top' },
  { value: 'fa-vest',              label: 'Camisas / Blusas',       search: 'camisa,blusa,shirt,vest,top' },
  { value: 'fa-coat',              label: 'Buzos / Hoodies',        search: 'buzo,hoodie,sudadera,sweatshirt' },
  { value: 'fa-person-snowboarding', label: 'Camperas / Abrigos',   search: 'campera,abrigo,chaqueta,jacket,parka,rompeviento' },

  // Prendas inferiores
  { value: 'fa-person-walking',    label: 'Jeans / Pantalones',     search: 'jean,denim,pantalon,pants,trousers' },
  { value: 'fa-person-hiking',     label: 'Pantalones de tela',     search: 'pantalon,gabardina,tela,formal,chino' },
  { value: 'fa-person-running',    label: 'Shorts',                 search: 'short,shorts,bermuda' },
  { value: 'fa-person-biking',     label: 'Calzas / Leggings',      search: 'calza,legging,lycra,deportivo' },
  { value: 'fa-person-dress',      label: 'Polleras / Faldas',      search: 'pollera,falda,skirt,minifalda' },

  // Vestidos y conjuntos
  { value: 'fa-wand-magic-sparkles', label: 'Vestidos',             search: 'vestido,dress,gown,enterito' },
  { value: 'fa-layer-group',       label: 'Conjuntos / Sets',       search: 'conjunto,set,coordinado,outfit,twin' },
  { value: 'fa-briefcase',         label: 'Ropa Formal',            search: 'formal,trabajo,oficina,blazer,traje,saco' },

  // Ropa deportiva y baño
  { value: 'fa-dumbbell',          label: 'Ropa Deportiva',         search: 'deportivo,gym,fitness,running,deporte,sport' },
  { value: 'fa-person-swimming',   label: 'Trajes de Baño',         search: 'bikini,malla,traje,baño,verano,swim' },

  // Ropa interior y dormir
  { value: 'fa-heart',             label: 'Ropa Interior',          search: 'interior,corpiño,bombacha,lenceria,lingerie,intima' },
  { value: 'fa-moon',              label: 'Pijamas / Ropa de dormir', search: 'pijama,pyjama,noche,dormir,sleep' },

  // Calzado
  { value: 'fa-shoe-prints',       label: 'Zapatillas',             search: 'zapatilla,sneaker,calzado,shoe,tenis' },
  { value: 'fa-boot',              label: 'Botas / Sandalias',      search: 'bota,boot,sandalia,zapato,taco' },
  { value: 'fa-socks',             label: 'Medias / Calcetines',    search: 'media,calcetin,sock,pantis,lycra' },

  // Accesorios de cabeza
  { value: 'fa-hat-cowboy',        label: 'Gorras / Sombreros',     search: 'gorro,gorra,sombrero,hat,cap,beanie,boina' },
  { value: 'fa-hat-wizard',        label: 'Gorros de lana',         search: 'gorro,lana,invierno,beanie,touca' },
  { value: 'fa-glasses',           label: 'Anteojos / Gafas',       search: 'anteojos,gafas,lentes,glasses,sunglasses,sol' },

  // Bolsos y carteras
  { value: 'fa-bag-shopping',      label: 'Bolsos / Carteras',      search: 'bolso,cartera,bag,purse,clutch,tote' },
  { value: 'fa-backpack',          label: 'Mochilas',               search: 'mochila,backpack,riñonera,bolso' },

  // Joyería y bijoutería
  { value: 'fa-ring',              label: 'Anillos / Joyas',        search: 'anillo,joya,jewelry,ring,bijouteria' },
  { value: 'fa-gem',               label: 'Bijoutería / Gemas',     search: 'gema,gem,cristal,bijouteria,collar,arete,pendiente' },
  { value: 'fa-clock',             label: 'Relojes',                search: 'reloj,watch,clock' },

  // Por clima o temporada
  { value: 'fa-sun',               label: 'Ropa de Verano',         search: 'verano,summer,calor,liviano,temporada' },
  { value: 'fa-snowflake',         label: 'Ropa de Invierno',       search: 'invierno,winter,frio,abrigo,temporada' },
  { value: 'fa-umbrella',          label: 'Impermeables / Capas',   search: 'impermeable,capa,lluvia,piloto,rain' },

  // Ropa de niñas
  { value: 'fa-baby',              label: 'Ropa de Bebé',           search: 'bebe,baby,recien nacido,infante' },
  { value: 'fa-child-reaching',    label: 'Ropa de Niñas',          search: 'niña,nena,kids,infantil,child' },

  // Categorías especiales
  { value: 'fa-palette',           label: 'Por Color / Diseño',     search: 'color,diseño,estampa,print,palette' },
  { value: 'fa-layer-group',       label: 'Colección',              search: 'coleccion,collection,temporada,linea' },
  { value: 'fa-certificate',       label: 'Novedades',              search: 'novedad,nuevo,new,estreno,lanzamiento' },
  { value: 'fa-tags',              label: 'Liquidación',            search: 'liquidacion,saldo,promo,clearance' },
  { value: 'fa-percent',           label: 'Ofertas / Descuentos',   search: 'oferta,descuento,promo,sale,promocion' },
  { value: 'fa-star',              label: 'Destacados',             search: 'destacado,featured,favorito,popular' },
  { value: 'fa-fire',              label: 'Tendencias',             search: 'tendencia,trending,hot,nuevo,moda' },
];

export const buscarIconos = (termino) => {
  if (!termino) return ICONOS_CATEGORIAS;
  const lower = termino.toLowerCase();
  return ICONOS_CATEGORIAS.filter(
    (icono) =>
      icono.label.toLowerCase().includes(lower) ||
      icono.search.toLowerCase().includes(lower)
  );
};

export default ICONOS_CATEGORIAS;
