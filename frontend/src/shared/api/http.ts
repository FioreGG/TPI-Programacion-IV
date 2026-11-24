import { axiosInstance } from './api'

export async function request<T>(path: string, options?: { method?: string; data?: unknown }): Promise<T> {
  const response = await axiosInstance.request<T>({
    url: path,
    method: options?.method ?? 'GET',
    data: options?.data,
  })
  return response.data
}

export interface CrudApi<T, Input> {
  listar: () => Promise<T[]>
  crear: (data: Input) => Promise<T>
  editar: (id: number, data: Input) => Promise<T>
  eliminar: (id: number) => Promise<void>
}

export function crudApi<T, Input>(path: string): CrudApi<T, Input> {
  const base = path.replace(/\/$/, '')
  return {
    async listar() {
      const result: T[] = []
      for (let skip = 0; ; skip += 50) {
        const response = await request<T[]>(`${base}?skip=${skip}&limit=50`)
        result.push(...response)
        if (response.length < 50) return result
      }
    },
    crear: data => request<T>(path, { method: 'POST', data }),
    editar: (id, data) => request<T>(`${base}/${id}`, { method: 'PUT', data }),
    eliminar: id => request<void>(`${base}/${id}`, { method: 'DELETE' }),
  }
}
