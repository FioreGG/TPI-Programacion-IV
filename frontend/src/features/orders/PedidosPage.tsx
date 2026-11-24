import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { moneda } from '@/shared/format'
import { cambiarEstado, cancelarPedido, detallePedido, estados, listarPedidos, nombresEstado } from './api'
import type { Estado } from './api'

const limite = 10
const color: Record<Estado, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-900', EN_PREPARACION: 'bg-blue-100 text-blue-900',
  ENTREGADO: 'bg-green-100 text-green-900', CANCELADO: 'bg-red-100 text-red-900',
}

export default function PedidosPage({ admin = false }: { admin?: boolean }) {
  const usuarioId = useAuthStore(state => state.user?.id)
  const [estado, filtrar] = useState<Estado | ''>('')
  const [pagina, irA] = useState(0)
  const [seleccion, seleccionar] = useState<number | null>(null)
  const client = useQueryClient()
  const pedidos = useQuery({
    queryKey: ['pedidos', usuarioId, admin, pagina, estado],
    queryFn: () => listarPedidos(pagina, estado, limite, !admin),
  })
  const detalle = useQuery({
    queryKey: ['pedidos', usuarioId, 'detalle', seleccion],
    queryFn: () => detallePedido(seleccion ?? 0), enabled: seleccion !== null,
  })
  const cambiar = useMutation({
    mutationFn: ({ id, destino }: { id: number; destino: Estado }) => admin
      ? cambiarEstado(id, destino) : cancelarPedido(id),
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ['pedidos'] }), client.invalidateQueries({ queryKey: ['productos'] })])
    },
  })

  return <section className="grid gap-4">
    <h1 className="text-3xl font-bold">{admin ? 'Administrar pedidos' : 'Mis pedidos'}</h1>
    {admin && <label>Estado<select className="field" value={estado} onChange={event => {
      filtrar(estados.find(item => item === event.target.value) ?? ''); irA(0)
    }}>
      <option value="">Todos</option>
      {estados.map(item => <option key={item} value={item}>{nombresEstado[item]}</option>)}
    </select></label>}
    {pedidos.isPending && <p role="status">Cargando pedidos…</p>}
    {pedidos.isError && <p role="alert">{pedidos.error.message}</p>}
    {cambiar.isError && <p role="alert">{cambiar.error.message}</p>}
    {pedidos.data?.items.length === 0 && <p>No hay pedidos para mostrar.</p>}
    {Boolean(pedidos.data?.items.length) && <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead><tr><th className="p-3">Pedido</th><th>Estado</th><th>Total</th><th>Acciones</th></tr></thead>
        <tbody>{pedidos.data?.items.map(pedido => <tr key={pedido.id} className="border-t border-slate-300">
          <td className="p-3">#{pedido.id}{admin && <small className="block">Usuario #{pedido.usuario_id}</small>}</td>
          <td><span className={`rounded px-2 py-1 text-sm ${color[pedido.estado]}`}>{nombresEstado[pedido.estado]}</span></td>
          <td>{moneda(pedido.total)}</td>
          <td className="flex flex-wrap gap-2 py-2">
            <button className="secondary" onClick={() => seleccionar(pedido.id)}>Ver detalle</button>
            {admin && (pedido.estado === 'PENDIENTE' || pedido.estado === 'EN_PREPARACION') && <button
              className="secondary" disabled={cambiar.isPending}
              onClick={() => cambiar.mutate({ id: pedido.id, destino: pedido.estado === 'PENDIENTE' ? 'EN_PREPARACION' : 'ENTREGADO' })}>
              {pedido.estado === 'PENDIENTE' ? 'Preparar' : 'Marcar entregado'}
            </button>}
            {(pedido.estado === 'PENDIENTE' || (admin && pedido.estado === 'EN_PREPARACION')) && <button className="secondary"
              disabled={cambiar.isPending} onClick={() => {
                if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cambiar.mutate({ id: pedido.id, destino: 'CANCELADO' })
              }}>Cancelar</button>}
          </td>
        </tr>)}</tbody>
      </table>
    </div>}
    {pedidos.data && (pagina > 0 || pedidos.data.total > limite) && <div className="flex items-center gap-3">
      <button className="secondary" disabled={!pagina} onClick={() => irA(pagina - 1)}>Anterior</button>
      <span>Página {pagina + 1}</span>
      <button className="secondary" disabled={(pagina + 1) * limite >= pedidos.data.total} onClick={() => irA(pagina + 1)}>Siguiente</button>
    </div>}
    {seleccion !== null && <article className="panel grid gap-2">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Pedido #{seleccion}</h2>
        <button className="secondary" onClick={() => seleccionar(null)}>Cerrar detalle</button></div>
      {detalle.isPending && <p role="status">Cargando detalle…</p>}
      {detalle.isError && <p role="alert">{detalle.error.message}</p>}
      {detalle.data && <>
        <p>{nombresEstado[detalle.data.estado]}</p>
        <p>Entrega en {detalle.data.direccion_entrega}</p>
        <p>Pago en {detalle.data.forma_pago.toLowerCase()}</p>
        {detalle.data.notas && <p>Notas: {detalle.data.notas}</p>}
        <ul>{detalle.data.items.map(item => <li key={item.producto_id}>
          {item.cantidad} × {item.nombre_producto} a {moneda(item.precio_unitario)} = {moneda(item.subtotal)}
        </li>)}</ul>
        <strong>Total {moneda(detalle.data.total)}</strong>
      </>}
    </article>}
  </section>
}
