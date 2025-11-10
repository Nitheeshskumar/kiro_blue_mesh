import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, Truck, CheckCircle, XCircle, Clock, Instagram, ExternalLink, Copy, Check, MessageCircle } from 'lucide-react'
import { api } from '../lib/api'
import { Order, OrderStatus } from '../types'
import { generateDTDCTrackingUrl, getInstagramProfileUrl, formatOrderMessage, openWhatsApp, openInstagramDM } from '../lib/instagram'

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Order Pending',
    description: 'Your order is being reviewed'
  },
  PAID: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Payment Confirmed',
    description: 'Payment received, preparing your order'
  },
  SHIPPED: {
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Shipped',
    description: 'Your order is on the way'
  },
  DELIVERED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Delivered',
    description: 'Order delivered successfully'
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Cancelled',
    description: 'Order has been cancelled'
  },
  RETURNED: {
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Returned',
    description: 'Order has been returned'
  }
}

export const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`)
        const orderData = response.data
        setOrder(orderData)

        // Generate order message for copying
        const firstItem = orderData.items[0]
        const shippingInfo = orderData.shippingInfo
        const message = formatOrderMessage({
          orderId: orderData.id,
          productId: firstItem.productId,
          productName: firstItem.product.name,
          size: firstItem.customization.size,
          color: firstItem.customization.color,
          embroidery: firstItem.customization.embroidery?.text,
          price: orderData.totalAmount,
          customerName: shippingInfo.name || shippingInfo.fullName || 'Customer',
          shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`
        })
        setOrderMessage(message)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const getOrderDetails = () => {
    if (!order) return null

    const firstItem = order.items[0]
    const shippingInfo = order.shippingInfo

    return {
      orderId: order.id,
      productId: firstItem.productId,
      productName: firstItem.product.name,
      size: firstItem.customization.size,
      color: firstItem.customization.color,
      embroidery: firstItem.customization.embroidery?.text,
      price: order.totalAmount,
      customerName: shippingInfo.name || shippingInfo.fullName || 'Customer',
      shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`
    }
  }

  const handleContactWhatsApp = () => {
    const orderDetails = getOrderDetails()
    if (!orderDetails) return
    openWhatsApp(orderDetails)
  }

  const handleContactInstagram = () => {
    const orderDetails = getOrderDetails()
    if (!orderDetails) return
    openInstagramDM(orderDetails)
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback: select the text
      const textarea = document.getElementById('order-message-tracking') as HTMLTextAreaElement
      if (textarea) {
        textarea.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg"
        >
          View All Orders
        </button>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Orders
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
        <p className="text-gray-600 mt-1">Order ID: #{order.id}</p>
      </div>

      {/* Current Status Card */}
      <div className={`${currentStatus.bgColor} border-2 border-${currentStatus.color.replace('text-', '')} rounded-lg p-6 mb-8`}>
        <div className="flex items-center gap-4">
          <div className={`${currentStatus.bgColor} p-3 rounded-full`}>
            <StatusIcon className={`w-8 h-8 ${currentStatus.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentStatus.label}</h2>
            <p className="text-gray-700">{currentStatus.description}</p>
          </div>
        </div>
      </div>

      {/* Tracking Information */}
      {order.trackingCode && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Tracking Number</h3>
              <p className="text-2xl font-mono font-bold text-primary-600">{order.trackingCode}</p>
            </div>
            <a
              href={order.trackingUrl || generateDTDCTrackingUrl(order.trackingCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <Truck className="w-5 h-5" />
              Track on DTDC
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
          <div className="space-y-4">
            {order.statusHistory.map((entry, index) => {
              const config = statusConfig[entry.status]
              const Icon = config.icon
              return (
                <div key={index} className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{config.label}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
              <a
                href={`/products/${item.productId}`}
                className="block w-24 h-24 flex-shrink-0"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover rounded hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
              <div className="flex-1">
                <a
                  href={`/products/${item.productId}`}
                  className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {item.product.name}
                </a>
                <p className="text-sm text-gray-600 mt-1">
                  Size: {item.customization.size} | Color: {item.customization.color}
                </p>
                {item.customization.embroidery?.text && (
                  <p className="text-sm text-gray-600">
                    Embroidery: "{item.customization.embroidery.text}"
                  </p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
        <div className="text-gray-700">
          <p className="font-medium">{order.shippingInfo.name || order.shippingInfo.fullName}</p>
          <p>{order.shippingInfo.address}</p>
          <p>
            {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
          </p>
          {order.shippingInfo.phone && <p className="mt-2">Phone: {order.shippingInfo.phone}</p>}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-700 mb-4">
          Have questions about your order? Contact us on WhatsApp or Instagram for quick support.
        </p>

        {/* Contact Buttons */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleContactWhatsApp}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp Support</span>
          </button>

          <button
            onClick={handleContactInstagram}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram Support</span>
          </button>
        </div>

        {/* Copyable Message */}
        <div className="pt-6 border-t border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Order Details Message (Auto-filled or Copy & Paste)
            </label>
            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Message
                </>
              )}
            </button>
          </div>
          <textarea
            id="order-message-tracking"
            value={orderMessage}
            readOnly
            rows={12}
            className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-xs text-gray-600 mt-2">
            💡 Copy this message to share your order details when contacting us on Instagram.
          </p>
        </div>
      </div>
    </div>
  )
}
