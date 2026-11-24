import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { moneda } from '@/shared/format'
import { useCartStore } from '@/store/cartStore'
import { crearPedido } from './api'
import type { FormaPago } from './api'

export default function CheckoutPage() {
  const { items, vaciar, total } = useCartStore()
  const navegar = useNavigate()
  const client = useQueryClient()
  const compra = useMutation({
    mutationFn: crearPedido,
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ['pedidos'] }), client.invalidateQueries({ queryKey: ['productos'] })])
      navegar('/mis-pedidos', { replace: true })
      vaciar()
    },
  })
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      try {
        await compra.mutateAsync({
          ...value, items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        })
      } catch { /* El formulario muestra el error de la mutación. */ }
    },
  })
  if (!items.length) return <p>El carrito está vacío. <Link className="underline" to="/">Ver catálogo</Link></p>
  return <section className="mx-auto grid max-w-lg gap-4">
    <h1 className="text-3xl font-bold">Confirmar pedido</h1>
    <p>Total estimado {moneda(total())}</p>
    <form className="panel grid gap-4" onSubmit={event => { event.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) =>
        value.trim().length < 5 ? 'Ingresá una dirección de al menos 5 caracteres' : undefined }}>
        {field => <label>Dirección de entrega
          <input className="field" autoComplete="street-address" required maxLength={200}
            value={field.state.value} onChange={event => field.handleChange(event.target.value)} />
          {field.state.meta.errors.map(error => <span key={error} role="alert">{error}</span>)}
        </label>}
      </form.Field>
      <form.Field name="forma_pago">{field => <label>Forma de pago
        <select className="field" value={field.state.value}
          onChange={event => field.handleChange(event.target.value === 'EFECTIVO' ? 'EFECTIVO' : 'TRANSFERENCIA')}>
          <option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option>
        </select>
      </label>}</form.Field>
      <form.Field name="notas">{field => <label>Notas (opcional)
        <textarea className="field" value={field.state.value} onChange={event => field.handleChange(event.target.value)} />
      </label>}</form.Field>
      {compra.isError && <p role="alert">{compra.error.message}</p>}
      <button className="primary" disabled={compra.isPending}>Confirmar pedido</button>
    </form>
  </section>
}
