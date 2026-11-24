export default function FormActions({ pending, canSubmit, onClose }: { pending: boolean; canSubmit: boolean; onClose: () => void }) {
  return <div className="flex justify-end gap-3 pt-3">
    <button type="button" disabled={pending} onClick={onClose} className="rounded bg-slate-200 dark:bg-slate-800 px-4 py-2">Cancelar</button>
    <button type="submit" disabled={pending || !canSubmit} className="rounded bg-blue-600 px-4 py-2 text-white">{pending ? 'Guardando…' : 'Guardar'}</button>
  </div>
}
