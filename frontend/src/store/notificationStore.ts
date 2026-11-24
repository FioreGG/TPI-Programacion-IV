import { create } from 'zustand'
import { ApiError } from '@/shared/api/api'

interface Notification {
  message: string
  kind: 'success' | 'error'
}

interface NotificationState {
  notification: Notification | null
  showNotification: (message: string, kind?: Notification['kind']) => void
  hideNotification: () => void
}

export const useNotificationStore = create<NotificationState>(set => ({
  notification: null,
  showNotification: (message, kind = 'success') => set({ notification: { message, kind } }),
  hideNotification: () => set({ notification: null }),
}))

export function notifyError(error: Error) {
  // El interceptor ya gestiona los errores de sesión y permisos.
  if (!(error instanceof ApiError && [401, 403].includes(error.status))) {
    useNotificationStore.getState().showNotification(error.message, 'error')
  }
}
