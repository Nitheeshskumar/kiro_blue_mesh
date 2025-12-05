import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Product API functions
export const productApi = {
  // Get all products with optional filtering
  getProducts: async (filters?: {
    category?: string
    categories?: string[]
    search?: string
  }) => {
    const params = new URLSearchParams()
    
    if (filters?.category) {
      params.append('category', filters.category)
    }
    
    if (filters?.categories && filters.categories.length > 0) {
      params.append('categories', filters.categories.join(','))
    }
    
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    const response = await api.get(`/products?${params.toString()}`)
    return response.data
  },

  // Get product by ID
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Get all categories with product counts
  getCategories: async () => {
    const response = await api.get('/products/categories/all')
    return response.data
  },

  // Create product (admin only)
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  // Update product (admin only)
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  // Delete product (admin only)
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  }
}

// Customization API functions
export const customizationApi = {
  // Get customer measurements
  getMeasurements: async (customerId: string) => {
    const response = await api.get(`/customizations/measurements/${customerId}`)
    return response.data
  },

  // Save customer measurements
  saveMeasurements: async (customerId: string, measurements: any, notes?: string) => {
    const response = await api.post('/customizations/measurements', {
      customerId,
      measurements,
      notes
    })
    return response.data
  },

  // Get customization preferences
  getPreferences: async (customerId: string) => {
    const response = await api.get(`/customizations/preferences/${customerId}`)
    return response.data
  },

  // Save customization preferences
  savePreferences: async (preferences: any) => {
    const response = await api.post('/customizations/preferences', preferences)
    return response.data
  },

  // Get customization history
  getHistory: async (customerId: string, limit = 10, offset = 0) => {
    const response = await api.get(`/customizations/history/${customerId}?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Save customization to history
  saveToHistory: async (customization: any) => {
    const response = await api.post('/customizations/history', customization)
    return response.data
  },

  // Get product with customization options
  getProductWithCustomization: async (productId: string) => {
    const response = await api.get(`/customizations/product/${productId}`)
    return response.data
  },

  // Calculate customization price
  calculatePrice: async (productId: string, selection: any) => {
    const response = await api.post('/customizations/calculate-price', {
      productId,
      selection
    })
    return response.data
  },

  // Update product customization options (admin only)
  updateProductCustomization: async (productId: string, customizationData: any) => {
    const response = await api.put(`/customizations/product/${productId}`, customizationData)
    return response.data
  }
}

// Export the main API client for backward compatibility
export const apiClient = api