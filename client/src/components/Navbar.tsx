import { Link } from 'react-router-dom'
import { ShoppingCart, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../stores/cartStore'

export const Navbar = () => {
  const { user, logout } = useAuth()
  const { items } = useCartStore()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              CustomWear
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.name || user.email}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 p-2"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}