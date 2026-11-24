import { request } from '@/shared/api/http'
import type { Pagina, Producto, ProductoInput } from '../types/producto'

export function listarProductos(skip: number, limit: number, search = '', categoria = '') {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit), search })
  if (categoria) params.set('categoria_id', categoria)
  return request<Pagina<Producto>>(`/productos?${params}`)
}

export const productosApi = {
  async listar() {
    const productos: Producto[] = []
    for (let skip = 0; ; skip += 100) {
      const page = await listarProductos(skip, 100)
      productos.push(...page.items)
      if (productos.length >= page.total || !page.items.length) return productos
    }
  },
  crear: (data: ProductoInput) => request<Producto>('/productos', { method: 'POST', data }),
  editar: (id: number, data: ProductoInput) => request<Producto>(`/productos/${id}`, { method: 'PUT', data }),
  eliminar: (id: number) => request<void>(`/productos/${id}`, { method: 'DELETE' }),
  stock: (id: number, data: Pick<ProductoInput, 'stock' | 'disponible'>) =>
    request<Producto>(`/productos/${id}/stock`, { method: 'PATCH', data }),
}
