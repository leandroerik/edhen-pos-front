// Código de barras interno cuando la variante no tiene uno real de fábrica.
// Formato EAN-13 válido: prefijo "20" (rango 20-29 que GS1 reserva para uso
// interno/no comercial) + id de variante (10 dígitos) + dígito verificador.
// Ver docs/06-proceso-alta-de-producto.md, sección 4.
function calcularDigitoVerificadorEan13(doceDigitos: string): number {
  const suma = doceDigitos
    .split('')
    .reduce((acc, digito, i) => acc + Number(digito) * (i % 2 === 0 ? 1 : 3), 0)
  return (10 - (suma % 10)) % 10
}

export function generarCodigoBarrasInterno(varianteId: number): string {
  const doceDigitos = `20${String(varianteId).padStart(10, '0')}`
  return doceDigitos + calcularDigitoVerificadorEan13(doceDigitos)
}

// Código "genérico" a nivel producto — no identifica una variante puntual,
// junta a todas. Sirve para el flujo de escaneo del POS
// (docs/07-proceso-de-venta.md): si el código escaneado es este, se
// muestran las variantes activas del producto para elegir talle/color en
// vez de agregar una al azar. Prefijo "21" (mismo rango GS1 20-29 de uso
// interno que el de variante, pero un dígito distinto) para que nunca
// pueda coincidir con un código de variante ni haga falta validar
// unicidad cruzada: como ambos salen de un id numérico único (variante vs.
// producto), con prefijos distintos ya no pueden colisionar entre sí.
export function generarCodigoBarrasProducto(productoId: number): string {
  const doceDigitos = `21${String(productoId).padStart(10, '0')}`
  return doceDigitos + calcularDigitoVerificadorEan13(doceDigitos)
}
