export function Cargando() {
  return <p role="status" className="rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4 text-blue-800 dark:text-blue-200">Cargando datos…</p>
}
export function Vacio() {
  return <p className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-300">No hay registros para mostrar.</p>
}
export function ErrorMensaje({ message, retry }: { message: string; retry?: () => void }) {
  return <div role="alert" className="my-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">
    {message} {retry && <button onClick={retry} className="ml-2 underline">Reintentar</button>}
  </div>
}
