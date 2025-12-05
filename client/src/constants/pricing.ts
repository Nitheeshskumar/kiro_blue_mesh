/**
 * Pricing Constants
 * Centralized pricing configuration to ensure consistency between client and server
 */

export const PRICING = {
  // Customization add-ons
  EMBROIDERY_COST: 1245.00, // ₹1,245 (15 USD * 83)
  LOGO_COST: 830.00, // ₹830 (10 USD * 83)
  
  // Shipping
  STANDARD_SHIPPING: 829.00, // ₹829 (9.99 USD * 83)
  
  // Tax rates (GST in India)
  TAX_RATE: 0.18, // 18% GST
} as const

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price)
}

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