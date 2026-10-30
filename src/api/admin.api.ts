import { apiClient } from './client'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export interface BackupInfo {
  nombre: string
  tamaño: string
}

export interface ResultadoImportacion {
  productosCreados: number
  variantesCreadas: number
  errores: number
  mensajesError: string[]
}

export async function obtenerConfiguracion(): Promise<Record<string, string>> {
  const res = await apiClient.get<Record<string, string>>('/api/admin/configuracion')
  return res.data
}

export async function guardarConfiguracion(datos: Record<string, string>): Promise<void> {
  await apiClient.post('/api/admin/configuracion', datos)
}

export async function crearBackup(): Promise<{ archivo: string }> {
  const res = await apiClient.post<{ archivo: string }>('/api/admin/backup')
  return res.data
}

export async function listarBackups(): Promise<BackupInfo[]> {
  const res = await apiClient.get<BackupInfo[]>('/api/admin/backup/listar')
  return res.data
}

export function urlDescargaBackup(nombre: string): string {
  return `${API_URL}/api/admin/backup/descargar/${nombre}`
}

export function descargarBackup(nombre: string): void {
  const a = document.createElement('a')
  a.href = urlDescargaBackup(nombre)
  a.download = nombre
  a.click()
}

export async function restaurarBackup(nombre: string): Promise<{ mensaje: string }> {
  const res = await apiClient.post<{ mensaje: string }>(`/api/admin/backup/restaurar/${nombre}`)
  return res.data
}

export async function restaurarBackupArchivo(archivo: File): Promise<{ mensaje: string }> {
  const formData = new FormData()
  formData.append('archivo', archivo)
  const res = await apiClient.post<{ mensaje: string }>(
    '/api/admin/backup/restaurar-archivo',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return res.data
}

export async function importarProductos(archivo: File): Promise<ResultadoImportacion> {
  const formData = new FormData()
  formData.append('archivo', archivo)
  const res = await apiClient.post<ResultadoImportacion>(
    '/api/admin/importar/productos',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return res.data
}

export async function obtenerEstadoShutdown(): Promise<{ backupEnShutdown: boolean }> {
  const res = await apiClient.get<{ backupEnShutdown: boolean }>('/api/admin/shutdown/estado')
  return res.data
}

export async function toggleBackupEnShutdown(): Promise<void> {
  await apiClient.post('/api/admin/shutdown/backup-toggle')
}

export async function cerrarApp(): Promise<void> {
  await apiClient.post('/api/admin/shutdown').catch(() => {})
}
