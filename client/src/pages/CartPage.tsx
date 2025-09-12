import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { OrderStory } from '../components/OrderStory'
import { ProductPreview } from '../components/ProductPreview'

export const CartPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  const [itemStories, setItemStories] = useState<Record<string, string>>({})

  // Fetch stories for cart items
  useEffect(() => {
    const fetchStories = async () => {
      if (!user || items.length === 0) return

      try {
        const stories: Record<string, string> = {}
        for (const item of items) {
          const response = await api.get(`/customizations/${item.customizationId}`)
          const story = response.data.embroidery?.story || 'Your unique design awaits its story...'
          stories[item.id] = story
        }
        setItemStories(stories)
      } catch (error) {
        console.error('Failed to fetch stories:', error)
      }
    }

    fetchStories()
  }, [items, user])

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(id, newQuantity)
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (items.length === 0) return

    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        customizationId: item.customizationId,
        quantity: item.quantity
      }))

      const response = await api.post('/orders', {
        items: orderItems,
        shippingInfo
      })

      const { order } = response.data

      // Clear cart and redirect to success page with stories
      clearCart()
      navigate(`/order-success/${order.id}`)
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some custom clothing to get started!</p>
        <button
          onClick={() => navigate('/products')}
          className="btn-primary"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20">
                    <ProductPreview
                      productImage={item.previewUrl}
                      productName={item.productName}
                      size={item.size}
                      color={item.color}
                      embroidery={item.embroidery}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Story for this item */}
              {itemStories[item.id] && (
                <OrderStory
                  story={itemStories[item.id]}
                  productName={item.productName}
                  customization={{
                    size: item.size,
                    color: item.color,
                    embroidery: item.embroidery
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$9.99</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${(getTotalPrice() + 9.99).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <input
                type="text"
                placeholder="ZIP Code"
                value={shippingInfo.zipCode}
                onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !shippingInfo.name || !shippingInfo.address}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}