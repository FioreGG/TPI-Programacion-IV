import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return <main className="mx-auto mt-16 max-w-xl rounded-lg bg-white dark:bg-slate-900 p-8 text-center shadow">
    <h1 className="text-3xl font-bold">Acceso denegado</h1>
    <p className="mt-3 text-slate-600 dark:text-slate-300">Tu cuenta no tiene permisos para ver esta página.</p>
    <Link className="mt-6 inline-block text-blue-700 dark:text-blue-300 underline" to="/categories">Volver al catálogo</Link>
  </main>
}
