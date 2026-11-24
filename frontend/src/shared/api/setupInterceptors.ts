import { isAxiosError } from 'axios'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/store/notificationStore'
import { apiError, axiosInstance } from './api'

axiosInstance.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError(error)) {
    const { status } = error.response ?? {}
    const url = error.config?.url
    if ((status === 401 && url !== '/auth/token' && url !== '/auth/me') || (status === 400 && error.response?.data?.detail === 'Cuenta de usuario desactivada')) {
      useAuthStore.getState().clearAuth()
    }
    if (status === 403) {
      useNotificationStore.getState().showNotification('Acceso denegado.', 'error')
    }
  }
  return Promise.reject(apiError(error))
})
