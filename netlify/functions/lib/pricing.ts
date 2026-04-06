/**
 * Pricing Constants for Server-side
 * Centralized pricing configuration to ensure consistency between client and server
 */

export const PRICING = {
  // Customization add-ons
  EMBROIDERY_COST: 1245.00, // ₹1,245 (15 USD * 83)
  LOGO_COST: 830.00, // ₹830 (10 USD * 83)

  // Shipping
  STANDARD_SHIPPING: 90.00, // ₹90 flat rate

  // Tax rates (GST in India)
  TAX_RATE: 0.18, // 18% GST

  // Default size pricing modifiers (in INR)
  DEFAULT_SIZE_PRICING: {
    'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 249, 'XXL': 415, '3XL': 664,
    '0-3M': 0, '3-6M': 0, '6-9M': 0, '9-12M': 0, '12-18M': 83, '18-24M': 166,
    '2T': 0, '3T': 0, '4T': 83, '5T': 166, '6T': 249,
    '4': 0, '5': 0, '6': 0, '7': 83, '8': 83, '10': 166, '12': 249, '14': 332, '16': 415,
    'One Size': 0
  } as Record<string, number>,

  // Default color pricing modifiers (in INR)
  DEFAULT_COLOR_PRICING: {
    '#000000': 0, // Black - no extra cost
    '#FFFFFF': 0, // White - no extra cost
    '#808080': 83, // Gray - small premium
    '#FF0000': 166, // Red - medium premium
    '#00FF00': 166, // Green - medium premium
    '#0000FF': 166, // Blue - medium premium
    '#FFFF00': 166, // Yellow - medium premium
    '#FF00FF': 249, // Magenta - high premium
    '#00FFFF': 249, // Cyan - high premium
    '#FFA500': 249, // Orange - high premium
    '#800080': 332, // Purple - premium
    '#FFC0CB': 332, // Pink - premium
    '#A52A2A': 415, // Brown - highest premium
    '#000080': 415, // Navy - highest premium
    '#008000': 415  // Dark Green - highest premium
  } as Record<string, number>
} as const

export const calculateCustomizationPrice = (
  basePrice: number,
  hasEmbroidery: boolean = false,
  hasLogo: boolean = false
): number => {
  let total = basePrice
  if (hasEmbroidery) total += PRICING.EMBROIDERY_COST
  if (hasLogo) total += PRICING.LOGO_COST
  return total
}

export const calculateProductPrice = (
  basePrice: number,
  selectedSize?: string,
  selectedColor?: string,
  sizePricing?: Record<string, number>,
  colorPricing?: Record<string, number>,
  hasEmbroidery: boolean = false,
  hasLogo: boolean = false
): number => {
  let total = basePrice

  // Add size pricing modifier
  if (selectedSize) {
    const sizeModifier = sizePricing?.[selectedSize] ?? PRICING.DEFAULT_SIZE_PRICING[selectedSize] ?? 0
    total += sizeModifier
  }

  // Add color pricing modifier
  if (selectedColor) {
    const colorModifier = colorPricing?.[selectedColor] ?? PRICING.DEFAULT_COLOR_PRICING[selectedColor] ?? 0
    total += colorModifier
  }

  // Add customization costs
  if (hasEmbroidery) total += PRICING.EMBROIDERY_COST
  if (hasLogo) total += PRICING.LOGO_COST

  return total
}

export const calculateOrderTotal = (
  subtotal: number,
  includeShipping: boolean = true,
  includeTax: boolean = false
): number => {
  let total = subtotal
  if (includeShipping) total += PRICING.STANDARD_SHIPPING
  if (includeTax) total += subtotal * PRICING.TAX_RATE
  return total
}