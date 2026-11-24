import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CrudApi } from '@/shared/api/http'
import { notifyError, useNotificationStore } from '@/store/notificationStore'

export function useCrud<T extends { id: number }, Input>(key: string, api: CrudApi<T, Input>, label: string) {
  const [abierto, setAbierto] = useState(false)
  const [seleccionada, setSeleccionada] = useState<T | null>(null)
  const client = useQueryClient()
  const query = useQuery({ queryKey: [key], queryFn: api.listar })
  const cerrar = () => { setAbierto(false); setSeleccionada(null) }
  const refrescar = () => client.invalidateQueries({ queryKey: [key] })
  const confirmarCambio = async (action: string) => {
    await refrescar()
    useNotificationStore.getState().showNotification(`${label} · ${action}`)
  }
  const crear = useMutation({
    mutationFn: api.crear,
    onSuccess: async () => { await confirmarCambio('Alta realizada'); cerrar() },
    onError: notifyError,
  })
  const editar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Input }) => api.editar(id, data),
    onSuccess: async () => { await confirmarCambio('Cambios guardados'); cerrar() },
    onError: notifyError,
  })
  const eliminar = useMutation({
    mutationFn: api.eliminar,
    onSuccess: () => confirmarCambio('Baja realizada'),
    onError: notifyError,
  })
  const ocupado = crear.isPending || editar.isPending || eliminar.isPending
  return {
    query, abierto, seleccionada, ocupado, cerrar,
    error: crear.error?.message ?? editar.error?.message,
    deleteError: eliminar.error?.message,
    abrir(item: T | null) {
      crear.reset(); editar.reset(); eliminar.reset()
      setSeleccionada(item); setAbierto(true)
    },
    guardar: (data: Input) => seleccionada
      ? editar.mutateAsync({ id: seleccionada.id, data })
      : crear.mutateAsync(data),
    eliminar: (id: number) => {
      if (window.confirm('¿Confirmás la eliminación?')) eliminar.mutate(id)
    },
  }
}
