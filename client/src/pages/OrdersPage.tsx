import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Order, OrderStatus } from '../types'

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PAID]: 'bg-green-100 text-green-800',
  [OrderStatus.SHIPPED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.RETURNED]: 'bg-orange-100 text-orange-800'
}

export const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const response = await api.get('/orders/user')
        setOrders(response.data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchOrders()
    }
  }, [user, authLoading])

  // Show loading while auth is being checked
  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="bg-gray-300 h-4 rounded mb-4"></div>
              <div className="bg-gray-300 h-20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your orders</h1>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
        <a href="/products" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Start Shopping
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Orders</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Order #{order.id.slice(-8)}
                </h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[order.status as OrderStatus]
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {order.trackingCode && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tracking Code:</strong> {order.trackingCode}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    {item.customization.previewUrl ? (
                      <img
                        src={item.customization.previewUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Preview
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.customization.size} • Color: {item.customization.color}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <Eye className="w-4 h-4" />
                View Order Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}