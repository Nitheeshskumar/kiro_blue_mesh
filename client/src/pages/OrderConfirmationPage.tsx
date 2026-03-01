import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, /* Instagram, */ Package, MapPin, Copy, Check, MessageCircle } from 'lucide-react'
import { api } from '../lib/api'
import { Order } from '../types'
import { /* openInstagramDM, */ openWhatsApp, formatOrderMessage } from '../lib/instagram'
import { getProxiedImageUrl } from '../lib/imageUtils';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState</* 'instagram' | */ 'whatsapp' | null>(null)
  const [copied, setCopied] = useState(false)
  const [orderMessage, setOrderMessage] = useState('')

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

  // Instagram functionality temporarily disabled
  // const handleContactInstagram = () => {
  //   const orderDetails = getOrderDetails()
  //   if (!orderDetails) return

  //   setRedirecting('instagram')
  //   openInstagramDM(orderDetails)

  //   // Re-enable button after 5 seconds
  //   setTimeout(() => {
  //     setRedirecting(null)
  //   }, 5000)
  // }

  const handleContactWhatsApp = () => {
    const orderDetails = getOrderDetails()
    if (!orderDetails) return

    setRedirecting('whatsapp')
    openWhatsApp(orderDetails)

    // Re-enable button after 5 seconds
    setTimeout(() => {
      setRedirecting(null)
    }, 5000)
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`)
        const orderData = response.data
        setOrder(orderData)

        // Generate order message
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
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, navigate])

  // No auto-redirect - let user choose their preferred contact method

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback: select the text
      const textarea = document.getElementById('order-message') as HTMLTextAreaElement
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-lg text-gray-600">
          Order ID: <span className="font-semibold">#{order.id}</span>
        </p>
      </div>

      {/* Contact Options Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Contact Us on WhatsApp
        </h2>
        <p className="text-gray-700 mb-6">
          Contact us on WhatsApp to confirm your order and receive payment details:
        </p>

        {/* Contact Button */}
        <div className="mb-6">
          {/* WhatsApp Button */}
          <button
            onClick={handleContactWhatsApp}
            disabled={redirecting === 'whatsapp'}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-6 rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            <div className="text-center">
              <div className="font-semibold">Contact on WhatsApp</div>
              <div className="text-xs text-green-100">
                {redirecting === 'whatsapp' ? 'Opening WhatsApp...' : 'Quick & Easy Order Confirmation'}
              </div>
            </div>
          </button>

          {/* Instagram Button - Commented Out */}
          {/* <button
            onClick={handleContactInstagram}
            disabled={redirecting === 'instagram'}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            <Instagram className="w-6 h-6" />
            <div className="text-left flex-1">
              <div className="font-semibold">Instagram</div>
              <div className="text-xs text-purple-100">
                {redirecting === 'instagram' ? 'Opening Instagram...' : 'DM Us Directly'}
              </div>
            </div>
          </button> */}
        </div>

        {/* Copyable Message */}
        <div className="pt-6 border-t border-green-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Order Message (Auto-filled for WhatsApp or Copy & Paste)
            </label>
            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
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
            id="order-message"
            value={orderMessage}
            readOnly
            rows={12}
            className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
          <p className="text-xs text-gray-600 mt-2">
            💡 The message will be pre-filled when you click the WhatsApp button above. If not, copy and paste it manually.
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

        {/* Order Items */}
        <div className="space-y-4 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <a
                href={`/products/${item.productId}`}
                className="block w-20 h-20 flex-shrink-0"
              >
                <img
                  src={getProxiedImageUrl(item.product.images[0])}
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
                <p className="text-sm text-gray-600">
                  Size: {item.customization.size} | Color: {item.customization.color}
                </p>
                {item.customization.embroidery?.text && (
                  <p className="text-sm text-gray-600">
                    Embroidery: "{item.customization.embroidery.text}"
                  </p>
                )}
                <p className="text-sm font-medium text-gray-900 mt-1">
                  Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
        </div>
        <div className="text-gray-700">
          <p className="font-medium">{order.shippingInfo.name || order.shippingInfo.fullName}</p>
          <p>{order.shippingInfo.address}</p>
          <p>
            {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
          </p>
          {order.shippingInfo.phone && <p>Phone: {order.shippingInfo.phone}</p>}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Package className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Contact us via WhatsApp using the button above</li>
              <li>We'll confirm your order and share payment details</li>
              <li>Once payment is received, we'll start processing</li>
              <li>You'll receive tracking details when shipped</li>
              <li>Track your order anytime from "My Orders"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
        >
          View My Orders
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}
