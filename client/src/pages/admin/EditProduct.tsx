import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X, Save, Ruler, DollarSign } from 'lucide-react'
import { api } from '../../lib/api'
import { SizingChart } from '../../components/SizingChart'
import { PRICING } from '../../constants/pricing'

interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
}

const SIZES = [
  // Baby sizes
  "0-3 months", "3-6 months", "6-9 months", "9-12 months", "12-18 months", "18-24 months",
  // Kids sizes
  "3", "4", "5", "6", "7", "8", "10", "12", "14", "16",
  // Adult sizes
  "XS", "S", "M", "L", "XL", "XXL", "3XL"
]

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
]

interface Product {
  id: string
  name: string
  description: string
  category: string
  categories?: string[]
  basePrice: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  hasFixedColors?: boolean
  colorType?: 'customizable' | 'fixed'
  sizePricing?: Record<string, number>
  colorPricing?: Record<string, number>
}

export const EditProduct = () => {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showSizingChart, setShowSizingChart] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    categories: [] as string[],
    basePrice: '',
    images: [''],
    sizes: ['M'],
    colors: ['#000000'],
    isActive: true,
    colorType: 'customizable' as 'customizable' | 'fixed',
    hasFixedColors: false,
    sizePricing: {} as Record<string, number>,
    colorPricing: {} as Record<string, number>,
  })

  useEffect(() => {
    fetchCategories()
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/all')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${productId}`)
      const productData = response.data
      setProduct(productData)
      setFormData({
        name: productData.name,
        description: productData.description || '',
        category: productData.category,
        categories: productData.categories || [],
        basePrice: productData.basePrice.toString(),
        images: productData.images.length > 0 ? productData.images : [''],
        sizes: productData.sizes,
        colors: productData.colors,
        isActive: productData.isActive,
        colorType: productData.colorType || 'customizable',
        hasFixedColors: productData.hasFixedColors || false,
        sizePricing: productData.sizePricing || {},
        colorPricing: productData.colorPricing || {},
      })
    } catch (error) {
      console.error('Failed to fetch product:', error)
      alert('Failed to load product. Please try again.')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const updateImageUrl = (index: number, url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? url : img)
    }))
  }

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const addColor = (color: string) => {
    if (!formData.colors.includes(color)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, color]
      }))
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        images: formData.images.filter(img => img.trim() !== ''),
        sizePricing: formData.sizePricing,
        colorPricing: formData.colorType === 'customizable' ? formData.colorPricing : {},
      }

      await api.put(`/products/${productId}`, productData)
      navigate('/admin/products')
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!confirm('⚠️ DEACTIVATE PRODUCT\n\nAre you sure you want to deactivate this product?\n\nThis will:\n• Hide the product from customers\n• Preserve all product data\n• Allow you to reactivate it later\n\nYou can reactivate it anytime using the Active/Inactive toggle.')) {
      return
    }

    try {
      await api.delete(`/products/${productId}`)
      alert('Product has been deactivated successfully.')
      // Update the form data to reflect the change
      setFormData(prev => ({ ...prev, isActive: false }))
    } catch (error) {
      console.error('Failed to deactivate product:', error)
      alert('Failed to deactivate product. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-300 h-8 rounded w-1/3"></div>
          <div className="bg-gray-300 h-64 rounded"></div>
          <div className="bg-gray-300 h-32 rounded"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Products
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
          
          {/* {formData.isActive && (
            <button
              onClick={handleDeactivate}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium border-2 border-orange-600 hover:border-orange-700 transition-all"
            >
              <EyeOff className="w-4 h-4" />
              Deactivate Product
            </button>
          )} */}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Classic Cotton T-Shirt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={loadingCategories}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option>No categories available</option>
                ) : (
                  <>
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="25.00"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your product..."
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
          
          <div className="space-y-3">
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addImageUrl}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Another Image
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Sizes</h2>
            <button
              type="button"
              onClick={() => setShowSizingChart(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Ruler className="w-4 h-4" />
              <span>Size Chart</span>
            </button>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`py-2 px-3 border rounded-lg font-medium transition-colors ${
                  formData.sizes.includes(size)
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Options</h2>

          {/* Color Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.colorType === 'customizable' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="colorType"
                  value="customizable"
                  checked={formData.colorType === 'customizable'}
                  onChange={(e) => {
                    handleInputChange('colorType', e.target.value)
                    handleInputChange('hasFixedColors', false)
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Customizable Colors</div>
                  <div className="text-sm text-gray-600">
                    Customers can choose from available color options
                  </div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.colorType === 'fixed' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="colorType"
                  value="fixed"
                  checked={formData.colorType === 'fixed'}
                  onChange={(e) => {
                    handleInputChange('colorType', e.target.value)
                    handleInputChange('hasFixedColors', true)
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Fixed Colors</div>
                  <div className="text-sm text-gray-600">
                    Colors are part of the design/image (e.g., prints, patterns)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Color Options based on type */}
          {formData.colorType === 'customizable' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">Selected Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map(color => (
                    <div key={color} className="relative">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-3">Add Colors:</p>
                <div className="grid grid-cols-8 md:grid-cols-15 gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => addColor(color)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Description
                </label>
                <input
                  type="text"
                  value={formData.colors[0] || ''}
                  onChange={(e) => handleInputChange('colors', [e.target.value])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., As Shown in Image, Floral Pattern, Original Design"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the fixed color/pattern that customers will see in the product images
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Fixed Color Product</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This product will show the colors/patterns as they appear in the uploaded images. 
                      Customers won't be able to change colors during customization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Size Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Size Pricing Modifiers</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Set additional charges for different sizes. Leave at 0 for no extra cost.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.sizes.map((size) => (
              <div key={size} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {size}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sizePricing[size] || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      handleInputChange('sizePricing', {
                        ...formData.sizePricing,
                        [size]: value
                      })
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Default: ₹{PRICING.DEFAULT_SIZE_PRICING[size] || 0}
                </p>
              </div>
            ))}
          </div>
          
          {formData.sizes.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Select sizes above to configure pricing modifiers
            </p>
          )}
        </div>

        {/* Color Pricing */}
        {formData.colorType === 'customizable' && (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Color Pricing Modifiers</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set additional charges for different colors. Leave at 0 for no extra cost.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.colors.map((color) => (
                <div key={color} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.colorPricing[color] || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        handleInputChange('colorPricing', {
                          ...formData.colorPricing,
                          [color]: value
                        })
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Default: ₹{PRICING.DEFAULT_COLOR_PRICING[color] || 0}
                  </p>
                </div>
              ))}
            </div>
            
            {formData.colors.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Select colors above to configure pricing modifiers
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Sizing Chart Modal */}
      <SizingChart
        isOpen={showSizingChart}
        onClose={() => setShowSizingChart(false)}
        availableSizes={formData.sizes}
        selectedSizes={[]} // No specific selection in admin, just showing available sizes
      />
    </div>
  )
}