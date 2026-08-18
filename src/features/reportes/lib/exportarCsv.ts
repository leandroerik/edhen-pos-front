function escapeCsv(valor: string): string {
  if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

export function exportarCsv(
  nombreArchivo: string,
  headers: string[],
  rows: (string | number)[][],
): void {
  const lineas = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map((c) => escapeCsv(String(c))).join(',')),
  ]
  const contenido = '\uFEFF' + lineas.join('\r\n')
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombreArchivo
  link.click()
  URL.revokeObjectURL(url)
}
