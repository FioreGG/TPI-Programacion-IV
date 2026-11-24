import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { listarCategorias } from '@/features/categories/api/categoria'
import DataTable from '@/shared/components/DataTable'
import { moneda } from '@/shared/format'
import { productosApi } from '../api/producto'
import ProductoForm from '../components/ProductoForm'
import type { Producto, ProductoInput } from '../types/producto'

const inicial: ProductoInput = { nombre: '', descripcion: '', imagen_url: '', precio_base: 0, categoria_id: 0, stock: 0, disponible: true }
const vacio: Producto[] = []

export default function ProductsPage() {
  const client = useQueryClient()
  const [edicion, editar] = useState<Producto | 'nuevo' | null>(null)
  const [stock, editarStock] = useState<Producto | null>(null)
  const productos = useQuery({ queryKey: ['productos', 'admin'], queryFn: productosApi.listar })
  const categorias = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias })
  const guardar = useMutation({
    mutationFn: (data: ProductoInput) => edicion && edicion !== 'nuevo'
      ? productosApi.editar(edicion.id, data) : productosApi.crear(data),
    onSuccess: async () => { editar(null); await client.invalidateQueries({ queryKey: ['productos'] }) },
  })
  const eliminar = useMutation({
    mutationFn: productosApi.eliminar,
    onSuccess: () => client.invalidateQueries({ queryKey: ['productos'] }),
  })
  const ajustar = useMutation({
    mutationFn: (producto: Producto) => productosApi.stock(producto.id, { stock: producto.stock, disponible: producto.disponible }),
    onSuccess: async () => { editarStock(null); await client.invalidateQueries({ queryKey: ['productos'] }) },
  })
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorFn: producto => producto.categoria.nombre, header: 'Categoría' },
    { accessorKey: 'precio_base', header: 'Precio', cell: ({ row }) => moneda(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    { accessorKey: 'disponible', header: 'Disponible', cell: ({ row }) => row.original.disponible ? 'Sí' : 'No' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => <div className="flex flex-wrap gap-2">
      <button className="secondary" onClick={() => { editarStock(null); editar(row.original); guardar.reset() }}>Editar</button>
      <button className="secondary" onClick={() => { editar(null); editarStock(row.original); ajustar.reset() }}>Stock</button>
      <button className="secondary" disabled={eliminar.isPending} onClick={() => {
        if (window.confirm(`¿Dar de baja ${row.original.nombre}?`)) eliminar.mutate(row.original.id)
      }}>Dar de baja</button>
    </div> },
  ]
  // La aplicación no usa React Compiler y TanStack Table administra su estado internamente.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: productos.data ?? vacio, columns,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() })
  const error = productos.error ?? categorias.error ?? guardar.error ?? eliminar.error ?? ajustar.error

  return <section className="grid gap-5">
    <h1 className="text-3xl font-bold">Administrar productos</h1>
    <button className="primary justify-self-start" onClick={() => { editarStock(null); editar('nuevo'); guardar.reset() }}>Nuevo producto</button>
    {error && <p role="alert">{error.message}</p>}
    {edicion && <div className="panel">
      <h2 className="mb-3 text-xl font-bold">{edicion === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}</h2>
      <ProductoForm key={edicion === 'nuevo' ? edicion : edicion.id}
        initial={edicion === 'nuevo' ? inicial : {
          nombre: edicion.nombre, descripcion: edicion.descripcion, imagen_url: edicion.imagen_url,
          precio_base: edicion.precio_base, categoria_id: edicion.categoria_id,
          stock: edicion.stock, disponible: edicion.disponible,
        }}
        categorias={categorias.data ?? []} guardar={async data => {
          try { await guardar.mutateAsync(data) } catch { /* La mutación muestra el error. */ }
        }} />
      <button className="secondary mt-3" onClick={() => editar(null)}>Cerrar</button>
    </div>}
    {stock && <form className="panel grid gap-3" onSubmit={event => { event.preventDefault(); ajustar.mutate(stock) }}>
      <h2 className="text-xl font-bold">Stock de {stock.nombre}</h2>
      <label>Unidades<input className="field" type="number" min="0" required value={stock.stock}
        onChange={event => editarStock({ ...stock, stock: event.target.valueAsNumber })} /></label>
      <label><input type="checkbox" checked={stock.disponible}
        onChange={event => editarStock({ ...stock, disponible: event.target.checked })} /> Disponible</label>
      <div className="flex gap-2"><button className="primary" disabled={ajustar.isPending}>Guardar stock</button>
        <button type="button" className="secondary" onClick={() => editarStock(null)}>Cerrar</button></div>
    </form>}
    {productos.isPending && <p role="status">Cargando productos…</p>}
    {productos.data && <DataTable table={table} />}
  </section>
}
