import { useState } from 'react'
import { importarProductos } from '../../../api/admin.api'
import type { ResultadoImportacion } from '../../../api/admin.api'

const MAX_FILAS_PREVIEW = 6

function parsearCsv(texto: string): string[][] {
  return texto
    .split(/\r?\n/)
    .filter((linea) => linea.trim().length > 0)
    .map((linea) => {
      const celdas: string[] = []
      let actual = ''
      let enComillas = false
      for (const char of linea) {
        if (char === '"') {
          enComillas = !enComillas
        } else if (char === ',' && !enComillas) {
          celdas.push(actual)
          actual = ''
        } else {
          actual += char
        }
      }
      celdas.push(actual)
      return celdas.map((c) => c.trim())
    })
}

export function ImportarTab() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [totalFilas, setTotalFilas] = useState(0)
  const [importando, setImportando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)

  function seleccionarArchivo(file: File | null) {
    setArchivo(file)
    setPreview([])
    setTotalFilas(0)
    setResultado(null)
    setError(null)
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const filas = parsearCsv(String(reader.result ?? ''))
      setTotalFilas(Math.max(0, filas.length - 1))
      setPreview(filas.slice(0, MAX_FILAS_PREVIEW + 1))
    }
    reader.onerror = () => setError('No se pudo leer el archivo.')
    reader.readAsText(file, 'UTF-8')
  }

  async function importar() {
    if (!archivo) return
    setImportando(true)
    setError(null)
    setResultado(null)
    try {
      setResultado(await importarProductos(archivo))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al importar')
    } finally {
      setImportando(false)
    }
  }

  const headers = preview[0] ?? []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Importar productos</h2>
        <p className="text-sm text-gray-500">
          Subí un CSV con las columnas:{' '}
          <span className="font-mono text-xs">nombre, categoria, precio, [color, talla, stock, stockMinimo]</span>
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-8 hover:border-blue-300 hover:bg-blue-50/50">
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => seleccionarArchivo(e.target.files?.[0] ?? null)}
        />
        <span className="text-sm font-medium text-gray-700">
          {archivo ? archivo.name : 'Hacé clic para elegir un archivo CSV'}
        </span>
        {archivo && (
          <span className="text-xs text-gray-400">{(archivo.size / 1024).toFixed(1)} KB</span>
        )}
      </label>

      {preview.length > 1 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Vista previa · {totalFilas} fila{totalFilas === 1 ? '' : 's'} de datos
            {totalFilas > MAX_FILAS_PREVIEW && ` (mostrando ${MAX_FILAS_PREVIEW})`}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.slice(1).map((fila, i) => (
                  <tr key={i}>
                    {fila.map((celda, j) => (
                      <td key={j} className="px-3 py-1.5 text-xs text-gray-700">
                        {celda}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {resultado && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">Resultado de la importación</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-lg font-semibold text-green-700">{resultado.productosCreados}</p>
              <p className="text-xs text-green-600">Productos creados</p>
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-lg font-semibold text-blue-700">{resultado.variantesCreadas}</p>
              <p className="text-xs text-blue-600">Variantes creadas</p>
            </div>
            <div
              className={`rounded-md border px-3 py-2 ${
                resultado.errores > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p
                className={`text-lg font-semibold ${
                  resultado.errores > 0 ? 'text-red-700' : 'text-gray-500'
                }`}
              >
                {resultado.errores}
              </p>
              <p className={`text-xs ${resultado.errores > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                Errores
              </p>
            </div>
          </div>
          {resultado.mensajesError.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md bg-gray-50 p-3 text-xs text-red-600">
              {resultado.mensajesError.map((msg, i) => (
                <li key={i}>• {msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => void importar()}
          disabled={!archivo || importando}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {importando ? 'Importando...' : 'Importar'}
        </button>
      </div>
    </div>
  )
}
