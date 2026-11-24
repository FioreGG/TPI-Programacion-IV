import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useCartStore } from '@/store/cartStore'
import { notifyError } from '@/store/notificationStore'
import { useThemeStore } from '@/store/themeStore'

export default function Navbar() {
  const { user, logout } = useAuth()
  const cantidad = useCartStore(state => state.items.reduce((total, item) => total + item.cantidad, 0))
  const darkMode = useThemeStore(state => state.darkMode)
  const toggleTheme = useThemeStore(state => state.toggleTheme)
  const navigate = useNavigate()

  async function cerrarSesion() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof Error) notifyError(error)
    }
  }

  return <header className="bg-slate-900 text-white">
    <nav aria-label="Navegación principal" className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-4">
      <Link to="/" className="mr-auto text-xl font-bold">Food Store</Link>
      <NavLink to="/">Catálogo</NavLink>
      <NavLink to="/carrito">Carrito ({cantidad})</NavLink>
      {user ? <>
        <NavLink to="/mis-pedidos">Mis pedidos</NavLink>
        <span className="text-sm">{user.full_name} · {user.role === 'admin' ? 'Admin' : 'Cliente'}</span>
        <button onClick={() => void cerrarSesion()} className="underline">Cerrar sesión</button>
      </> : <NavLink to="/login">Iniciar sesión</NavLink>}
      <button onClick={toggleTheme} aria-pressed={darkMode} className="rounded border px-2 py-1">Modo oscuro</button>
    </nav>
    {user?.role === 'admin' && <nav aria-label="Administración" className="border-t border-slate-700">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-5 py-3 text-sm">
        <NavLink to="/admin/resumen">Resumen</NavLink>
        <NavLink to="/admin/categorias">Categorías</NavLink>
        <NavLink to="/admin/productos">Productos</NavLink>
        <NavLink to="/admin/pedidos">Pedidos</NavLink>
        <NavLink to="/admin/usuarios">Usuarios</NavLink>
      </div>
    </nav>}
  </header>
}
