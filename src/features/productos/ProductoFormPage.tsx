import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { crearColor, crearTalla, type TallaInput } from '../../api/catalogos.api'
import {
  crearProductoConVariantes,
  crearVariante,
  editarProducto,
  editarVariante,
  obtenerProducto,
  type ProductoInput,
} from '../../api/productos.api'
import { ConfirmModal } from '../../shared/components/ConfirmModal'
import { PageSkeleton } from '../../shared/components/Skeleton'
import { VariantesEditor } from './components/VariantesEditor'
import { CategoriasModal } from './components/CategoriasModal'
import { TallesColoresModal } from './components/TallesColoresModal'
import { useCatalogos } from '../../shared/hooks/useCatalogos'
import type { VarianteDraft } from './lib/varianteDraft'

export function ProductoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const esEdicion = id !== undefined

  const { categorias, colores, tallas, cargando: catalogosCargando, recargar: recargarCatalogos } =
    useCatalogos()

  const [nombre, setNombre] = useState('')
  const [categoriaId, setCategoriaId] = useState<number>(-1) // -1 = sin categoría
  const [descripcion, setDescripcion] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [imagenRota, setImagenRota] = useState(false)
  const [variantes, setVariantes] = useState<VarianteDraft[]>([])

  const [productoCargando, setProductoCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false)
  const [modalCatalogosAbierto, setModalCatalogosAbierto] = useState(false)
  const [modalSalirAbierto, setModalSalirAbierto] = useState(false)
  const [ dirty, setDirty ] = useState(false)

  useEffect(() => {
    if (!esEdicion) return
    let cancelado = false
    obtenerProducto(Number(id)).then((producto) => {
      if (cancelado || !producto) return
      setNombre(producto.nombre)
      setCategoriaId(producto.categoria?.id ?? -1)
      setDescripcion(producto.descripcion ?? '')
      setPrecioBase(String(producto.precioBase))
      setCodigoBarras(producto.codigoBarras ?? '')
      setImagenUrl(producto.imagenUrl ?? '')
      setVariantes(
        producto.variantes.map((v) => ({
          localId: crypto.randomUUID(),
          id: v.id,
          colorId: v.color?.id ?? 'sin-color',
          colorNombreNuevo: '',
          colorHexNuevo: '#000000',
          tallaId: v.talla?.id ?? 'otro',
          tallaNombreNueva: '',
          tallaTipoNueva: 'ROPA',
          codigoBarras: v.codigoBarras ?? '',
          precio: v.precio != null && !Number.isNaN(Number(v.precio)) ? String(v.precio) : '',
          stock: String(v.stock ?? 0),
          stockMinimo: String(v.stockMinimo ?? 0),
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

  // Refresca el catálogo y descarta los borradores que quedaron apuntando a un
  // talle/color que se acaba de eliminar desde "Gestionar talles y colores".
  // Sin esto, el <select> de la variante quedaría con un id que ya no existe
  // (muestra el primero de la lista pero guarda el viejo) y al grabar enviaría
  // una referencia inexistente.
  const refrescarCatalogosYLimpiar = async () => {
    const datos = await recargarCatalogos()
    const tallaIds = new Set(datos.tallas.map((t) => t.id))
    const colorIds = new Set(datos.colores.map((c) => c.id))
    setVariantes((actuales) =>
      actuales.filter(
        (v) =>
          (v.tallaId === 'otro' || tallaIds.has(v.tallaId)) &&
          (v.colorId === 'otro' || v.colorId === 'sin-color' || colorIds.has(v.colorId)),
      ),
    )
  }

  // En el alta solo se ofrecen categorías activas: ofrecer una inactiva invita a crear
  // el producto en algo que después no aparece en los listados.
  //
  // Al editar hay un caso trampa: si el producto ya está en una categoría que
  // después se desactivó, esa categoría tiene que seguir apareciendo (marcada
  // como inactiva). Si se la saca de las <option>, el <select> queda apuntando a un
  // valor que no existe en la lista: el navegador muestra la primera opción pero el
  // estado `categoriaId` sigue teniendo el id viejo, así que la pantalla miente y al
  // guardar se manda una categoría distinta de la que se ve.
  const categoriasVisibles = useMemo(() => {
    const activas = categorias.filter((c) => c.activo !== false)
    const actual = categorias.find((c) => c.id === categoriaId)
    if (categoriaId >= 0 && actual && actual.activo === false) {
      return [...activas, actual]
    }
    return activas
  }, [categorias, categoriaId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const productoInput: ProductoInput = {
      categoriaId: categoriaId >= 0 ? categoriaId : undefined,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      precioBase: Number(precioBase),
      codigoBarras: codigoBarras.trim() || undefined,
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

        const operacionesVariantes: Promise<unknown>[] = []
        for (const draft of variantes) {
          const color =
            draft.colorId === 'otro'
              ? coloresCreados.get(draft.colorNombreNuevo.trim())
              : colores.find((c) => c.id === draft.colorId)
          const talla =
            draft.tallaId === 'otro'
              ? tallasCreadas.get(draft.tallaNombreNueva.trim())
              : tallas.find((t) => t.id === draft.tallaId)

          const colorId = color?.id ?? (typeof draft.colorId === 'number' ? draft.colorId : undefined)
          const tallaId = talla?.id ?? (typeof draft.tallaId === 'number' ? draft.tallaId : undefined)

          const pDraft = Number(draft.precio)
          const pBase = Number(precioBase)
          const precioFinal = !isNaN(pDraft) && pDraft > 0 ? pDraft : (!isNaN(pBase) && pBase > 0 ? pBase : 1)

          if (draft.id !== undefined) {
            operacionesVariantes.push(
              editarVariante(draft.id, {
                colorId,
                tallaId,
                codigoBarras: draft.codigoBarras.trim() || undefined,
                precio: precioFinal,
                stockMinimo: Number(draft.stockMinimo) || 0,
                activo: draft.activo,
              }),
            )
          } else {
            operacionesVariantes.push(
              crearVariante(Number(id), {
                colorId,
                tallaId,
                codigoBarras: draft.codigoBarras.trim() || undefined,
                precio: precioFinal,
                stock: Number(draft.stock) || 0,
                stockMinimo: Number(draft.stockMinimo) || 0,
              }),
            )
          }
        }
        await Promise.all(operacionesVariantes)
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
          codigoBarras?: string
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

          const colorId = color?.id ?? (typeof draft.colorId === 'number' ? draft.colorId : undefined)
          const tallaId = talla?.id ?? (typeof draft.tallaId === 'number' ? draft.tallaId : undefined)

          const pDraft = Number(draft.precio)
          const pBase = Number(precioBase)
          const precioFinal = !isNaN(pDraft) && pDraft > 0 ? pDraft : (!isNaN(pBase) && pBase > 0 ? pBase : 1)

          variantesInput.push({
            colorId,
            tallaId,
            codigoBarras: draft.codigoBarras.trim() || undefined,
            precio: precioFinal,
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
    return <PageSkeleton />
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

      <form onSubmit={handleSubmit} className="mt-6 max-w-4xl space-y-6">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Datos del producto</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-700">
              Nombre <span className="text-red-500">*</span>
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
                <label className="text-sm text-gray-700">
                  Categoría{' '}
                  <span className="text-xs font-normal text-gray-400">(opcional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setModalCategoriasAbierto(true)}
                  className="text-xs font-medium text-gray-700 hover:text-gray-900"
                >
                  + Gestionar categorías
                </button>
              </div>
            <select
              value={categoriaId}
              onChange={(e) => { setCategoriaId(Number(e.target.value)); markDirty() }}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value={-1}>Sin categoría</option>
              {categoriasVisibles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.activo === false ? '(Inactiva)' : ''}
                </option>
              ))}
            </select>
            </div>

            <label className="text-sm text-gray-700">
              Precio base <span className="text-red-500">*</span>
              <input
                type="number"
                min="0"
                value={precioBase}
                onChange={(e) => { setPrecioBase(e.target.value); markDirty() }}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                required
              />
            </label>

            <label className="text-sm text-gray-700">
              URL de imagen
              <input
                type="text"
                value={imagenUrl}
                onChange={(e) => { setImagenUrl(e.target.value); setImagenRota(false); markDirty() }}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
            </label>

            <label className="text-sm text-gray-700 sm:col-span-2">
              Descripción
              <textarea
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); markDirty() }}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
            </label>

            {imagenUrl.trim() && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Vista previa</p>
                <div className="mt-1 flex h-40 w-40 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                  {imagenRota ? (
                    <span className="px-2 text-center text-xs text-gray-400">
                      No se pudo cargar la imagen
                    </span>
                  ) : (
                    <img
                      src={imagenUrl}
                      alt="Vista previa del producto"
                      onError={() => setImagenRota(true)}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Variantes (color / talla)</h2>
          <div className="mt-3">
            <VariantesEditor
              variantes={variantes}
              onChange={(v) => { setVariantes(v); markDirty() }}
              colores={colores}
              tallas={tallas}
              precioBase={Number(precioBase) || 0}
              onGestionarCatalogos={() => setModalCatalogosAbierto(true)}
            />
          </div>
        </section>

        {variantes.length === 0 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Este producto todavía no tiene variantes. Sin variantes no se le puede cargar stock.
          </p>
        )}

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

      <TallesColoresModal
        abierto={modalCatalogosAbierto}
        onCerrar={() => setModalCatalogosAbierto(false)}
        onActualizado={refrescarCatalogosYLimpiar}
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
