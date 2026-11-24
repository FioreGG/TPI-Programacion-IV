import { useCrud } from '@/shared/hooks/useCrud'
import { categoriasApi } from '@/features/categories/api/categoria'

export function useCategories() {
  return useCrud('categorias', categoriasApi, 'Categoría')
}
