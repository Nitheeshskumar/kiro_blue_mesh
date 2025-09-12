import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useCartStore } from '../stores/cartStore'
import { Product } from '../types'
import { ProductPreview } from '../components/ProductPreview'

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
    
    let price = product.basePrice
    if (embroideryText.trim()) price += 15
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
              ${totalPrice.toFixed(2)}
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
                  className={`py-2 px-3 border rounded-lg font-medium transition-colors ${
                    selectedSize === size
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
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    selectedColor === color
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
              Custom Embroidery (+$15)
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

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full btn-primary py-3 text-lg"
            disabled={!selectedSize || !selectedColor}
          >
            Add to Cart - ${totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  )
}