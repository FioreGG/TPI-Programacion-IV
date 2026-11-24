import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
interface Props { title: string; pending: boolean; onClose: () => void; children: ReactNode }
export default function Modal({ title, pending, onClose, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} aria-labelledby="modal-title" onCancel={event => {
    event.preventDefault()
    if (!pending) onClose()
  }} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl backdrop:bg-black/50">
    <h2 id="modal-title" className="mb-5 text-2xl font-bold">{title}</h2>
    {children}
  </dialog>
}
