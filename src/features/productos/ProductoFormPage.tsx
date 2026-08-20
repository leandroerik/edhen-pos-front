import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { crearColor, crearTalla, type TallaInput } from '../../api/catalogos.api'
import {
  crearProductoConVariantes,
  editarProducto,
  editarVariante,
  obtenerProducto,
  type ProductoInput,
} from '../../api/productos.api'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { VariantesEditor } from './components/VariantesEditor'
import { CategoriasModal } from './components/CategoriasModal'
import { useCatalogos } from '../../shared/hooks/useCatalogos'
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
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [modalSalirAbierto, setModalSalirAbierto] = useState(false)
  const [ dirty, setDirty ] = useState(false)

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
          colorId: v.color?.id ?? 'otro',
          colorNombreNuevo: '',
          colorHexNuevo: '#000000',
          tallaId: v.talla?.id ?? 'otro',
          tallaNombreNueva: '',
          tallaTipoNueva: 'ROPA',
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

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const markDirty = () => { if (!dirty) setDirty(true) }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const catId = categoriaId ?? categorias[0]?.id
    if (!catId) return

    const productoInput: ProductoInput = {
      categoriaId: catId,
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
      if (esEdicion) {
        await editarProducto(Number(id), productoInput)

        const coloresNuevos = new Map<string, { nombre: string; codigoHex: string }>()
        const tallasNuevas = new Map<string, TallaInput>()
        for (const draft of variantes) {
          if (draft.id === undefined) continue
          if (draft.colorId === 'otro' && draft.colorNombreNuevo.trim()) {
            coloresNuevos.set(draft.colorNombreNuevo.trim(), {
              nombre: draft.colorNombreNuevo.trim(),
              codigoHex: draft.colorHexNuevo,
            })
          }
          if (draft.tallaId === 'otro' && draft.tallaNombreNueva.trim()) {
            tallasNuevas.set(draft.tallaNombreNueva.trim(), {
              nombre: draft.tallaNombreNueva.trim(),
              tipo: draft.tallaTipoNueva,
            })
          }
        }

        const coloresCreados = new Map<string, { id: number }>()
        const tallasCreadas = new Map<string, { id: number }>()
        await Promise.all([
          ...[...coloresNuevos.values()].map(async (c) => {
            const creado = await crearColor(c)
            coloresCreados.set(c.nombre, creado)
          }),
          ...[...tallasNuevas.values()].map(async (t) => {
            const creado = await crearTalla(t)
            tallasCreadas.set(t.nombre, creado)
          }),
        ])

        const variantesAEditar: Promise<unknown>[] = []
        for (const draft of variantes) {
          if (draft.id === undefined) continue
          const color =
            draft.colorId === 'otro'
              ? coloresCreados.get(draft.colorNombreNuevo.trim())
              : colores.find((c) => c.id === draft.colorId)
          const talla =
            draft.tallaId === 'otro'
              ? tallasCreadas.get(draft.tallaNombreNueva.trim())
              : tallas.find((t) => t.id === draft.tallaId)
          if (!color || !talla) continue
          variantesAEditar.push(
            editarVariante(draft.id, {
              colorId: color.id,
              tallaId: talla.id,
              codigoBarras: draft.codigoBarras.trim() || undefined,
              precio: draft.precio ? Number(draft.precio) : Number(precioBase) || 1,
              stockMinimo: Number(draft.stockMinimo) || 0,
              activo: draft.activo,
            }),
          )
        }
        await Promise.all(variantesAEditar)
      } else {
        const coloresNuevos = new Map<string, { nombre: string; codigoHex: string }>()
        const tallasNuevas = new Map<string, TallaInput>()
        for (const draft of variantes) {
          if (draft.colorId === 'otro' && draft.colorNombreNuevo.trim()) {
            coloresNuevos.set(draft.colorNombreNuevo.trim(), {
              nombre: draft.colorNombreNuevo.trim(),
              codigoHex: draft.colorHexNuevo,
            })
          }
          if (draft.tallaId === 'otro' && draft.tallaNombreNueva.trim()) {
            tallasNuevas.set(draft.tallaNombreNueva.trim(), {
              nombre: draft.tallaNombreNueva.trim(),
              tipo: draft.tallaTipoNueva,
            })
          }
        }

        const coloresCreados = new Map<string, { id: number }>()
        const tallasCreadas = new Map<string, { id: number }>()
        await Promise.all([
          ...[...coloresNuevos.values()].map(async (c) => {
            const creado = await crearColor(c)
            coloresCreados.set(c.nombre, creado)
          }),
          ...[...tallasNuevas.values()].map(async (t) => {
            const creado = await crearTalla(t)
            tallasCreadas.set(t.nombre, creado)
          }),
        ])

        const variantesInput: Array<{
          colorId?: number
          tallaId?: number
          precio: number
          stock: number
          stockMinimo: number
        }> = []

        for (const draft of variantes) {
          const color =
            draft.colorId === 'otro'
              ? coloresCreados.get(draft.colorNombreNuevo.trim())
              : colores.find((c) => c.id === draft.colorId)
          const talla =
            draft.tallaId === 'otro'
              ? tallasCreadas.get(draft.tallaNombreNueva.trim())
              : tallas.find((t) => t.id === draft.tallaId)
          if (!color || !talla) continue

          variantesInput.push({
            colorId: color.id,
            tallaId: talla.id,
            precio: draft.precio ? Number(draft.precio) : Number(precioBase) || 1,
            stock: Number(draft.stock) || 0,
            stockMinimo: Number(draft.stockMinimo) || 0,
          })
        }

        await crearProductoConVariantes({
          ...productoInput,
          variantes: variantesInput,
        })
      }

      setDirty(false)
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
              onChange={(e) => { setNombre(e.target.value); markDirty() }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Categoría</label>
              <button
                type="button"
                onClick={() => setModalCategoriasAbierto(true)}
                className="text-xs font-medium text-gray-700 hover:text-gray-900"
              >
                + Gestionar categorías
              </button>
            </div>
            <select
              value={categoriaId ?? categorias[0]?.id ?? ''}
              onChange={(e) => { setCategoriaId(Number(e.target.value)); markDirty() }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.activo === false ? '(Inactiva)' : ''}
                </option>
              ))}
            </select>
          </div>

          <label className="text-sm text-gray-700 sm:col-span-2">
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => { setDescripcion(e.target.value); markDirty() }}
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
              onChange={(e) => { setPrecioBase(e.target.value); markDirty() }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              required
            />
          </label>

          <label className="text-sm text-gray-700 sm:col-span-2">
            URL de imagen
            <input
              type="text"
              value={imagenUrl}
              onChange={(e) => { setImagenUrl(e.target.value); markDirty() }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <VariantesEditor
            variantes={variantes}
            onChange={(v) => { setVariantes(v); markDirty() }}
            colores={colores}
            tallas={tallas}
            precioBase={Number(precioBase) || 0}
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
            onClick={() => {
              if (dirty) { setModalSalirAbierto(true); return }
              navigate('/productos')
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>

      <CategoriasModal
        abierto={modalCategoriasAbierto}
        onCerrar={() => setModalCategoriasAbierto(false)}
        onActualizado={recargarCatalogos}
      />

      <ConfirmModal
        abierto={modalSalirAbierto}
        titulo="Hay cambios sin guardar"
        mensaje="¿Seguro que querés salir? Los cambios que hiciste se van a perder."
        textoAccion="Salir sin guardar"
        variant="warning"
        onConfirmar={() => { setModalSalirAbierto(false); navigate('/productos') }}
        onCancelar={() => setModalSalirAbierto(false)}
      />
    </div>
  )
}
