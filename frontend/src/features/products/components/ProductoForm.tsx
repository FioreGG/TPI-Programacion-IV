import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categories/types/categoria'
import type { ProductoInput } from '../types/producto'

export default function ProductoForm({ initial, categorias, guardar }: {
  initial: ProductoInput
  categorias: Categoria[]
  guardar: (data: ProductoInput) => Promise<void>
}) {
  const form = useForm({ defaultValues: initial, onSubmit: ({ value }) => guardar(value) })
  return <form className="grid gap-3" onSubmit={event => { event.preventDefault(); void form.handleSubmit() }}>
    {([['nombre', 'Nombre'], ['descripcion', 'Descripción'], ['imagen_url', 'URL de imagen']] as const).map(([name, label]) =>
      <form.Field key={name} name={name}>{field => <label>{label}
        <input className="field" required={name === 'nombre'} value={field.state.value}
          onChange={event => field.handleChange(event.target.value)} />
      </label>}</form.Field>)}
    <form.Field name="categoria_id">{field => <label>Categoría
      <select className="field" required value={field.state.value || ''}
        onChange={event => field.handleChange(Number(event.target.value))}>
        <option value="">Elegí una categoría</option>
        {categorias.map(categoria => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
      </select>
    </label>}</form.Field>
    {([['precio_base', 'Precio', '0.01'], ['stock', 'Stock', '1']] as const).map(([name, label, step]) =>
      <form.Field key={name} name={name}>{field => <label>{label}
        <input className="field" type="number" required min="0" step={step}
          value={field.state.value} onChange={event => field.handleChange(event.target.valueAsNumber)} />
      </label>}</form.Field>)}
    <form.Field name="disponible">{field => <label className="flex gap-2">
      <input type="checkbox" checked={field.state.value} onChange={event => field.handleChange(event.target.checked)} /> Disponible
    </label>}</form.Field>
    <form.Subscribe selector={state => state.isSubmitting}>{busy =>
      <button className="primary" disabled={busy}>Guardar</button>
    }</form.Subscribe>
  </form>
}
