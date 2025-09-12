import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { OrderStory } from '../components/OrderStory'

interface OrderDetails {
  id: string
  totalAmount: number
  items: Array<{
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
  }>
}

export const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      
      try {
        const response = await api.get(`/orders/${orderId}`)
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 h-8 rounded w-1/2"></div>
          <div className="bg-gray-300 h-32 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Link to="/orders" className="btn-primary mt-4">
          View All Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your order. Your custom clothing is being prepared with care.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-green-800">
            <strong>Order #{order.id.slice(-8)}</strong> • Total: ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Order Items with Stories */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Your Custom Creations
        </h2>

        {order.items.map((item, index) => (
          <div key={item.id} className="space-y-4">
            {/* Item Details */}
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {item.customization.previewUrl ? (
                    <img
                      src={item.customization.previewUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{item.product.name}</h3>
                  <p className="text-gray-600">
                    Size: {item.customization.size} • Color: {item.customization.color}
                  </p>
                  {item.customization.embroidery?.text && (
                    <p className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded inline-block mt-1">
                      Embroidery: "{item.customization.embroidery.text}"
                    </p>
                  )}
                  <p className="text-lg font-bold text-primary-600 mt-2">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
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

      {/* Next Steps */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          What happens next?
        </h3>
        <div className="space-y-2 text-blue-800">
          <p>• Your custom designs are being carefully crafted by our artisans</p>
          <p>• You'll receive email updates as your order progresses</p>
          <p>• Estimated delivery: 7-10 business days</p>
          <p>• Track your order anytime in your account</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-8">
        <Link to="/orders" className="btn-primary">
          Track Order
        </Link>
        <Link to="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}