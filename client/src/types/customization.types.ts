// Enhanced customization types for advanced product customization

export interface ColorOption {
  id: string
  name: string
  hexCode: string
  swatchImage?: string
  available: boolean
  priceModifier: number
  description?: string
}

export interface SizeOption {
  id: string
  name: string
  category: 'standard' | 'custom'
  measurements?: MeasurementFields
  available: boolean
  priceModifier: number
}

export interface MeasurementFields {
  chest?: number
  waist?: number
  hips?: number
  shoulderWidth?: number
  armLength?: number
  length?: number
  inseam?: number // for pants
  neckCircumference?: number
  bicep?: number
  wrist?: number
}

export interface SleeveOption {
  id: string
  name: string
  description: string
  image?: string
  priceModifier: number
  available: boolean
  category: 'sleeveless' | 'short' | 'three-quarter' | 'long'
}

export interface CustomOption {
  id: string
  name: string
  type: 'text' | 'image' | 'selection' | 'boolean'
  options?: string[]
  priceModifier: number
  required: boolean
  description?: string
}

export interface CustomizationOptions {
  colors: ColorOption[]
  sizes: SizeOption[]
  sleeves: SleeveOption[]
  customOptions: CustomOption[]
  allowCustomMeasurements: boolean
  measurementGuide?: string
}

export interface CustomerMeasurements {
  id: string
  customerId: string
  measurements: MeasurementFields
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomizationSelection {
  productId: string
  colorId?: string
  sizeId?: string
  sleeveId?: string
  customMeasurements?: MeasurementFields
  customOptions: { [optionId: string]: any }
  totalPriceModifier: number
}

export interface CustomizationPreferences {
  customerId: string
  savedMeasurements?: MeasurementFields
  preferredColors: string[]
  preferredSizes: string[]
  notes?: string
}

// Enhanced product interface with new customization options
export interface EnhancedProduct {
  id: string
  name: string
  description?: string
  category: string
  categories?: string[]
  basePrice: number
  images: string[]
  sizes: string[]
  colors: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // New customization fields
  customizationOptions?: CustomizationOptions
  threeDModelUrl?: string
  materialInfo?: MaterialInfo[]
  careInstructions?: string[]
}

export interface MaterialInfo {
  name: string
  percentage: number
  properties: string[]
}

// Validation interfaces
export interface MeasurementValidation {
  field: keyof MeasurementFields
  min: number
  max: number
  unit: 'inches' | 'cm'
}

export interface CustomizationValidationRules {
  measurements: MeasurementValidation[]
  requiredFields: string[]
  maxCustomOptions: number
}

// Store interfaces for state management
export interface CustomizationState {
  currentSelection: CustomizationSelection | null
  savedPreferences: CustomizationPreferences | null
  isLoading: boolean
  error: string | null
}

export interface CustomizationActions {
  setSelection: (selection: CustomizationSelection) => void
  updateSelection: (updates: Partial<CustomizationSelection>) => void
  clearSelection: () => void
  savePreferences: (preferences: CustomizationPreferences) => void
  loadPreferences: (customerId: string) => Promise<void>
  calculateTotalPrice: (basePrice: number, selection: CustomizationSelection) => number
}