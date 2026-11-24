import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '')

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function apiError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Ocurrió un error inesperado.')
  }
  if (!error.response) return new Error('No se pudo conectar con el servidor.')
  const { status } = error.response
  const data: unknown = error.response.data
  if (status === 403) return new ApiError('Acceso denegado.', status)
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const detail = data.detail
    if (typeof detail === 'string') return new ApiError(detail, status)
    if (Array.isArray(detail)) {
      return new ApiError(detail.map((item: { msg?: string }) => item.msg ?? 'Dato inválido').join('; '), status)
    }
  }
  return new ApiError(`No se pudo completar la operación (HTTP ${status}).`, status)
}
