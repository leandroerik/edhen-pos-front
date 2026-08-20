import { useEffect, useState } from 'react'
import { listarEnvios } from '../../api/envios.api'
import { listarProductos } from '../../api/productos.api'
import { listarStock } from '../../api/stock.api'
import { listarVentas } from '../../api/ventas.api'
import { toInputDate } from '../../shared/format'
import type { Envio } from '../../types/envio'
import type { Producto, ProductoVariante } from '../../types/producto'
import type { Venta } from '../../types/venta'
import {
  ComparacionPeriodosCard,
  ComparacionPeriodosControl,
} from './components/ComparacionPeriodosCard'
import { EnviosReporteCard } from './components/EnviosReporteCard'
import { ProductosMasVendidosCard } from './components/ProductosMasVendidosCard'
import { ResumenVentasCard } from './components/ResumenVentasCard'
import { SelectorRangoFechas } from './components/SelectorRangoFechas'
import { StockReporteCard } from './components/StockReporteCard'
import { VentasPorCategoriaCard } from './components/VentasPorCategoriaCard'
import { VentasPorPeriodoCard } from './components/VentasPorPeriodoCard'
import { VentasPorVarianteCard } from './components/VentasPorVarianteCard'

function hoyInicio(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function diasAtras(n: number): Date {
  const d = hoyInicio()
  d.setDate(d.getDate() - n)
  return d
}

function inicioDelMes(): Date {
  const d = hoyInicio()
  d.setDate(1)
  return d
}

function mesAnterior(): { desde: Date; hasta: Date } {
  const d = inicioDelMes()
  d.setMonth(d.getMonth() - 1)
  const hasta = new Date(d)
  hasta.setMonth(hasta.getMonth() + 1)
  hasta.setDate(0)
  return { desde: d, hasta }
}

type Tab = 'periodo' | 'comparar'

export function ReportesPage() {
  const [tab, setTab] = useState<Tab>('periodo')

  // Período único
  const [desde, setDesde] = useState(() => toInputDate(diasAtras(6)))
  const [hasta, setHasta] = useState(() => toInputDate(hoyInicio()))
  const [atajoActivo, setAtajoActivo] = useState<string | null>('7d')

  // Comparación
  const [desdeA, setDesdeA] = useState(() => toInputDate(diasAtras(6)))
  const [hastaA, setHastaA] = useState(() => toInputDate(hoyInicio()))
  const [atajoA, setAtajoA] = useState<string | null>('7d')
  const [desdeB, setDesdeB] = useState(() => toInputDate(mesAnterior().desde))
  const [hastaB, setHastaB] = useState(() => toInputDate(mesAnterior().hasta))
  const [atajoB, setAtajoB] = useState<string | null>('anterior')

  // Datos
  const [ventas, setVentas] = useState<Venta[]>([])
  const [ventasA, setVentasA] = useState<Venta[]>([])
  const [ventasB, setVentasB] = useState<Venta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [stock, setStock] = useState<Array<{ producto: Producto; variante: ProductoVariante }>>([])
  const [envios, setEnvios] = useState<Envio[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroClave, setFiltroClave] = useState(0)

  // Cargar datos fijos (productos, stock, envios) una vez
  useEffect(() => {
    let cancelado = false
    Promise.all([listarProductos({}), listarStock(), listarEnvios()]).then(
      ([productosData, stockData, enviosData]) => {
        if (cancelado) return
        setProductos(productosData)
        setStock(stockData)
        setEnvios(enviosData)
      },
    )
    return () => {
      cancelado = true
    }
  }, [])

  // Cargar ventas según tab activo
  useEffect(() => {
    let cancelado = false
    setCargando(true)

    if (tab === 'periodo') {
      Promise.all([
        listarVentas({
          desde: new Date(desde + 'T00:00:00').toISOString(),
          hasta: new Date(hasta + 'T23:59:59').toISOString(),
          estado: 'COMPLETADA',
        }),
      ])
        .then(([ventasData]) => {
          if (cancelado) return
          setVentas(ventasData)
          setCargando(false)
        })
        .catch(() => {
          if (cancelado) return
          setCargando(false)
        })
    } else {
      Promise.all([
        listarVentas({
          desde: new Date(desdeA + 'T00:00:00').toISOString(),
          hasta: new Date(hastaA + 'T23:59:59').toISOString(),
          estado: 'COMPLETADA',
        }),
        listarVentas({
          desde: new Date(desdeB + 'T00:00:00').toISOString(),
          hasta: new Date(hastaB + 'T23:59:59').toISOString(),
          estado: 'COMPLETADA',
        }),
      ])
        .then(([dataA, dataB]) => {
          if (cancelado) return
          setVentasA(dataA)
          setVentasB(dataB)
          setCargando(false)
        })
        .catch(() => {
          if (cancelado) return
          setCargando(false)
        })
    }

    return () => {
      cancelado = true
    }
  }, [
    tab,
    desde,
    hasta,
    desdeA,
    hastaA,
    desdeB,
    hastaB,
    filtroClave,
  ])

  function cambiarRango(
    nuevoDesde: string,
    nuevoHasta: string,
    atajo: string | null,
  ) {
    setDesde(nuevoDesde)
    setHasta(nuevoHasta)
    setAtajoActivo(atajo)
    setCargando(true)
    setFiltroClave((v) => v + 1)
  }

  const TABS: { clave: Tab; label: string }[] = [
    { clave: 'periodo', label: 'Período único' },
    { clave: 'comparar', label: 'Comparar períodos' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-0.5">
        {TABS.map((t) => (
          <button
            key={t.clave}
            onClick={() => setTab(t.clave)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.clave
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selector de fechas según tab */}
      <div className="mt-3">
        {tab === 'periodo' ? (
          <SelectorRangoFechas
            desde={desde}
            hasta={hasta}
            atajoActivo={atajoActivo}
            onChange={cambiarRango}
          />
        ) : (
          <ComparacionPeriodosControl
            desdeA={desdeA}
            hastaA={hastaA}
            atajoA={atajoA}
            desdeB={desdeB}
            hastaB={hastaB}
            atajoB={atajoB}
            onChangeA={(d, h, a) => {
              setDesdeA(d)
              setHastaA(h)
              setAtajoA(a)
              setCargando(true)
              setFiltroClave((v) => v + 1)
            }}
            onChangeB={(d, h, a) => {
              setDesdeB(d)
              setHastaB(h)
              setAtajoB(a)
              setCargando(true)
              setFiltroClave((v) => v + 1)
            }}
          />
        )}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border border-gray-200 bg-white"
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Sección Ventas */}
          {tab === 'periodo' ? (
            <>
              <ResumenVentasCard ventas={ventas} />
              <VentasPorPeriodoCard ventas={ventas} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <VentasPorCategoriaCard ventas={ventas} productos={productos} />
                <ProductosMasVendidosCard ventas={ventas} productos={productos} />
              </div>
              <VentasPorVarianteCard ventas={ventas} />
            </>
          ) : (
            <>
              <ComparacionPeriodosCard ventasA={ventasA} ventasB={ventasB} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <VentasPorCategoriaCard ventas={ventasA} productos={productos} />
                <ProductosMasVendidosCard ventas={ventasA} productos={productos} />
              </div>
              <VentasPorVarianteCard ventas={ventasA} />
            </>
          )}

          {/* Sección Envíos */}
          <EnviosReporteCard envios={envios} />

          {/* Sección Stock */}
          <StockReporteCard stock={stock} />
        </div>
      )}
    </div>
  )
}
