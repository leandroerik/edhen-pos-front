import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL no está definida. Usando localhost:8080 como fallback.')
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Error de red'
    return Promise.reject(new Error(msg))
  },
)
