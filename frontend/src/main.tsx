import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { notifyError } from '@/store/notificationStore'
import { useThemeStore } from '@/store/themeStore'
import { ApiError } from '@/shared/api/api'
import '@/shared/api/setupInterceptors'
import './index.css'
import App from './App'

const client = new QueryClient({
  queryCache: new QueryCache({ onError: notifyError }),
  defaultOptions: {
    queries: {
      retry: (count, error) => count < 3 && !(error instanceof ApiError && error.status < 500),
    },
  },
})

useAuthStore.subscribe(({ user }, previous) => {
  if (previous.user && previous.user.id !== user?.id) client.clear()
})

function applyTheme(darkMode: boolean) {
  document.documentElement.classList.toggle('dark', darkMode)
}
applyTheme(useThemeStore.getState().darkMode)
useThemeStore.subscribe(({ darkMode }) => applyTheme(darkMode))

try {
  localStorage.removeItem('tp-unidad9-auth')
} catch {
  // El navegador puede bloquear el acceso al almacenamiento.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
