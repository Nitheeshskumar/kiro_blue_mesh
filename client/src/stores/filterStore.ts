import { create } from 'zustand'
import { ProductCategory } from '../types'

export interface FilterState {
  selectedCategories: string[]
  priceRange: [number, number]
  searchTerm: string
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular'
}

interface FilterStore extends FilterState {
  // Actions
  setSelectedCategories: (categories: string[]) => void
  toggleCategory: (categoryId: string) => void
  setPriceRange: (range: [number, number]) => void
  setSearchTerm: (term: string) => void
  setSortBy: (sort: FilterState['sortBy']) => void
  clearFilters: () => void
  
  // Computed
  hasActiveFilters: () => boolean
}

const initialState: FilterState = {
  selectedCategories: [],
  priceRange: [0, 1000],
  searchTerm: '',
  sortBy: 'newest'
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,

  setSelectedCategories: (categories) => 
    set({ selectedCategories: categories }),

  toggleCategory: (categoryId) => 
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(categoryId)
        ? state.selectedCategories.filter(id => id !== categoryId)
        : [...state.selectedCategories, categoryId]
    })),

  setPriceRange: (range) => 
    set({ priceRange: range }),

  setSearchTerm: (term) => 
    set({ searchTerm: term }),

  setSortBy: (sort) => 
    set({ sortBy: sort }),

  clearFilters: () => 
    set(initialState),

  hasActiveFilters: () => {
    const state = get()
    return (
      state.selectedCategories.length > 0 ||
      state.searchTerm.length > 0 ||
      state.priceRange[0] > 0 ||
      state.priceRange[1] < 1000
    )
  }
}))