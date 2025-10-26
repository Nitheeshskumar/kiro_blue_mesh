import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AdminLayout } from './components/AdminLayout'
import { Breadcrumb } from './components/ui/Breadcrumb'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { BrandStoryPage } from './pages/BrandStoryPage'
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
import { initializeStorageBuckets } from './lib/supabaseStorage'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Initialize Supabase Storage buckets on app start
    initializeStorageBuckets().catch(error => {
      console.warn('Failed to initialize storage buckets:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Breadcrumb className="py-4" />
            </div>
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/brand-story" element={<BrandStoryPage />} />
                <Route path="/products/:productId/customize" element={<CustomizerPage />} />
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
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App