import { useQuery } from '@tanstack/react-query'
import { moneda } from '@/shared/format'
import { resumenPedidos } from './api'
import type { Resumen } from './api'

const etiquetas: Record<keyof Resumen, string> = {
  pendientes: 'Pendientes', en_preparacion: 'En preparación', entregados: 'Entregados',
  cancelados: 'Cancelados', pedidos_hoy: 'Pedidos de hoy', ingresos_entregados: 'Ingresos por entregados',
}

export default function ResumenPage() {
  const consulta = useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: resumenPedidos })
  const resumen = consulta.data
  return <section className="grid gap-5">
    <h1 className="text-3xl font-bold">Resumen de administración</h1>
    {consulta.isPending && <p role="status">Cargando resumen…</p>}
    {consulta.isError && <p role="alert">{consulta.error.message}</p>}
    {resumen && <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(etiquetas) as (keyof Resumen)[]).map(key => <div className="panel" key={key}>
        <dt>{etiquetas[key]}</dt>
        <dd className="text-2xl font-bold">{key === 'ingresos_entregados' ? moneda(resumen[key]) : resumen[key]}</dd>
      </div>)}
    </dl>}
  </section>
}
