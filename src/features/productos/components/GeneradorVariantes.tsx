import { useEffect, useState, type ReactNode } from 'react'
import { crearColor, crearTalla } from '../../../api/catalogos.api'
import type { Color } from '../../../types/color'
import type { Talla, TallaTipo } from '../../../types/talla'

const TIPOS_TALLA: TallaTipo[] = ['ROPA_SUPERIOR', 'ROPA_INFERIOR', 'CALZADO', 'UNICO']
// Cuántos chips de color se ven por talle antes de pasar al desplegable
// "Otros colores…" — pedido explícito para no llenar la pantalla cuando
// el catálogo de colores es largo. Como `colores` ya viene ordenado por
// uso (useCatalogos), estos primeros 3 son los que más se repiten en la
// tienda, no los primeros que se dieron de alta.
const COLORES_VISIBLES_INICIAL = 3

interface GeneradorVariantesProps {
  colores: Color[]
  tallas: Talla[]
  existentes: Array<{ colorId: number | 'otro'; tallaId: number | 'otro' }>
  onGenerar: (combinaciones: Array<{ colorId: number; tallaId: number }>) => void
  // Se llama después de crear un color/talla "otro" nuevo, para que el
  // padre vuelva a pedir el catálogo (useCatalogos().recargar) — sin esto,
  // el color quedaba usado en la variante recién creada pero no aparecía
  // como chip elegible para el resto de los talles hasta recargar la
  // página entera.
  onCatalogoActualizado: () => void
}

