import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AdminLayout } from './components/AdminLayout'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { CustomizerPage } from './pages/CustomizerPage'
import { CartPage } from './pages/CartPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { UserProfile } from './pages/UserProfile'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ProductManagement } from './pages/admin/ProductManagement'
import { AddProduct } from './pages/admin/AddProduct'
import { EditProduct } from './pages/admin/EditProduct'
import { OrderManagement } from './pages/admin/OrderManagement'
import { UserManagement } from './pages/admin/UserManagement'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/new" element={<AddProduct />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Public Routes */}
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/customize/:productId" element={<CustomizerPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App