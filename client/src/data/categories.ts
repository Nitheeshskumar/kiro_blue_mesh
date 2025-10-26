import { ProductCategory } from '../types'

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'mother-daughter',
    name: 'Mother & Daughter Collections',
    slug: 'mother-daughter',
    description: 'Matching outfits for special bonding moments',
    icon: '👩‍👧',
    productCount: 0, // Will be updated dynamically
  },
  {
    id: 'birthday-celebration',
    name: 'Birthday Celebration Outfits',
    slug: 'birthday-celebration',
    description: 'Festive wear for memorable celebrations',
    icon: '🎂',
    productCount: 0,
  },
  {
    id: 'cotton-essentials',
    name: 'Everyday Cotton Essentials',
    slug: 'cotton-essentials',
    description: 'Comfortable daily wear in premium cotton',
    icon: '👕',
    productCount: 0,
  },
  {
    id: 'maternity',
    name: 'Maternity Collection',
    slug: 'maternity',
    description: 'Stylish and comfortable clothing for expecting mothers',
    icon: '🤱',
    productCount: 0,
  },
  {
    id: 'newborn-essentials',
    name: 'Newborn Essentials',
    slug: 'newborn-essentials',
    description: 'Soft, safe clothing for babies 0-12 months',
    icon: '👶',
    productCount: 0,
  },
  {
    id: 'accessories',
    name: 'Accessories & Add-ons',
    slug: 'accessories',
    description: 'Complementary items like scarves, belts, jewelry',
    icon: '👜',
    productCount: 0,
  },
  {
    id: 'kids-coordinated',
    name: 'Kids Coordinated Sets',
    slug: 'kids-coordinated',
    description: 'Mix-and-match pieces for children',
    icon: '👦',
    productCount: 0,
  },
]

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): ProductCategory | undefined => {
  return PRODUCT_CATEGORIES.find(category => category.slug === slug)
}

// Helper function to get category by id
export const getCategoryById = (id: string): ProductCategory | undefined => {
  return PRODUCT_CATEGORIES.find(category => category.id === id)
}

// Helper function to get all category slugs
export const getAllCategorySlugs = (): string[] => {
  return PRODUCT_CATEGORIES.map(category => category.slug)
}