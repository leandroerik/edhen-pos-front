import { useEffect } from 'react'
import { apiClient } from '../../api/client'

const HEARTBEAT_MS = 10_000

export function useHeartbeat() {
  useEffect(() => {
    const ping = () => apiClient.post('/api/admin/heartbeat').catch(() => {})
    ping()
    const id = setInterval(ping, HEARTBEAT_MS)

    const onUnload = () => {
      try {
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_URL}/api/admin/shutdown`,
        )
      } catch {}
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      clearInterval(id)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])
}
