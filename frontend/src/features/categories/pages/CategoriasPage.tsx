import { CategoriaForm } from '@/features/categories/components/CategoriaForm'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useAuthStore } from '@/features/auth'
import type { Categoria } from '@/features/categories/types/categoria'
import { acciones } from '@/shared/components/acciones'
import CategoriaList from '@/features/categories/components/CategoriaList'
import { Cargando, ErrorMensaje } from '@/shared/components/Estados'

const EMPTY: Categoria[] = []

export default function CategoriasPage() {
  const crud = useCategories()
  const isAdmin = useAuthStore(state => state.user?.role === 'admin')
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    ...(isAdmin ? [acciones<Categoria>(crud.abrir, item => crud.eliminar(item.id), crud.ocupado)] : []),
  ]
  // Table v8 usa una instancia mutable; este proyecto no activa React Compiler.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: crud.query.data ?? EMPTY, columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    getRowId: row => String(row.id),
  })

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-3xl font-bold">Categorías</h2>
      {isAdmin && <button disabled={crud.ocupado} onClick={() => crud.abrir(null)} className="rounded bg-blue-600 px-5 py-3 text-white">Nueva categoría</button>}
    </div>
    {crud.query.isPending && <Cargando />}
    {crud.query.isError && <ErrorMensaje message={crud.query.error.message} retry={() => void crud.query.refetch()} />}
    {crud.deleteError && <ErrorMensaje message={crud.deleteError} />}
    {crud.query.data && <CategoriaList table={table} />}
    {isAdmin && crud.abierto && <CategoriaForm crud={crud} />}
  </section>
}
