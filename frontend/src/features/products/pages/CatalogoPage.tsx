import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listarCategorias } from '@/features/categories/api/categoria'
import { moneda } from '@/shared/format'
import { useCartStore } from '@/store/cartStore'
import { listarProductos } from '../api/producto'

const limite = 9

export default function CatalogoPage() {
  const [busqueda, buscar] = useState('')
  const [categoria, elegirCategoria] = useState('')
  const [pagina, irA] = useState(0)
  const catalogo = useQuery({
    queryKey: ['productos', 'catalogo', pagina, busqueda, categoria],
    queryFn: () => listarProductos(pagina * limite, limite, busqueda.trim(), categoria),
  })
  const categorias = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias })
  const agregar = useCartStore(state => state.agregar)
  const items = useCartStore(state => state.items)

  return <section className="grid gap-6">
    <h1 className="text-4xl font-bold">Catálogo</h1>
    <div className="grid gap-3 md:grid-cols-2">
      <label>Buscar por nombre<input className="field" type="search" value={busqueda}
        onChange={event => { buscar(event.target.value); irA(0) }} /></label>
      <label>Categoría<select className="field" value={categoria}
        onChange={event => { elegirCategoria(event.target.value); irA(0) }}>
        <option value="">Todas</option>
        {categorias.data?.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
      </select></label>
    </div>
    {catalogo.isPending && <div role="status" aria-label="Cargando catálogo" className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map(id => <div key={id} className="h-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />)}
    </div>}
    {categorias.isError && <p role="alert">{categorias.error.message}</p>}
    {catalogo.isError && <p role="alert">{catalogo.error.message}</p>}
    {catalogo.data?.items.length === 0 && <p>No hay productos para esta búsqueda.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {catalogo.data?.items.map(producto => {
        const cantidad = items.find(item => item.producto_id === producto.id)?.cantidad ?? 0
        return <article key={producto.id} className="panel grid content-start gap-2">
          {producto.imagen_url && <img src={producto.imagen_url} alt={producto.nombre} className="h-40 w-full rounded object-cover" />}
          <p className="text-sm">{producto.categoria.nombre}</p>
          <h2 className="text-xl font-bold">{producto.nombre}</h2>
          {producto.descripcion && <p>{producto.descripcion}</p>}
          <p className="font-semibold">{moneda(producto.precio_base)}</p>
          <button className="primary" disabled={!producto.disponible || cantidad >= producto.stock}
            onClick={() => agregar(producto)}>
            {!producto.disponible || producto.stock === 0 ? 'Agotado' : cantidad === producto.stock ? 'Stock en carrito' : 'Agregar al carrito'}
          </button>
        </article>
      })}
    </div>
    {catalogo.data && (pagina > 0 || catalogo.data.total > limite) && <div className="flex items-center gap-3">
      <button className="secondary" disabled={!pagina} onClick={() => irA(pagina - 1)}>Anterior</button>
      <span>Página {pagina + 1}</span>
      <button className="secondary" disabled={(pagina + 1) * limite >= catalogo.data.total} onClick={() => irA(pagina + 1)}>Siguiente</button>
    </div>}
  </section>
}
