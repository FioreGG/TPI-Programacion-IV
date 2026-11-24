import type { Table } from '@tanstack/react-table'
import type { Categoria } from '@/features/categories/types/categoria'
import DataTable from '@/shared/components/DataTable'
export default function CategoriaList({ table }: { table: Table<Categoria> }) {
  return <DataTable table={table} />
}
