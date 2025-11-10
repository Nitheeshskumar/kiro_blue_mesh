import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, MapPin, X } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { OrderStory } from '../components/OrderStory'
import { ProductPreview } from '../components/ProductPreview'
import { PRICING, formatPrice } from '../constants/pricing'
import { SavedAddress } from '../types'

export const CartPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  })
  const [itemStories, setItemStories] = useState<Record<string, string>>({})

  // Fetch saved addresses and stories
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      // Fetch saved addresses
      try {
        const addressResponse = await api.get('/addresses')
        const addresses = addressResponse.data
        setSavedAddresses(addresses)

        // Auto-select default address
        const defaultAddress = addresses.find((addr: SavedAddress) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setShippingInfo({
            name: defaultAddress.fullName,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipCode: defaultAddress.zipCode,
            country: defaultAddress.country
          })
        } else if (addresses.length === 0) {
          setUseNewAddress(true)
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
        setUseNewAddress(true)
      }
    }

    fetchData()
  }, [user])

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

  const handleAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(addr => addr.id === addressId)
    if (address) {
      setSelectedAddressId(addressId)
      setUseNewAddress(false)
      setShippingInfo({
        name: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country
      })
    }
  }

  const handleClearAddress = () => {
    setSelectedAddressId(null)
    setUseNewAddress(true)
    setShippingInfo({
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (items.length === 0) return

    // Validation
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      alert('Please fill in all shipping information')
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        customizationId: item.customizationId,
        quantity: item.quantity
      }))

      const response = await api.post('/orders', {
        items: orderItems,
        shippingInfo,
        contactMethod: 'INSTAGRAM' // Set contact method
      })

      const { order } = response.data

      // Clear cart and redirect to order confirmation page
      clearCart()
      navigate(`/order-confirmation/${order.id}`)
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
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                      ₹{item.price.toFixed(2)}
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
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{PRICING.STANDARD_SHIPPING.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{(getTotalPrice() + PRICING.STANDARD_SHIPPING).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !useNewAddress && (
              <div className="space-y-3 mb-4">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{address.label}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{address.fullName}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.address}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleClearAddress}
                  className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
                >
                  + Use a different address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(useNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-3">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">New Address</span>
                    <button
                      onClick={() => {
                        setUseNewAddress(false)
                        if (savedAddresses.length > 0) {
                          const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0]
                          handleAddressSelect(defaultAddr.id)
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <textarea
                  placeholder="Address *"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City *"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pincode *"
                  value={shippingInfo.zipCode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>

          {/* Instagram Order Notice */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  📱 Next: Confirm on Instagram
                </p>
                <p className="text-xs text-gray-700">
                  After checkout, you'll be redirected to Instagram to confirm your order and receive payment details. Your order will be confirmed once we connect!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !shippingInfo.name || !shippingInfo.address}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}