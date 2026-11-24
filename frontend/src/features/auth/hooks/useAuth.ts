import { useAuthStore } from '@/features/auth/store/authStore'

export function useAuth() {
  const user = useAuthStore(state => state.user)
  const checking = useAuthStore(state => state.checking)
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const register = useAuthStore(state => state.register)

  return { user, checking, login, logout, register }
}
