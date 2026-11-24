import { useForm } from '@tanstack/react-form'
import CategoriaModal from './CategoriaModal'
import FormActions from '@/shared/components/FormActions'
import { ErrorMensaje } from '@/shared/components/Estados'
import type { useCategories } from '@/features/categories/hooks/useCategories'

export function CategoriaForm({ crud }: { crud: ReturnType<typeof useCategories> }) {
  const form = useForm({
    defaultValues: crud.seleccionada ? { nombre: crud.seleccionada.nombre, descripcion: crud.seleccionada.descripcion } : { nombre: '', descripcion: '' },
    onSubmit: async ({ value }) => {
      try {
        await crud.guardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() })
      } catch {
        // La mutación conserva el error y el modal sigue abierto.
      }
    },
  })

  return <CategoriaModal isOpen={crud.abierto} editing={!!crud.seleccionada} pending={crud.ocupado} onClose={crud.cerrar}>
      <form noValidate onSubmit={event => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }} className="space-y-4">
        <form.Field name="nombre" validators={{ onChange: ({ value }) => !value.trim() ? 'Este campo es obligatorio' : value.trim().length > 100 ? 'Máximo 100 caracteres' : undefined }}>
          {field => <label className="block">Nombre
            <input disabled={crud.ocupado} value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} className="mt-1 w-full rounded border px-3 py-2" />
            {field.state.meta.errors.map((error, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{error}</span>)}
          </label>}
        </form.Field>
        <form.Field name="descripcion" validators={{ onChange: ({ value }) => value.trim().length > 1000 ? 'Máximo 1000 caracteres' : undefined }}>
          {field => <label className="block">Descripción
            <textarea disabled={crud.ocupado} value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} className="mt-1 w-full rounded border px-3 py-2" />
            {field.state.meta.errors.map((error, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{error}</span>)}
          </label>}
        </form.Field>
        {crud.error && <ErrorMensaje message={crud.error} />}
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, submitting]) => <FormActions pending={crud.ocupado || submitting} canSubmit={canSubmit} onClose={crud.cerrar} />}
        </form.Subscribe>
      </form>
    </CategoriaModal>
}
