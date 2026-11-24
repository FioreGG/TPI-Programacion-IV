import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/features/products/types/producto'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface Carrito {
  items: ItemCarrito[]
  agregar: (producto: Producto) => void
  quitar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<Carrito>()(persist((set, get) => ({
  items: [],
  agregar: producto => set(state => {
    const actual = state.items.find(item => item.producto_id === producto.id)
    if (!producto.disponible || (actual?.cantidad ?? 0) >= producto.stock) return state
    return { items: actual
      ? state.items.map(item => item === actual ? { ...item, cantidad: item.cantidad + 1 } : item)
      : [...state.items, { producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base, cantidad: 1 }] }
  }),
  quitar: id => set(state => ({ items: state.items.filter(item => item.producto_id !== id) })),
  cambiarCantidad: (id, cantidad) => {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) return
    set(state => ({ items: state.items.map(item => item.producto_id === id ? { ...item, cantidad } : item) }))
  },
  vaciar: () => set({ items: [] }),
  total: () => get().items.reduce((total, item) => total + item.precio_unitario * item.cantidad, 0),
}), { name: 'food-store-carrito' }))
