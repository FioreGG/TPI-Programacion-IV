import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { apiError } from '@/shared/api/api'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthError } from '@/features/auth/components/AuthError'

export default function LoginPage() {
  const { user, checking, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const requested = (location.state as { from?: string } | null)?.from
  const destino = requested === '/checkout' ? requested : '/'
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch (reason) {
        setError(apiError(reason).message)
      }
    },
  })

  if (checking) return <p role="status" className="p-8 text-center">Verificando sesión...</p>
  if (user) return <Navigate to={destino} replace />

  const registered = (location.state as { registered?: boolean } | null)?.registered
  return <section className="mx-auto mt-12 max-w-md rounded-lg bg-white dark:bg-slate-900 p-8 shadow">
    <h1 className="mb-6 text-3xl font-bold">Iniciar sesión</h1>
    {registered && <p className="mb-4 rounded bg-green-50 dark:bg-green-950 p-3 text-green-800 dark:text-green-200">Cuenta creada. Ahora podés iniciar sesión.</p>}
    <form noValidate onSubmit={event => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit() }} className="space-y-4">
      <form.Field name="username" validators={{ onChange: ({ value }) => !value.trim() ? 'Ingresá tu usuario' : undefined }}>
        {field => <label className="block">Usuario
          <input autoComplete="username" value={field.state.value} onBlur={field.handleBlur} onChange={event => field.handleChange(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          {field.state.meta.errors.map((message, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{message}</span>)}
        </label>}
      </form.Field>
      <form.Field name="password" validators={{ onChange: ({ value }) => !value ? 'Ingresá tu contraseña' : undefined }}>
        {field => <label className="block">Contraseña
          <input type="password" autoComplete="current-password" value={field.state.value} onBlur={field.handleBlur} onChange={event => field.handleChange(event.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
          {field.state.meta.errors.map((message, index) => <span key={index} role="alert" className="block text-sm text-red-700 dark:text-red-300">{message}</span>)}
        </label>}
      </form.Field>
      <AuthError message={error} />
      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, submitting]) => <button disabled={!canSubmit || submitting} className="w-full rounded bg-blue-700 px-4 py-2 font-semibold text-white">
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>}
      </form.Subscribe>
    </form>
    <p className="mt-5 text-sm">¿No tenés cuenta? <Link className="text-blue-700 underline" to="/register" state={{ from: destino }}>Registrate</Link></p>
  </section>
}
