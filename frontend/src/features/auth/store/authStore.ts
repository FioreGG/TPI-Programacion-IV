import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiError, axiosInstance } from '@/shared/api/api'
import type { UsuarioAuth, UsuarioRegistro } from '@/features/auth/types/auth.types'

interface AuthState {
  user: UsuarioAuth | null
  checking: boolean
  sessionError: string | null
  login: (username: string, password: string) => Promise<void>
  register: (data: UsuarioRegistro) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearAuth: () => void
}

let pendingCheck: Promise<void> | undefined

export const useAuthStore = create<AuthState>()(persist(set => ({
  user: null,
  checking: true,
  sessionError: null,
  async login(username, password) {
    await axiosInstance.post('/auth/token', new URLSearchParams({ username, password }))
    const { data } = await axiosInstance.get<UsuarioAuth>('/auth/me')
    set({ user: data, checking: false, sessionError: null })
  },
  async register(data) {
    await axiosInstance.post('/auth/register', data)
  },
  async logout() {
    await axiosInstance.post('/auth/logout')
    set({ user: null, checking: false, sessionError: null })
  },
  checkAuth() {
    if (pendingCheck) return pendingCheck
    set({ checking: true, sessionError: null })
    pendingCheck = axiosInstance.get<UsuarioAuth>('/auth/me')
      .then(({ data }) => { set({ user: data, checking: false }) })
      .catch((reason: unknown) => {
        const error = apiError(reason)
        const sessionError = error.message.startsWith('No se pudo conectar') ? error.message : null
        set({ user: null, checking: false, sessionError })
      })
      .finally(() => { pendingCheck = undefined })
    return pendingCheck
  },
  clearAuth() {
    set({ user: null, checking: false, sessionError: null })
  },
}), { name: 'food-store-sesion', partialize: state => ({ user: state.user }) }))
