import { useEffect, useRef, useState } from 'react'
import {
  crearBackup,
  descargarBackup,
  listarBackups,
  obtenerEstadoShutdown,
  restaurarBackup,
  restaurarBackupArchivo,
  toggleBackupEnShutdown,
} from '../../../api/admin.api'
import type { BackupInfo } from '../../../api/admin.api'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { EmptyState } from '../../../shared/components/EmptyState'

function formatearTamano(bytes: string): string {
  const n = Number(bytes)
  if (Number.isNaN(n)) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function BackupsTab() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [cargando, setCargando] = useState(true)
  const [respaldando, setRespaldando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  const [backupAlCerrar, setBackupAlCerrar] = useState<boolean | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  // Modales y estados de restauración
  const [backupARestaurar, setBackupARestaurar] = useState<string | null>(null)
  const [archivoARestaurar, setArchivoARestaurar] = useState<File | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelado = false
    listarBackups()
      .then((datos) => {
        if (cancelado) return
        setBackups(datos)
      })
      .catch(() => {
        if (cancelado) return
        setBackups([])
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    obtenerEstadoShutdown()
      .then((estado) => {
        if (cancelado) return
        setBackupAlCerrar(estado.backupEnShutdown)
      })
      .catch(() => {
        if (cancelado) return
        setBackupAlCerrar(false)
      })
    return () => {
      cancelado = true
    }
  }, [reloadToken])

  async function hacerBackup() {
    setRespaldando(true)
    setMensajeExito(null)
    setMensajeError(null)
    try {
      const { archivo } = await crearBackup()
      setReloadToken((t) => t + 1)
      descargarBackup(archivo)
      setMensajeExito(`Backup creado exitosamente: ${archivo}`)
    } catch {
      setMensajeError('No se pudo generar el backup.')
    } finally {
      setRespaldando(false)
    }
  }

  async function alternarBackupAlCerrar() {
    await toggleBackupEnShutdown()
    setBackupAlCerrar((v) => !v)
  }

  async function ejecutarRestauracionNombre() {
    if (!backupARestaurar) return
    setRestaurando(true)
    setMensajeExito(null)
    setMensajeError(null)
    try {
      const res = await restaurarBackup(backupARestaurar)
      setMensajeExito(res.mensaje || 'Base de datos restaurada correctamente.')
      setBackupARestaurar(null)
      setReloadToken((t) => t + 1)
    } catch (e) {
      setMensajeError(e instanceof Error ? e.message : 'Error al restaurar el backup.')
    } finally {
      setRestaurando(false)
    }
  }

  async function ejecutarRestauracionArchivo() {
    if (!archivoARestaurar) return
    setRestaurando(true)
    setMensajeExito(null)
    setMensajeError(null)
    try {
      const res = await restaurarBackupArchivo(archivoARestaurar)
      setMensajeExito(res.mensaje || 'Archivo de backup restaurado correctamente.')
      setArchivoARestaurar(null)
      setReloadToken((t) => t + 1)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      setMensajeError(e instanceof Error ? e.message : 'Error al restaurar el archivo de backup.')
    } finally {
      setRestaurando(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header y acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Copias de Seguridad (Backups)</h2>
          <p className="text-sm text-gray-500">
            Gestiona la integridad de tus datos: crea volcados SQL y restaura versiones anteriores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setArchivoARestaurar(file)
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={respaldando || restaurando}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Subir backup (.sql)
          </button>
          <button
            type="button"
            onClick={() => void hacerBackup()}
            disabled={respaldando || restaurando}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {respaldando ? 'Creando...' : 'Crear backup ahora'}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✓ {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          ✕ {mensajeError}
        </div>
      )}

      {/* Opción backup al cerrar */}
      {backupAlCerrar !== null && (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={backupAlCerrar}
            onChange={() => void alternarBackupAlCerrar()}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            Crear backup automáticamente al cerrar o apagar la aplicación
          </span>
        </label>
      )}

      {/* Tabla de backups */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
          Historial de Backups en Disco
        </div>
        {cargando ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : backups.length === 0 ? (
          <EmptyState mensaje="Todavía no se creó ningún backup." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Archivo</th>
                <th className="px-4 py-2 font-medium">Tamaño</th>
                <th className="px-4 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.map((b) => (
                <tr key={b.nombre} className="hover:bg-gray-50/80">
                  <td className="px-4 py-2 font-mono text-xs text-gray-800">{b.nombre}</td>
                  <td className="px-4 py-2 text-gray-500">{formatearTamano(b.tamaño)}</td>
                  <td className="flex items-center justify-end gap-3 px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => descargarBackup(b.nombre)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Descargar
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setBackupARestaurar(b.nombre)}
                      className="text-xs font-medium text-amber-600 hover:text-amber-800 hover:underline"
                    >
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de confirmación para restaurar backup de la lista */}
      <ConfirmModal
        abierto={backupARestaurar !== null}
        titulo="¿Restaurar copia de seguridad?"
        mensaje={`Se restablecerá la base de datos completa al estado de "${backupARestaurar}". Todos los datos posteriores se sobreescribirán.`}
        textoAccion="Sí, restaurar datos"
        variant="warning"
        cargando={restaurando}
        onConfirmar={ejecutarRestauracionNombre}
        onCancelar={() => setBackupARestaurar(null)}
      />

      {/* Modal de confirmación para restaurar backup subido */}
      <ConfirmModal
        abierto={archivoARestaurar !== null}
        titulo="¿Restaurar copia desde archivo?"
        mensaje={`Se ejecutará el archivo SQL "${archivoARestaurar?.name}". La base de datos actual será actualizada con los datos del archivo.`}
        textoAccion="Restaurar archivo"
        variant="warning"
        cargando={restaurando}
        onConfirmar={ejecutarRestauracionArchivo}
        onCancelar={() => {
          setArchivoARestaurar(null)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }}
      />
    </div>
  )
}
