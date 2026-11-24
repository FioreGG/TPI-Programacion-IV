import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/shared/components/DataTable'
import { useAuthStore } from '../store/authStore'
import { useAdminUsers } from '../hooks/useAdminUsers'
import type { UsuarioAdmin } from '../types/auth.types'

const vacio: UsuarioAdmin[] = []

export default function AdminUsersPage() {
  const admin = useAuthStore(state => state.user)
  const { users, changeState } = useAdminUsers()
  const columns: ColumnDef<UsuarioAdmin>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    { accessorKey: 'disabled', header: 'Estado', cell: ({ row }) => row.original.disabled ? 'Desactivado' : 'Activo' },
    { id: 'acciones', header: 'Acciones', cell: ({ row }) => row.original.id !== admin?.id &&
      <button className="secondary" disabled={changeState.isPending}
        onClick={() => changeState.mutate({ id: row.original.id, active: row.original.disabled })}>
        {row.original.disabled ? 'Activar' : 'Desactivar'}
      </button> },
  ]
  // La aplicación no usa React Compiler y TanStack Table administra su estado internamente.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: users.data ?? vacio, columns,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() })
  const error = users.error ?? changeState.error

  return <section className="grid gap-5">
    <h1 className="text-3xl font-bold">Administrar usuarios</h1>
    {users.isPending && <p role="status">Cargando usuarios…</p>}
    {error && <p role="alert">{error.message}</p>}
    {users.data && <DataTable table={table} />}
  </section>
}
