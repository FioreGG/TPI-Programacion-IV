import type { Categoria } from '@/features/categories/types/categoria'

export interface ProductoInput {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  categoria_id: number
  stock: number
  disponible: boolean
}

export interface Producto extends ProductoInput {
  id: number
  activo: boolean
  categoria: Categoria
}

export interface Pagina<T> {
  items: T[]
  total: number
}
