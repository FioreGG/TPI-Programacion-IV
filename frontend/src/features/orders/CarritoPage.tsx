import { Link } from 'react-router-dom'
import { moneda } from '@/shared/format'
import { useCartStore } from '@/store/cartStore'

export default function CarritoPage() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore()
  return <section className="grid gap-4">
    <h1 className="text-3xl font-bold">Carrito</h1>
    {!items.length && <p>El carrito está vacío. <Link className="underline" to="/">Ver catálogo</Link></p>}
    {items.map(item => <article key={item.producto_id} className="panel flex flex-wrap items-center gap-4">
      <h2 className="mr-auto font-semibold">{item.nombre}</h2>
      <span>{moneda(item.precio_unitario)} por unidad</span>
      <label>Cantidad <input className="field w-24!" type="number" min="1" value={item.cantidad}
        onChange={event => cambiarCantidad(item.producto_id, event.target.valueAsNumber)} /></label>
      <span>{moneda(item.precio_unitario * item.cantidad)}</span>
      <button className="secondary" onClick={() => quitar(item.producto_id)}>Quitar</button>
    </article>)}
    {!!items.length && <div className="flex flex-wrap items-center gap-3">
      <strong className="mr-auto">Total {moneda(total())}</strong>
      <button className="secondary" onClick={vaciar}>Vaciar carrito</button>
      <Link className="primary" to="/checkout">Continuar compra</Link>
    </div>}
  </section>
}
