import { useEffect } from 'react'
import { apiClient } from '../../api/client'

const HEARTBEAT_MS = 15_000

export function useHeartbeat() {
  useEffect(() => {
    const ping = () => apiClient.post('/api/admin/heartbeat').catch(() => {})
    ping()
    const id = setInterval(ping, HEARTBEAT_MS)

    return () => {
      clearInterval(id)
    }
  }, [])
}
