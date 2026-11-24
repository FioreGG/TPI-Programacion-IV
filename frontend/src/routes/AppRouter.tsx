import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AdminUsersPage, LoginPage, RegisterPage } from '@/features/auth'
import { CategoriasPage } from '@/features/categories'
import CatalogoPage from '@/features/products/pages/CatalogoPage'
import ProductsPage from '@/features/products/pages/ProductsPage'
import CarritoPage from '@/features/orders/CarritoPage'
import CheckoutPage from '@/features/orders/CheckoutPage'
import PedidosPage from '@/features/orders/PedidosPage'
import ResumenPage from '@/features/orders/ResumenPage'
import Navbar from '@/shared/components/Navbar'
import UnauthorizedPage from '@/shared/components/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'

function Layout() {
  return <>
    <Navbar />
    <main className="mx-auto max-w-6xl px-5 py-8"><Outlet /></main>
  </>
}

export default function AppRouter() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<CatalogoPage />} />
      <Route path="/carrito" element={<CarritoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/mis-pedidos" element={<PedidosPage key="cliente" />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/resumen" element={<ResumenPage />} />
        <Route path="/admin/categorias" element={<CategoriasPage />} />
        <Route path="/admin/productos" element={<ProductsPage />} />
        <Route path="/admin/pedidos" element={<PedidosPage key="admin" admin />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
