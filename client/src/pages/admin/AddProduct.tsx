import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Upload, Link, Image as ImageIcon } from 'lucide-react'
import { api } from '../../lib/api'
import { SupabaseUploadWidget, type SupabaseUploadResult } from '../../components/SupabaseUploadWidget'
import { STORAGE_BUCKETS, validateProductImage } from '../../lib/supabaseStorage'

interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
]

interface ProductImage {
  id: string;
  url: string;
  type: 'upload' | 'url';
  file?: File;
  uploading?: boolean;
}

export const AddProduct = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    categories: [] as string[],
    basePrice: '',
    images: [] as ProductImage[],
    sizes: ['M'],
    colors: ['#000000']
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/all')
      const fetchedCategories = response.data
      setCategories(fetchedCategories)

      // Set default category to first one if available
      if (fetchedCategories.length > 0 && !formData.category) {
        setFormData(prev => ({
          ...prev,
          category: fetchedCategories[0].id
        }))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addImageUrl = () => {
    const newImage: ProductImage = {
      id: `url-${Date.now()}`,
      url: '',
      type: 'url'
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }))
  }

  const removeImage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }))
  }

  const updateImageUrl = (id: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === id ? { ...img, url } : img
      )
    }))
  }

  const handleImageUpload = (results: SupabaseUploadResult[]) => {
    const newImages: ProductImage[] = results.map(result => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      url: result.publicUrl,
      type: 'upload'
    }))

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
  }

  const handleUploadError = (error: string) => {
    console.error('Image upload error:', error)
    alert(`Image upload failed: ${error}`)
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

    // Validate that we have at least one image
    const validImages = formData.images.filter(img => img.url.trim() !== '')
    if (validImages.length === 0) {
      alert('Please add at least one product image.')
      return
    }

    setLoading(true)

    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        images: validImages.map(img => img.url)
      }

      await api.post('/products', productData)
      navigate('/admin/products')
    } catch (error) {
      console.error('Failed to create product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
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

          {/* Additional Categories */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Categories (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Select additional categories this product belongs to
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(category => (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.categories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...formData.categories, category.id]
                        : formData.categories.filter(c => c !== category.id)
                      handleInputChange('categories', newCategories)
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    {category.icon} {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>

          {/* Upload Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Images</h3>
            <SupabaseUploadWidget
              onUpload={handleImageUpload}
              onError={handleUploadError}
              bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
              path="products"
              maxFiles={10}
              maxSizeMB={7}
              validateFile={validateProductImage}
              disabled={loading || uploadingImages}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to 7MB each
                </p>
              </div>
            </SupabaseUploadWidget>
          </div>

          {/* Current Images */}
          {formData.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {image.url ? (
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyVjdBMiAyIDAgMCAwIDE5IDVINUEyIDIgMCAwIDAgMyA3VjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1YxMloiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTMgMTNMMTAgNkwxNiAxMkwyMSA3IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Image type indicator */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${image.type === 'upload'
                        ? 'bg-secondary-100 text-secondary-800'
                        : 'bg-primary-100 text-primary-800'
                        }`}>
                        {image.type === 'upload' ? 'Uploaded' : 'URL'}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* URL input for URL type images */}
                    {image.type === 'url' && (
                      <div className="mt-2">
                        <input
                          type="url"
                          value={image.url}
                          onChange={(e) => updateImageUrl(image.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Image URL"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add URL Option */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={addImageUrl}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Link className="w-4 h-4" />
              Add Image URL
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Sizes</h2>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`py-2 px-3 border rounded-lg font-medium transition-colors ${formData.sizes.includes(size)
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Colors</h2>

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
        </div>

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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}