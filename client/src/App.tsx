import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AdminLayout } from './components/AdminLayout'
import { Footer } from './components/Footer'
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
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { OrderTrackingPage } from './pages/OrderTrackingPage'
import { UserProfile } from './pages/UserProfile'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ProductManagement } from './pages/admin/ProductManagement'
import { AddProduct } from './pages/admin/AddProduct'
import { EditProduct } from './pages/admin/EditProduct'
import { OrderManagement } from './pages/admin/OrderManagement'
import { UserManagement } from './pages/admin/UserManagement'
import { AuthProvider } from './contexts/AuthContext'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Supabase Storage buckets are already created server-side
    // No client-side initialization needed
    console.log('Willowbrook Clothing app initialized');
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
              <div className="min-h-screen bg-gradient-to-br from-secondary-50/30 via-white to-primary-50/30">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Breadcrumb className="py-4" />
                </div>
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/brand-story" element={<BrandStoryPage />} />
                    <Route path="/products/:productId" element={<CustomizerPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App