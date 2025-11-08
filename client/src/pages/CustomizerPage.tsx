import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../stores/cartStore'
import { Product } from '../types'
import { ProductPreview } from '../components/ProductPreview'
import { PRICING, formatPrice, calculateCustomizationPrice } from '../constants/pricing'

export const CustomizerPage = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [embroideryText, setEmbroideryText] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`)
        const productData = response.data
        setProduct(productData)
        setSelectedSize(productData.sizes[0] || '')
        setSelectedColor(productData.colors[0] || '#000000')
        setTotalPrice(productData.basePrice)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, navigate])

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      generatePreview()
      calculatePrice()
    }
  }, [product, selectedSize, selectedColor, embroideryText])

  const generatePreview = async () => {
    try {
      // Use the actual product image as preview, or generate one if needed
      if (product && product.images.length > 0) {
        setPreviewUrl(product.images[0])
      } else {
        const response = await api.post('/customizations/preview', {
          productId,
          size: selectedSize,
          color: selectedColor,
          embroidery: embroideryText
        })
        setPreviewUrl(response.data.previewUrl)
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)
      // Fallback to product image if available
      if (product && product.images.length > 0) {
        setPreviewUrl(product.images[0])
      }
    }
  }

  const calculatePrice = () => {
    if (!product) return

    const price = calculateCustomizationPrice(
      product.basePrice,
      !!embroideryText.trim(),
      false // No logo option in this component yet
    )
    setTotalPrice(price)
  }

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      // Create customization
      const customizationResponse = await api.post('/customizations', {
        productId,
        size: selectedSize,
        color: selectedColor,
        embroidery: embroideryText.trim() || null
      })

      const customization = customizationResponse.data

      // Add to cart
      addItem({
        productId: product!.id,
        productName: product!.name,
        customizationId: customization.id,
        size: selectedSize,
        color: selectedColor,
        price: totalPrice,
        quantity: 1,
        previewUrl,
        embroidery: embroideryText.trim() || undefined
      })

      navigate('/cart')
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 aspect-square rounded"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 rounded"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              <div className="bg-gray-300 h-32 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-4">
          <div className="aspect-square">
            <ProductPreview
              productImage={previewUrl || (product?.images[0])}
              productName={product?.name || 'Product'}
              size={selectedSize}
              color={selectedColor}
              embroidery={embroideryText.trim() || undefined}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Customization Panel */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="text-2xl font-bold text-primary-600 mt-4">
              ₹{totalPrice.toFixed(2)}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-3 border rounded-lg font-medium transition-colors ${selectedSize === size
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${selectedColor === color
                    ? 'border-primary-600 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Embroidery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Embroidery (+{formatPrice(PRICING.EMBROIDERY_COST)})
            </label>
            <input
              type="text"
              value={embroideryText}
              onChange={(e) => setEmbroideryText(e.target.value)}
              placeholder="Enter text for embroidery"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              maxLength={20}
            />
            <p className="text-sm text-gray-500 mt-1">
              {embroideryText.length}/20 characters
            </p>
          </div>

          {/* Instagram Order Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Order via Instagram:</span> After checkout, you'll be redirected to Instagram to confirm your order and receive payment details.
                </p>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedSize || !selectedColor}
          >
            Add to Cart - {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  )
}