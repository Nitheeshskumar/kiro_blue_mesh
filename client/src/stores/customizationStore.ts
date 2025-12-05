import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  CustomizationSelection, 
  CustomizationPreferences, 
  MeasurementFields,
  CustomizationState,
  CustomizationActions
} from '../types/customization.types'
import { apiClient } from '../lib/api'

interface CustomizationStore extends CustomizationState, CustomizationActions {
  // Additional store-specific methods
  loadCustomizationHistory: (customerId: string) => Promise<void>
  saveCustomizationToHistory: (selection: CustomizationSelection) => Promise<void>
  getRecentCustomizations: () => CustomizationSelection[]
  clearHistory: () => void
}

export const useCustomizationStore = create<CustomizationStore>()(
  persist(
    (set, get) => ({
      // State
      currentSelection: null,
      savedPreferences: null,
      isLoading: false,
      error: null,

      // Actions
      setSelection: (selection: CustomizationSelection) => {
        set({ currentSelection: selection, error: null })
      },

      updateSelection: (updates: Partial<CustomizationSelection>) => {
        const current = get().currentSelection
        if (current) {
          const updated = { ...current, ...updates }
          set({ currentSelection: updated })
        }
      },

      clearSelection: () => {
        set({ currentSelection: null, error: null })
      },

      savePreferences: async (preferences: CustomizationPreferences) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/api/customization/preferences', preferences)
          set({ 
            savedPreferences: response.data,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to save preferences',
            isLoading: false 
          })
        }
      },

      loadPreferences: async (customerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.get(`/api/customization/preferences/${customerId}`)
          set({ 
            savedPreferences: response.data,
            isLoading: false 
          })
        } catch (error) {
          // Preferences might not exist yet, that's okay
          set({ 
            savedPreferences: null,
            isLoading: false 
          })
        }
      },

      calculateTotalPrice: (basePrice: number, selection: CustomizationSelection): number => {
        return basePrice + selection.totalPriceModifier
      },

      // Store-specific methods
      loadCustomizationHistory: async (customerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.get(`/api/customization/history/${customerId}`)
          // Store in localStorage for quick access
          localStorage.setItem('customizationHistory', JSON.stringify(response.data))
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load history',
            isLoading: false 
          })
        }
      },

      saveCustomizationToHistory: async (selection: CustomizationSelection) => {
        try {
          await apiClient.post('/api/customization/history', selection)
          
          // Update local history
          const history = get().getRecentCustomizations()
          const updatedHistory = [selection, ...history.slice(0, 9)] // Keep last 10
          localStorage.setItem('customizationHistory', JSON.stringify(updatedHistory))
        } catch (error) {
          console.error('Failed to save customization to history:', error)
        }
      },

      getRecentCustomizations: (): CustomizationSelection[] => {
        try {
          const history = localStorage.getItem('customizationHistory')
          return history ? JSON.parse(history) : []
        } catch {
          return []
        }
      },

      clearHistory: () => {
        localStorage.removeItem('customizationHistory')
      }
    }),
    {
      name: 'customization-store',
      partialize: (state) => ({
        savedPreferences: state.savedPreferences,
        // Don't persist current selection as it's session-specific
      })
    }
  )
)

// Measurement store for managing customer measurements
interface MeasurementStore {
  measurements: MeasurementFields | null
  isLoading: boolean
  error: string | null
  
  saveMeasurements: (customerId: string, measurements: MeasurementFields) => Promise<void>
  loadMeasurements: (customerId: string) => Promise<void>
  updateMeasurements: (measurements: Partial<MeasurementFields>) => void
  clearMeasurements: () => void
}

export const useMeasurementStore = create<MeasurementStore>()(
  persist(
    (set, get) => ({
      measurements: null,
      isLoading: false,
      error: null,

      saveMeasurements: async (customerId: string, measurements: MeasurementFields) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/api/customization/measurements', {
            customerId,
            measurements
          })
          set({ 
            measurements: response.data.measurements,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to save measurements',
            isLoading: false 
          })
        }
      },

      loadMeasurements: async (customerId: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.get(`/api/customization/measurements/${customerId}`)
          set({ 
            measurements: response.data.measurements,
            isLoading: false 
          })
        } catch (error) {
          // Measurements might not exist yet
          set({ 
            measurements: null,
            isLoading: false 
          })
        }
      },

      updateMeasurements: (measurements: Partial<MeasurementFields>) => {
        const current = get().measurements
        set({ 
          measurements: current ? { ...current, ...measurements } : measurements as MeasurementFields
        })
      },

      clearMeasurements: () => {
        set({ measurements: null, error: null })
      }
    }),
    {
      name: 'measurement-store',
      partialize: (state) => ({
        measurements: state.measurements
      })
    }
  )
)

// Cart integration helpers
export const addCustomizationToCart = async (
  selection: CustomizationSelection,
  basePrice: number,
  quantity: number = 1
) => {
  try {
    const totalPrice = basePrice + selection.totalPriceModifier
    
    const cartItem = {
      productId: selection.productId,
      customization: selection,
      quantity,
      price: totalPrice
    }

    const response = await apiClient.post('/api/cart/add', cartItem)
    
    // Save to customization history
    const store = useCustomizationStore.getState()
    await store.saveCustomizationToHistory(selection)
    
    return response.data
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to add to cart')
  }
}

// Utility functions for working with customizations
export const customizationUtils = {
  // Check if a customization is complete
  isCustomizationComplete: (selection: CustomizationSelection, requiredFields: string[] = []): boolean => {
    const hasBasicSelection = selection.colorId && selection.sizeId
    const hasRequiredCustomOptions = requiredFields.every(field => 
      selection.customOptions[field] !== undefined
    )
    return !!hasBasicSelection && hasRequiredCustomOptions
  },

  // Calculate price breakdown
  getPriceBreakdown: (basePrice: number, selection: CustomizationSelection) => {
    const breakdown = {
      base: basePrice,
      color: 0,
      size: 0,
      sleeve: 0,
      customOptions: 0,
      total: basePrice
    }

    // This would need to be populated with actual price data from the product
    breakdown.total = basePrice + selection.totalPriceModifier
    
    return breakdown
  },

  // Generate a summary string for the customization
  getCustomizationSummary: (selection: CustomizationSelection): string => {
    const parts = []
    
    if (selection.colorId) parts.push(`Color: ${selection.colorId}`)
    if (selection.sizeId) parts.push(`Size: ${selection.sizeId}`)
    if (selection.sleeveId) parts.push(`Sleeves: ${selection.sleeveId}`)
    if (selection.customMeasurements) parts.push('Custom Fit')
    
    const optionCount = Object.keys(selection.customOptions).length
    if (optionCount > 0) parts.push(`${optionCount} custom option${optionCount > 1 ? 's' : ''}`)
    
    return parts.join(', ')
  },

  // Validate measurements
  validateMeasurements: (measurements: MeasurementFields): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Basic validation - measurements should be positive numbers
    Object.entries(measurements).forEach(([key, value]) => {
      if (value !== undefined && (value <= 0 || value > 100)) {
        errors.push(`${key} measurement seems invalid`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}