import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Tag
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
]

export const AdminLayout = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const businessName = import.meta.env.VITE_BUSINESS_NAME || 'Willowbrook Clothing'

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this area.</p>
          <Link to="/" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b h-16 flex items-center px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center space-x-2 ml-3">
          <img 
            src="/assets/images/willowbrook-logo.jpeg" 
            alt={businessName} 
            className="w-6 h-6 rounded-full object-cover border border-gray-200 shadow-sm"
          />
          <h1 className="text-lg font-bold text-gray-900">Willowbrook Admin</h1>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/images/willowbrook-logo.jpeg" 
                alt={businessName} 
                className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <h1 className="text-xl font-bold text-gray-900">Willowbrook Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Back to Store"
                onClick={closeSidebar}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button
                onClick={closeSidebar}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== '/admin' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}