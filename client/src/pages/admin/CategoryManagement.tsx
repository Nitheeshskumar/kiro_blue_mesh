import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Tag, Package } from 'lucide-react'
import { api } from '../../lib/api'

interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  productCount: number
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
}

const AVAILABLE_ICONS = [
  '👕', '👔', '👗', '👖', '🧥', '👒', '👟', '👠', 
  '👜', '🎒', '🧢', '🧣', '🧤', '👶', '🤱', '🎉'
]

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '👕'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      alert('Failed to load categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Category name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Category name must be less than 50 characters'
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters'
    } else if (formData.description.trim().length > 200) {
      errors.description = 'Description must be less than 200 characters'
    }

    if (!formData.icon) {
      errors.icon = 'Please select an icon'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '👕'
    })
    setFormErrors({})
  }

  const handleAdd = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  const handleDelete = (category: ProductCategory) => {
    setSelectedCategory(category)
    setShowDeleteModal(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await api.post('/admin/categories', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon
      })
      
      await fetchCategories()
      setShowAddModal(false)
      resetForm()
      alert('Category created successfully!')
    } catch (error: any) {
      console.error('Failed to create category:', error)
      if (error.response?.status === 409) {
        setFormErrors({ name: 'A category with this name already exists' })
      } else {
        alert('Failed to create category. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !selectedCategory) return

    setSubmitting(true)
    try {
      await api.put(`/admin/categories/${selectedCategory.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon
      })
      
      await fetchCategories()
      setShowEditModal(false)
      setSelectedCategory(null)
      resetForm()
      alert('Category updated successfully!')
    } catch (error: any) {
      console.error('Failed to update category:', error)
      if (error.response?.status === 409) {
        setFormErrors({ name: 'A category with this name already exists' })
      } else {
        alert('Failed to update category. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitDelete = async () => {
    if (!selectedCategory) return

    setSubmitting(true)
    try {
      await api.delete(`/admin/categories/${selectedCategory.id}`)
      
      await fetchCategories()
      setShowDeleteModal(false)
      setSelectedCategory(null)
      alert('Category deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      if (error.response?.status === 400) {
        alert('Cannot delete category: It contains products. Please move or delete all products in this category first.')
      } else {
        alert('Failed to delete category. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage product categories and organization</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first category.'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={handleAdd}
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Category
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {category.productCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-primary-600 hover:text-primary-700 p-1 rounded"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-700 p-1 rounded"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Category</h2>
            
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., T-Shirts"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe this category..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 text-xl border rounded-lg hover:bg-gray-50 ${
                        formData.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {formErrors.icon && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.icon}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Category</h2>
            
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., T-Shirts"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe this category..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 text-xl border rounded-lg hover:bg-gray-50 ${
                        formData.icon === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {formErrors.icon && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.icon}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Category</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the category "{selectedCategory.name}"?
              </p>
              
              {selectedCategory.productCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        This category contains {selectedCategory.productCount} product(s). 
                        You must move or delete all products before deleting this category.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDelete}
                disabled={submitting || selectedCategory.productCount > 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}