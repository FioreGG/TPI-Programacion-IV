import { request } from '@/shared/api/http'
import type { Pagina } from '@/features/products/types/producto'

export const estados = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'] as const
export type Estado = typeof estados[number]
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export interface Pedido {
  id: number
  usuario_id: number
  estado: Estado
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string
  total: number
  created_at: string
  updated_at: string
  items: { producto_id: number; nombre_producto: string; precio_unitario: number; cantidad: number; subtotal: number }[]
}

export interface Resumen {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export const nombresEstado: Record<Estado, string> = {
  PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
}

export function listarPedidos(pagina: number, estado: Estado | '', limite: number, propios: boolean) {
  const params = new URLSearchParams({ skip: String(pagina * limite), limit: String(limite) })
  if (propios) params.set('propios', 'true')
  if (estado) params.set('estado', estado)
  return request<Pagina<Pedido>>(`/pedidos?${params}`)
}

export const detallePedido = (id: number) => request<Pedido>(`/pedidos/${id}`)
export const resumenPedidos = () => request<Resumen>('/pedidos/resumen')
export const cancelarPedido = (id: number) => request<Pedido>(`/pedidos/${id}/cancelar`, { method: 'PATCH' })
export const cambiarEstado = (id: number, estado: Estado) =>
  request<Pedido>(`/pedidos/${id}/estado`, { method: 'PATCH', data: { estado } })
export const crearPedido = (data: {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string
}) => request<Pedido>('/pedidos', { method: 'POST', data })
