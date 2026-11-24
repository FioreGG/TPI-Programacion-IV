import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiError } from '@/shared/api/api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthError } from '@/features/auth/components/AuthError'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const state = useLocation().state as { from?: string } | null
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: { full_name: '', username: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await register({
          full_name: value.full_name.trim(),
          username: value.username.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true, state: { registered: true, from: state?.from } })
      } catch (reason) {
        setError(apiError(reason).message)
      }
    },
  })

  return <section className="mx-auto mt-12 max-w-md rounded-lg bg-white dark:bg-slate-900 p-8 shadow">
    <h1 className="mb-6 text-3xl font-bold">Crear cuenta</h1>
    <form noValidate onSubmit={event => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }} className="space-y-4">
      {(['full_name', 'username'] as const).map(name => <form.Field key={name} name={name} validators={{
        onChange: ({ value }) => !value.trim() ? 'Este campo es obligatorio' : undefined,
      }}>
        {field => <label className="block">{name === 'full_name' ? 'Nombre completo' : 'Usuario'}
          <input autoComplete={name === 'full_name' ? 'name' : 'username'} value={field.state.value} onBlur={field.handleBlur} onChange={event => field.handleChange(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          {field.state.meta.errors.map((message, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{message}</span>)}
        </label>}
      </form.Field>)}
      <form.Field name="email" validators={{ onChange: ({ value }) => !value.trim() ? 'Ingresá tu email' : undefined }}>
        {field => <label className="block">Email
          <input type="email" autoComplete="email" value={field.state.value} onBlur={field.handleBlur} onChange={event => field.handleChange(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          {field.state.meta.errors.map((message, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{message}</span>)}
        </label>}
      </form.Field>
      <form.Field name="password" validators={{ onChange: ({ value }) => value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined }}>
        {field => <label className="block">Contraseña
          <input type="password" autoComplete="new-password" value={field.state.value} onBlur={field.handleBlur} onChange={event => field.handleChange(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          {field.state.meta.errors.map((message, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{message}</span>)}
        </label>}
      </form.Field>
      <AuthError message={error} />
      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, submitting]) => <button disabled={!canSubmit || submitting} className="w-full rounded bg-blue-700 px-4 py-2 font-semibold text-white">
          {submitting ? 'Creando cuenta...' : 'Registrarme'}
        </button>}
      </form.Subscribe>
    </form>
    <p className="mt-5 text-sm">¿Ya tenés cuenta? <Link className="text-blue-700 underline" to="/login" state={state}>Iniciá sesión</Link></p>
  </section>
}
