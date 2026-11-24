import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/shared/api/api'
import { notifyError, useNotificationStore } from '@/store/notificationStore'
import type { UsuarioAdmin } from '@/features/auth/types/auth.types'

export function useAdminUsers() {
  const queryClient = useQueryClient()
  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await axiosInstance.get<UsuarioAdmin[]>('/admin/usuarios')).data,
  })
  const changeState = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const action = active ? 'activar' : 'desactivar'
      const { data } = await axiosInstance.post<UsuarioAdmin>(`/admin/usuarios/${id}/${action}`)
      return data
    },
    onSuccess: async (_, { active }) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      useNotificationStore.getState().showNotification(active ? 'Usuario activado.' : 'Usuario desactivado.')
    },
    onError: notifyError,
  })

  return { users, changeState }
}
