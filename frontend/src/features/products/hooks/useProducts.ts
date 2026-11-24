import { useCrud } from '@/shared/hooks/useCrud'
import { productosApi } from '../api/producto'

export function useProducts() {
  return useCrud('productos', productosApi, 'Producto')
}