function Chip({
  activo,
  disabled,
  onClick,
  children,
}: {
  activo: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1 text-xs font-medium ${disabled ? 'cursor-not-allowed' : ''} ${
        activo
          ? 'bg-gray-900 text-white'
          : disabled
            ? 'bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

// Atajo para cargar muchas variantes de una: se elige un talle (chip) para
// desplegar su selector de colores, y cada color que se toca ahí genera la
// variante en el momento — sin un botón "Confirmar" aparte, para que sea
// lo más directo posible. Los chips de color/talle vienen ordenados por
// uso real en todo el catálogo (useCatalogos), más usados primero.
//
// "+ Otro color…" / "+ Otra talla…" dan de alta en el catálogo compartido
// (mismo criterio que en la tabla manual — nunca texto suelto) y generan
// la variante correspondiente al toque, para no cortar el flujo de "estoy
// cargando el talle M y me acuerdo que hay un color nuevo".
//
// "Copiar colores de <talle anterior>" replica el mismo conjunto de
// colores ya cargados en el talle previo — pensado para el caso más común
// (la mayoría de los talles de un producto vienen en los mismos colores),
// que es lo que hacía más lento cargar variante por variante.
export function GeneradorVariantes({
  colores,
  tallas,
  existentes,
  onGenerar,
  onCatalogoActualizado,
}: GeneradorVariantesProps) {
  const [tallesExpandidos, setTallesExpandidos] = useState<number[]>([])
  const [menuColorAbierto, setMenuColorAbierto] = useState<number | null>(null)
  const [tallaNuevaAbierta, setTallaNuevaAbierta] = useState(false)
  const [nombreTallaNueva, setNombreTallaNueva] = useState('')
  const [tipoTallaNueva, setTipoTallaNueva] = useState<TallaTipo>('ROPA_SUPERIOR')
  const [colorNuevoEnTalla, setColorNuevoEnTalla] = useState<number | null>(null)
  const [nombreColorNuevo, setNombreColorNuevo] = useState('')
  const [hexColorNuevo, setHexColorNuevo] = useState('#000000')

  // Cierra el menú "Otros colores…" al hacer clic afuera — patrón estándar
  // de lista desplegable. Se identifica el contenedor abierto por
  // `data-talla-menu` en vez de un ref por talle (solo puede haber uno
  // abierto a la vez).
  useEffect(() => {
    if (menuColorAbierto === null) return
    const cerrarSiEsAfuera = (e: MouseEvent) => {
      const destino = e.target as Element
      if (!destino.closest(`[data-talla-menu="${menuColorAbierto}"]`)) {
        setMenuColorAbierto(null)
      }
    }
    document.addEventListener('mousedown', cerrarSiEsAfuera)
    return () => document.removeEventListener('mousedown', cerrarSiEsAfuera)
  }, [menuColorAbierto])

  const yaExiste = (colorId: number, tallaId: number) =>
    existentes.some((e) => e.colorId === colorId && e.tallaId === tallaId)

  const toggleTalla = (tallaId: number) => {
    setTallesExpandidos((actual) =>
      actual.includes(tallaId) ? actual.filter((id) => id !== tallaId) : [...actual, tallaId],
    )
  }

  const tocarColor = (tallaId: number, colorId: number) => {
    if (yaExiste(colorId, tallaId)) return
    onGenerar([{ colorId, tallaId }])
  }

  const confirmarColorNuevo = async (tallaId: number) => {
    const nombre = nombreColorNuevo.trim()
    if (!nombre) return
    const color = await crearColor({ nombre, codigoHex: hexColorNuevo })
    onGenerar([{ colorId: color.id, tallaId }])
    onCatalogoActualizado()
    setColorNuevoEnTalla(null)
    setNombreColorNuevo('')
    setHexColorNuevo('#000000')
  }

  const confirmarTallaNueva = async () => {
    const nombre = nombreTallaNueva.trim()
    if (!nombre) return
    const talla = await crearTalla({ nombre, tipo: tipoTallaNueva })
    onCatalogoActualizado()
    setTallesExpandidos((actual) => [...actual, talla.id])
    setTallaNuevaAbierta(false)
    setNombreTallaNueva('')
  }

  const tallesExpandidosOrdenados = tallas.filter((t) => tallesExpandidos.includes(t.id))

  // Los primeros N por uso, más los que ya estén cargados en ese talle
  // aunque no entren en el top N — el "✓" de confirmación nunca debería
  // quedar escondido en el desplegable de "otros colores".
  const coloresVisiblesDe = (tallaId: number): Color[] => {
    const topN = colores.slice(0, COLORES_VISIBLES_INICIAL)
    const cargadosFueraDelTop = colores.filter((c) => yaExiste(c.id, tallaId) && !topN.includes(c))
    return [...topN, ...cargadosFueraDelTop]
  }

  // El resto del catálogo (no cargados todavía) va al desplegable "Otros
  // colores…" en vez de expandirse en más chips — pedido explícito para no
  // llenar la pantalla cuando hay muchos colores.
  const coloresRestantesDe = (tallaId: number): Color[] => {
    const visibles = coloresVisiblesDe(tallaId)
    return colores.filter((c) => !visibles.includes(c) && !yaExiste(c.id, tallaId))
  }

  

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-700">Generar variantes por talle y color</p>
      <p className="mt-0.5 text-xs text-gray-400">
        Tocá un talle para elegir sus colores — cada color que toques se agrega al momento.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {tallas.map((talla) => (
          <Chip
            key={talla.id}
            activo={tallesExpandidos.includes(talla.id)}
            onClick={() => toggleTalla(talla.id)}
          >
            {talla.nombre}
          </Chip>
        ))}

        {!tallaNuevaAbierta ? (
          <button
            type="button"
            onClick={() => setTallaNuevaAbierta(true)}
            className="text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            + Otra talla…
          </button>
        ) : (
          <span className="flex items-center gap-1">
            <input
              type="text"
              value={nombreTallaNueva}
              onChange={(e) => setNombreTallaNueva(e.target.value)}
              placeholder="Nombre"
              className="w-24 rounded-md border border-gray-300 px-2 py-1 text-xs"
              autoFocus
            />
            <select
              value={tipoTallaNueva}
              onChange={(e) => setTipoTallaNueva(e.target.value as TallaTipo)}
              className="rounded-md border border-gray-300 px-1 py-1 text-xs"
            >
              {TIPOS_TALLA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={confirmarTallaNueva}
              disabled={!nombreTallaNueva.trim()}
              title="Agregar talla"
              className="text-xs font-medium text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => {
                setTallaNuevaAbierta(false)
                setNombreTallaNueva('')
              }}
              title="Cancelar"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </span>
        )}
      </div>

      {tallesExpandidos.length > 0 && (
        <div className="mt-3 space-y-2.5 border-t border-gray-200 pt-3">
          {tallesExpandidosOrdenados.map((talla, idx) => (
            <div key={talla.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-500">Talle {talla.nombre} — colores</p>
                {idx > 0 && (
                  <></>
                )}
              </div>
              {(() => {
                const coloresVisibles = coloresVisiblesDe(talla.id)
                const coloresRestantes = coloresRestantesDe(talla.id)
                return (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {coloresVisibles.map((color) => {
                      const cargado = yaExiste(color.id, talla.id)
                      return (
                        <Chip
                          key={color.id}
                          activo={cargado}
                          disabled={cargado}
                          onClick={() => tocarColor(talla.id, color.id)}
                        >
                          {color.nombre}
                          {cargado && ' ✓'}
                        </Chip>
                      )
                    })}

                    {coloresRestantes.length > 0 && (
                      <div className="relative" data-talla-menu={talla.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setMenuColorAbierto((actual) => (actual === talla.id ? null : talla.id))
                          }
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Otros colores ({coloresRestantes.length}) {menuColorAbierto === talla.id ? '▴' : '▾'}
                        </button>

                        {menuColorAbierto === talla.id && (
                          <div className="absolute left-0 z-10 mt-1 max-h-56 w-44 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-sm">
                            {coloresRestantes.map((color) => (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => {
                                  tocarColor(talla.id, color.id)
                                  setMenuColorAbierto(null)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50"
                              >
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.codigoHex }}
                                />
                                {color.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {colorNuevoEnTalla !== talla.id ? (
                      <button
                        type="button"
                        onClick={() => setColorNuevoEnTalla(talla.id)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900"
                      >
                        + Otro color…
                      </button>
                    ) : (
                      <span className="flex items-center gap-1">
                        <input
                          type="text"
                          value={nombreColorNuevo}
                          onChange={(e) => setNombreColorNuevo(e.target.value)}
                          placeholder="Nombre"
                          className="w-24 rounded-md border border-gray-300 px-2 py-1 text-xs"
                          autoFocus
                        />
                        <input
                          type="color"
                          value={hexColorNuevo}
                          onChange={(e) => setHexColorNuevo(e.target.value)}
                          className="h-6 w-8 rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => confirmarColorNuevo(talla.id)}
                          disabled={!nombreColorNuevo.trim()}
                          title="Agregar color"
                          className="text-xs font-medium text-gray-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setColorNuevoEnTalla(null)
                            setNombreColorNuevo('')
                          }}
                          title="Cancelar"
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
