import { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
}

interface RecentOrder {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    product: {
      name: string
    }
  }>
}

interface TopProduct {
  id: string
  name: string
  basePrice: number
  _count: {
    orderItems: number
  }
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/stats')
        
        // Ensure we have valid data structure
        if (response.data) {
          setStats(response.data.stats || null)
          setRecentOrders(Array.isArray(response.data.recentOrders) ? response.data.recentOrders : [])
          setTopProducts(Array.isArray(response.data.topProducts) ? response.data.topProducts : [])
          setError(null)
        } else {
          throw new Error('Invalid response structure')
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError('Failed to load dashboard data. Please try refreshing the page.')
        // Set safe defaults
        setStats(null)
        setRecentOrders([])
        setTopProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-300 h-64 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link
          to="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.user?.name || order.user?.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Products
            </h2>
            <Link to="/admin/products" className="text-blue-600 hover:text-blue-700 text-sm">
              Manage All
            </Link>
          </div>
          
          <div className="space-y-3">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-600">${(product.basePrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {product._count?.orderItems || 0} orders
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}