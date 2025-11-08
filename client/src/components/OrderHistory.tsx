import { useState, useEffect } from 'react'
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../lib/api'
import { OrderStory } from './OrderStory'
import { ProductPreview } from './ProductPreview'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    images: string[]
  }
  customization: {
    size: string
    color: string
    embroidery?: any
    previewUrl?: string
  }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  trackingCode?: string
  createdAt: string
  items: OrderItem[]
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
  PAID: 'bg-secondary-100 text-secondary-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  MANUFACTURING: 'bg-orange-100 text-orange-800',
  SHIPPED: 'bg-secondary-100 text-secondary-800',
  DELIVERED: 'bg-secondary-100 text-secondary-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/user')
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 h-6 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <Package className="w-6 h-6" />
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <a href="/products" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Browse Products
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package
            const isExpanded = expandedOrder === order.id

            return (
              <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Order Header */}
                <div 
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                        </p>
                      </div>
                    </div>

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
                  </div>

                  {order.trackingCode && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <strong className="text-blue-800">Tracking:</strong> 
                      <span className="text-blue-600 ml-1">{order.trackingCode}</span>
                    </div>
                  )}
                </div>

                {/* Order Details */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="space-y-3">
                        {/* Item Details */}
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16">
                            <ProductPreview
                              productImage={item.customization.previewUrl}
                              productName={item.product.name}
                              size={item.customization.size}
                              color={item.customization.color}
                              embroidery={item.customization.embroidery?.text}
                              className="w-full h-full"
                            />
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              Size: {item.customization.size} • Color: {item.customization.color}
                            </p>
                            {item.customization.embroidery?.text && (
                              <p className="text-sm text-purple-600">
                                Embroidery: "{item.customization.embroidery.text}"
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Story for this item */}
                        {item.customization.embroidery?.story && (
                          <OrderStory
                            story={item.customization.embroidery.story}
                            productName={item.product.name}
                            customization={{
                              size: item.customization.size,
                              color: item.customization.color,
                              embroidery: item.customization.embroidery?.text
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}