function normalizarToken(texto: string, longitud: number): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, longitud)
}

// SKU sugerido a partir de nombre de producto + color + talla, ej: "REM-BAS-NEG-S".
// Es solo una recomendación editable, no se fuerza en el formulario.
export function sugerirSku(nombreProducto: string, nombreColor: string, nombreTalla: string): string {
  const palabras = nombreProducto.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const partes = [
    ...palabras.map((palabra) => normalizarToken(palabra, 3)),
    normalizarToken(nombreColor, 3),
    normalizarToken(nombreTalla, 3),
  ]
  return partes.filter(Boolean).join('-')
}
