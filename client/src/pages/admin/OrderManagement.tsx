import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { api } from '../../lib/api'

interface Order {
  id: string
  status: string
  totalAmount: number
  trackingCode?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
    customization: {
      size: string
      color: string
    }
  }>
}

const statusIcons = {
  PENDING: Clock,
  PAID: CheckCircle,
  PROCESSING: Package,
  MANUFACTURING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  MANUFACTURING: 'bg-orange-100 text-orange-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const ORDER_STATUSES = [
  'PENDING', 'PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
]

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingCode?: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        ...(trackingCode && { trackingCode })
      })
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 h-8 rounded w-1/3"></div>
          <div className="bg-gray-300 h-64 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          Order Management
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md border">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here when customers place them.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map(order => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package
              const isExpanded = expandedOrder === order.id

              return (
                <div key={order.id} className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[order.status as keyof typeof statusColors]
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="flex items-center gap-4 mb-4">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const newStatus = e.target.value
                        if (newStatus === 'SHIPPED') {
                          const trackingCode = prompt('Enter tracking code:')
                          if (trackingCode) {
                            updateOrderStatus(order.id, newStatus, trackingCode)
                          }
                        } else {
                          updateOrderStatus(order.id, newStatus)
                        }
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>

                    {order.trackingCode && (
                      <div className="text-sm text-gray-600">
                        <strong>Tracking:</strong> {order.trackingCode}
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-gray-600 ml-2">
                                (Size: {item.customization.size}, Color: {item.customization.color})
                              </span>
                            </div>
                            <div className="text-right">
                              <span>{item.quantity} × ${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}