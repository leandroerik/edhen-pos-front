import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { crearColor, crearTalla } from '../../api/catalogos.api'
import {
  crearProducto,
  crearVariante,
  editarProducto,
  editarVariante,
  obtenerProducto,
  type ProductoInput,
} from '../../api/productos.api'
import { VariantesEditor } from './components/VariantesEditor'
import { useCatalogos } from './hooks/useCatalogos'
import type { VarianteDraft } from './lib/varianteDraft'

export function ProductoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const esEdicion = id !== undefined

  const { categorias, colores, tallas, cargando: catalogosCargando, recargar: recargarCatalogos } =
    useCatalogos()

  const [nombre, setNombre] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [variantes, setVariantes] = useState<VarianteDraft[]>([])

  const [productoCargando, setProductoCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!esEdicion) return
    let cancelado = false
    obtenerProducto(Number(id)).then((producto) => {
      if (cancelado || !producto) return
      setNombre(producto.nombre)
      setCategoriaId(producto.categoria.id)
      setDescripcion(producto.descripcion ?? '')
      setPrecioBase(String(producto.precioBase))
      setCodigoBarras(producto.codigoBarras ?? '')
      setImagenUrl(producto.imagenUrl ?? '')
      setVariantes(
        producto.variantes.map((v) => ({
          localId: crypto.randomUUID(),
          id: v.id,
          colorId: v.color.id,
          colorNombreNuevo: '',
          colorHexNuevo: '#000000',
          tallaId: v.talla.id,
          tallaNombreNueva: '',
          tallaTipoNueva: 'ROPA_SUPERIOR',
          codigoBarras: v.codigoBarras ?? '',
          precio: v.precio !== undefined ? String(v.precio) : '',
          stock: String(v.stock),
          stockMinimo: String(v.stockMinimo),
          stockMinimoTocado: true,
          activo: v.activo,
        })),
      )
      setProductoCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [esEdicion, id])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const categoriaSeleccionada = categorias.find(
      (c) => c.id === (categoriaId ?? categorias[0]?.id),
    )
    if (!categoriaSeleccionada) return

    const productoInput: ProductoInput = {
      categoria: categoriaSeleccionada,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      precioBase: Number(precioBase),
      imagenUrl: imagenUrl.trim() || undefined,
    }

    if (!productoInput.nombre || !(productoInput.precioBase > 0)) {
      setError('Completá nombre y precio base (mayor a 0).')
      return
    }

    setGuardando(true)
    try {
      let productoId: number
      if (esEdicion) {
        productoId = Number(id)
        await editarProducto(productoId, productoInput)
      } else {
        productoId = (await crearProducto(productoInput)).id
      }

      for (const draft of variantes) {
        const color =
          draft.colorId === 'otro'
            ? draft.colorNombreNuevo.trim()
              ? await crearColor({ nombre: draft.colorNombreNuevo, codigoHex: draft.colorHexNuevo })
              : undefined
            : colores.find((c) => c.id === draft.colorId)

        const talla =
          draft.tallaId === 'otro'
            ? draft.tallaNombreNueva.trim()
              ? await crearTalla({ nombre: draft.tallaNombreNueva, tipo: draft.tallaTipoNueva })
              : undefined
            : tallas.find((t) => t.id === draft.tallaId)

        if (!color || !talla) continue

        if (draft.id === undefined) {
          await crearVariante(productoId, {
            color,
            talla,
            codigoBarras: draft.codigoBarras.trim() || undefined,
            precio: draft.precio ? Number(draft.precio) : undefined,
            stock: Number(draft.stock) || 0,
            stockMinimo: Number(draft.stockMinimo) || 0,
          })
        } else {
          await editarVariante(draft.id, {
            color,
            talla,
            codigoBarras: draft.codigoBarras.trim() || undefined,
            precio: draft.precio ? Number(draft.precio) : undefined,
            stockMinimo: Number(draft.stockMinimo) || 0,
            activo: draft.activo,
          })
        }
      }

      navigate('/productos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto')
    } finally {
      setGuardando(false)
    }
  }

  if (catalogosCargando || productoCargando) {
    return <p className="text-sm text-gray-500">Cargando...</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        {esEdicion ? 'Editar producto' : 'Nuevo producto'}
      </h1>
      {esEdicion && codigoBarras && (
        <p className="mt-1 text-xs text-gray-400">
          Código genérico (para el escáner del POS): {codigoBarras}{' '}
          <Link to={`/productos/${id}/etiqueta`} className="font-medium text-gray-500 hover:text-gray-900">
            Imprimir
          </Link>
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
          <label className="text-sm text-gray-700">
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
          </label>

          <label className="text-sm text-gray-700">
            Categoría
            <select
              value={categoriaId ?? categorias[0]?.id ?? ''}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700 sm:col-span-2">
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-700">
            Precio base
            <input
              type="number"
              min="0"
              value={precioBase}
              onChange={(e) => setPrecioBase(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
          </label>

          <label className="text-sm text-gray-700 sm:col-span-2">
            URL de imagen
            <input
              type="text"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <VariantesEditor
            variantes={variantes}
            onChange={setVariantes}
            nombreProducto={nombre}
            colores={colores}
            tallas={tallas}
            onCatalogoActualizado={recargarCatalogos}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/productos')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
