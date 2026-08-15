import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerProducto } from '../../api/productos.api'
import { CodigoBarras } from './components/CodigoBarras'
import type { Producto, ProductoVariante } from '../../types/producto'

export function EtiquetaVariantePage() {
  const { id, varianteId } = useParams<{ id: string; varianteId: string }>()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    obtenerProducto(Number(id)).then((resultado) => {
      if (cancelado) return
      setProducto(resultado ?? null)
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [id])

  if (cargando) {
    return <p className="text-sm text-gray-500">Cargando...</p>
  }

  const variante: ProductoVariante | undefined = producto?.variantes.find(
    (v) => v.id === Number(varianteId),
  )

  if (!producto || !variante) {
    return (
      <div>
        <p className="text-sm text-gray-500">No se encontró la variante.</p>
        <Link
          to={`/productos/${id}`}
          className="mt-2 inline-block text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          ← Volver al producto
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between print:hidden">
        <Link to={`/productos/${producto.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver al producto
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Imprimir etiqueta
        </button>
      </div>

      <div className="mt-6 flex justify-center print:mt-0">
        <div
          id="imprimible"
          className="w-64 rounded-lg border border-gray-200 bg-white p-4 text-center print:w-auto print:border-0 print:p-0 print:shadow-none"
        >
          <p className="text-sm font-semibold text-gray-900">{producto.nombre}</p>
          <div className="mt-2 flex justify-center">
            <CodigoBarras valor={variante.codigoBarras ?? ''} />
          </div>
        </div>
      </div>
    </div>
  )
}
