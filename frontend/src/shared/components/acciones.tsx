import type { ColumnDef } from '@tanstack/react-table'

export function acciones<T>(edit: (row: T) => void, remove: (row: T) => void, disabled: boolean): ColumnDef<T> {
  return {
    id: 'acciones', header: 'Acciones', enableSorting: false, enableGlobalFilter: false,
    cell: ({ row }) => <div className="flex gap-2">
      <button disabled={disabled} onClick={() => edit(row.original)} className="rounded bg-blue-600 px-3 py-2 text-white">Editar</button>
      <button disabled={disabled} onClick={() => remove(row.original)} className="rounded bg-red-700 px-3 py-2 text-white">Eliminar</button>
    </div>,

  }
}

