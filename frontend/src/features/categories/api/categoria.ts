import type { Categoria, CategoriaInput } from '@/features/categories/types/categoria'
import { crudApi, request } from '@/shared/api/http'

export const categoriasApi = {
  ...crudApi<Categoria, CategoriaInput>('/categorias'),
  listar: () => request<Categoria[]>('/categorias'),
}
export const listarCategorias = categoriasApi.listar
export const crearCategoria = categoriasApi.crear
export const editarCategoria = categoriasApi.editar
export const eliminarCategoria = categoriasApi.eliminar
export const obtenerCategoria = (id: number) => request<Categoria>(`/categorias/${id}`)
