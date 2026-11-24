import type { ReactNode } from 'react'
import Modal from '@/shared/components/Modal'
interface Props { isOpen: boolean; editing: boolean; pending: boolean; onClose: () => void; children: ReactNode }
export default function CategoriaModal({ isOpen, editing, pending, onClose, children }: Props) {
  return isOpen ? <Modal title={editing ? 'Editar categoría' : 'Nueva categoría'} pending={pending} onClose={onClose}>{children}</Modal> : null
}
