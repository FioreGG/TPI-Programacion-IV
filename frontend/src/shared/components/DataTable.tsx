import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { Vacio } from './Estados'

export default function DataTable<T>({ table }: { table: Table<T> }) {
  return <div className="space-y-4">
    <label className="block max-w-sm">Buscar
      <input type="search" value={(table.getState().globalFilter as string) ?? ''} onChange={e => table.setGlobalFilter(e.target.value)} className="mt-1 w-full rounded border bg-white dark:bg-slate-900 px-3 py-2" />
    </label>
    <p className="text-sm text-slate-600 dark:text-slate-300 sm:hidden">Deslizá la tabla horizontalmente para ver todas las columnas.</p>
    {table.getRowModel().rows.length === 0 ? <Vacio /> : <div className="overflow-x-auto rounded border bg-white dark:bg-slate-900">
      <table className="w-full min-w-[640px] text-left">
        <thead className="bg-slate-200 dark:bg-slate-800">{table.getHeaderGroups().map(group => <tr key={group.id}>
          {group.headers.map(header => <th key={header.id} scope="col" aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined} className="p-3">
            {header.isPlaceholder ? null : header.column.getCanSort()
              ? <button onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())} {header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '↕'}</button>
              : flexRender(header.column.columnDef.header, header.getContext())}
          </th>)}
        </tr>)}</thead>
        <tbody>{table.getRowModel().rows.map(row => <tr key={row.id} className="border-t">
          {row.getVisibleCells().map(cell => <td key={cell.id} className="max-w-sm break-words p-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
        </tr>)}</tbody>
      </table>
    </div>}
    <div className="flex flex-wrap items-center gap-3">
      <button className="rounded border bg-white dark:bg-slate-900 px-3 py-2" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</button>
      <span>Página {table.getState().pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}</span>
      <button className="rounded border bg-white dark:bg-slate-900 px-3 py-2" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</button>
    </div>
  </div>
}
