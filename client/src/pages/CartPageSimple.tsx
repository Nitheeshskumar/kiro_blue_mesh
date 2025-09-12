import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const CartPageSimple = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleCheckout = () => {
    setLoading(true)
    // Simulate checkout
    setTimeout(() => {
      setLoading(false)
      alert('Order placed successfully!')
      navigate('/orders')
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="text-center py-12">
        <p className="text-gray-600 mb-8">Your cart is empty. Add some custom clothing to get started!</p>
        <button
          onClick={() => navigate('/products')}
          className="btn-primary mr-4"
        >
          Browse Products
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Processing...' : 'Test Checkout'}
        </button>
      </div>
    </div>
  )
}